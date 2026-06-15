-- ============================================================================
-- Influenza — MVP database schema (Supabase / Postgres)
-- Source of truth for the data model. See docs/03-database-design.md.
-- Apply with: supabase db push  (or paste into the SQL editor)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- enums -----------------------------------------------------------
create type user_role        as enum ('influencer', 'business', 'admin');
create type ig_account_type  as enum ('business', 'creator', 'personal', 'unknown');
create type hiring_status     as enum ('actively_looking', 'looking_out', 'not_looking');
create type swipe_direction   as enum ('left', 'right');
create type pitch_status      as enum ('sent', 'accepted', 'declined', 'expired');
create type deal_status       as enum ('draft','accepted','funded','in_progress','submitted','verified','released','completed','disputed','refunded','cancelled');

-- ---------- reference: locations & niches -----------------------------------
create table locations (
  id          bigint generated always as identity primary key,
  city        text not null,
  state       text,
  country     text default 'India',
  geo_lat     numeric(9,6),                  -- city centroid (optional)
  geo_lng     numeric(9,6),
  created_at  timestamptz default now(),
  unique (city)
);

create table niches (
  id          bigint generated always as identity primary key,
  -- top-level: food_drinks | service | product
  category    text not null,
  subtopic    text,                          -- e.g. 'cafe', 'street_food'
  unique (category, subtopic)
);

-- ---------- identity --------------------------------------------------------
create table app_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,                 -- references auth.users.id (Supabase)
  role          user_role not null,
  email         text,
  -- Instagram linkage
  ig_user_id        text unique,
  ig_account_type   ig_account_type default 'unknown',
  ig_token_ref      text,                    -- pointer into Supabase Vault (never raw token)
  ig_token_expires  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ---------- influencer ------------------------------------------------------
create table influencer_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references app_users(id) on delete cascade,
  display_name  text not null,
  handle        text not null,
  bio           text,
  location_id   bigint references locations(id),
  geo_lat       numeric(9,6),                -- influencer's own point (geofence later)
  geo_lng       numeric(9,6),
  video_pitch_url text,                      -- Supabase Storage
  published     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- cached, denormalized stats — the swipe deck reads ONLY this table
create table influencer_stats (
  influencer_id   uuid primary key references influencer_profiles(id) on delete cascade,
  followers       integer default 0,
  avg_views       integer default 0,
  avg_likes       integer default 0,
  avg_comments    integer default 0,
  reach_24h       integer default 0,
  impressions_24h integer default 0,
  profile_views_24h integer default 0,
  posts_sampled   integer default 0,
  -- engagement_rate = ((avg_likes + avg_comments) / NULLIF(followers,0)) * 100
  engagement_rate numeric(6,2) default 0,
  computed_at     timestamptz default now()
);

-- audience demographics — aggregated only, never per-follower
create table audience_demographics (
  influencer_id   uuid primary key references influencer_profiles(id) on delete cascade,
  age_buckets     jsonb default '{}'::jsonb,  -- {"13-17":2.1,"18-24":34.5,...}  (percent)
  gender_split    jsonb default '{}'::jsonb,  -- {"male":42.0,"female":56.5,"other":1.5}
  top_locations   jsonb default '[]'::jsonb,  -- [{"city":"Bengaluru","pct":61.2}, ...]
  computed_at     timestamptz default now()
);

create table influencer_niches (
  influencer_id   uuid references influencer_profiles(id) on delete cascade,
  niche_id        bigint references niches(id) on delete cascade,
  primary key (influencer_id, niche_id)
);

-- ---------- services & packages (replaces flat rate card) -------------------
-- Platform-defined base catalog of deliverable types.
create table service_types (
  id          bigint generated always as identity primary key,
  code        text unique not null,          -- 'post','reel','story','campaign'
  name        text not null,
  description text
);

-- An influencer extends a base service with their own price + negotiable flag.
create table influencer_services (
  id              uuid primary key default gen_random_uuid(),
  influencer_id   uuid not null references influencer_profiles(id) on delete cascade,
  service_type_id bigint not null references service_types(id),
  title           text,                       -- optional custom label
  price           numeric(10,2),
  currency        text default 'INR',
  negotiable      boolean default false,
  active          boolean default true,
  created_at      timestamptz default now(),
  unique (influencer_id, service_type_id)
);

-- An influencer bundles multiple services into a package with its own price.
create table service_packages (
  id              uuid primary key default gen_random_uuid(),
  influencer_id   uuid not null references influencer_profiles(id) on delete cascade,
  name            text not null,
  description     text,
  price           numeric(10,2),
  currency        text default 'INR',
  negotiable      boolean default false,
  active          boolean default true,
  created_at      timestamptz default now()
);

create table package_items (
  package_id            uuid references service_packages(id) on delete cascade,
  influencer_service_id uuid references influencer_services(id) on delete cascade,
  quantity              integer default 1,
  primary key (package_id, influencer_service_id)
);

-- ---------- business --------------------------------------------------------
create table business_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references app_users(id) on delete cascade,
  name          text not null,
  handle        text not null,
  bio           text,
  location_id   bigint references locations(id),
  geo_lat       numeric(9,6),                -- business location (geofence later)
  geo_lng       numeric(9,6),
  hiring_status hiring_status default 'looking_out',
  -- target demographic the business wants to reach
  target_age_min  integer,
  target_age_max  integer,
  target_gender   text,                      -- 'male' | 'female' | 'any'
  target_area     text,
  pitch_text      text,
  pitch_video_url text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- cached business stats (parallels influencer_stats; refreshed by cron)
create table business_stats (
  business_id     uuid primary key references business_profiles(id) on delete cascade,
  followers       integer default 0,
  avg_views       integer default 0,
  avg_likes       integer default 0,
  avg_comments    integer default 0,
  reach_24h       integer default 0,
  impressions_24h integer default 0,
  profile_views_24h integer default 0,
  posts_sampled   integer default 0,
  engagement_rate numeric(6,2) default 0,    -- computed by trg_engagement
  computed_at     timestamptz default now()
);

-- last 6 posts for the "vibe check" grid
create table business_posts (
  id            bigint generated always as identity primary key,
  business_id   uuid not null references business_profiles(id) on delete cascade,
  ig_media_id   text,
  thumbnail_url text,
  permalink     text,
  caption       text,
  posted_at     timestamptz,
  position      smallint                     -- 0..5 ordering in grid
);

-- ---------- onboarding invites ---------------------------------------------
create table invites (
  token       text primary key default encode(gen_random_bytes(16),'hex'),
  role        user_role not null default 'influencer',
  email       text,
  created_by  uuid references app_users(id),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  used_at     timestamptz,
  used_by     uuid references app_users(id),
  revoked     boolean default false,
  created_at  timestamptz default now()
);

-- ---------- interaction layer ----------------------------------------------
create table swipes (
  id            bigint generated always as identity primary key,
  business_id   uuid not null references business_profiles(id) on delete cascade,
  influencer_id uuid not null references influencer_profiles(id) on delete cascade,
  direction     swipe_direction not null,
  created_at    timestamptz default now(),
  unique (business_id, influencer_id)        -- never reshow a swiped card
);

-- materialized right-swipes (explicit interest) for fast "who likes me" views
create table interests (
  id            bigint generated always as identity primary key,
  business_id   uuid not null references business_profiles(id) on delete cascade,
  influencer_id uuid not null references influencer_profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  unique (business_id, influencer_id)
);

create table pitches (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references business_profiles(id) on delete cascade,
  influencer_id uuid not null references influencer_profiles(id) on delete cascade,
  message       text not null,
  brief         text,
  budget        numeric(10,2),
  -- optional: the specific service or package the pitch is about
  service_id    uuid references influencer_services(id) on delete set null,
  package_id    uuid references service_packages(id) on delete set null,
  status        pitch_status default 'sent',
  credits_charged integer default 0,
  created_at    timestamptz default now(),
  responded_at  timestamptz
);

create table threads (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references business_profiles(id) on delete cascade,
  influencer_id uuid not null references influencer_profiles(id) on delete cascade,
  pitch_id      uuid references pitches(id) on delete set null,
  created_at    timestamptz default now(),
  unique (business_id, influencer_id)
);

create table messages (
  id            bigint generated always as identity primary key,
  thread_id     uuid not null references threads(id) on delete cascade,
  sender_user_id uuid not null references app_users(id),
  body          text not null,
  created_at    timestamptz default now()
);

-- ---------- monetization (Phase 3 — tables now, logic later) ---------------
create table credit_ledger (
  id            bigint generated always as identity primary key,
  business_id   uuid not null references business_profiles(id) on delete cascade,
  delta         integer not null,            -- + purchase/grant, - debit per pitch
  reason        text,                        -- 'free_grant' | 'purchase' | 'pitch_debit'
  created_at    timestamptz default now()
);

create table subscriptions (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references business_profiles(id) on delete cascade,
  tier          text not null,               -- 'agency'
  status        text not null default 'active',
  current_period_end timestamptz,
  stripe_subscription_id text,
  created_at    timestamptz default now()
);

create table deals (
  id            uuid primary key default gen_random_uuid(),
  pitch_id      uuid references pitches(id) on delete set null,
  business_id   uuid not null references business_profiles(id),
  influencer_id uuid not null references influencer_profiles(id),
  amount        numeric(10,2) not null,
  platform_fee  numeric(10,2),               -- 10%
  status        deal_status default 'draft',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table payments (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid references deals(id) on delete cascade,
  stripe_payment_intent text,
  stripe_transfer_id     text,
  amount        numeric(10,2),
  fee           numeric(10,2),
  status        text,
  created_at    timestamptz default now()
);

-- ---------- indexes ---------------------------------------------------------
create index idx_inf_profiles_loc_pub on influencer_profiles(location_id, published);
create index idx_inf_stats_eng        on influencer_stats(engagement_rate desc);
create index idx_inf_niches_niche     on influencer_niches(niche_id);
create index idx_inf_services_inf     on influencer_services(influencer_id);
create index idx_packages_inf         on service_packages(influencer_id);
create index idx_swipes_pair          on swipes(business_id, influencer_id);
create index idx_pitches_inbox        on pitches(influencer_id, status);
create index idx_messages_thread      on messages(thread_id, created_at);

-- ---------- helper: recompute engagement on stats upsert --------------------
create or replace function set_engagement_rate() returns trigger as $$
begin
  new.engagement_rate :=
    case when coalesce(new.followers,0) = 0 then 0
         else round(((new.avg_likes + new.avg_comments)::numeric / new.followers) * 100, 2)
    end;
  return new;
end;
$$ language plpgsql;

create trigger trg_engagement
  before insert or update on influencer_stats
  for each row execute function set_engagement_rate();

-- same calc for businesses (function reads followers/avg_likes/avg_comments)
create trigger trg_business_engagement
  before insert or update on business_stats
  for each row execute function set_engagement_rate();

-- ---------- Row Level Security (enable; policies summarized) -----------------
alter table app_users            enable row level security;
alter table influencer_profiles  enable row level security;
alter table influencer_services  enable row level security;
alter table service_packages     enable row level security;
alter table business_profiles    enable row level security;
alter table pitches              enable row level security;
alter table messages             enable row level security;
-- Policy intent (see docs/03): users edit only their own rows; businesses read
-- only published influencer profiles + cached stats; influencers read pitches
-- addressed to them; monetization writes via service role. Concrete policies
-- added during Phase 2 implementation against real auth.uid().
