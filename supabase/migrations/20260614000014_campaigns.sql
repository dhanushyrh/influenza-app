-- Campaigns: a business posts a brief (deliverables + budget + audience) that
-- surfaces in the creator Briefs feed. Replaces the prototype's local-only
-- MY_CAMPAIGNS with a persisted table.

create table if not exists campaigns (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references business_profiles(id) on delete cascade,
  title         text not null,
  category      text,                              -- CAT_MAP key (cafe/street/…) or niche slug
  blurb         text,
  deliverables  jsonb default '{}'::jsonb,         -- {"reel":1,"post":1,"story":3}
  budget_lo     integer,
  budget_hi     integer,
  sizes         jsonb default '[]'::jsonb,         -- ["nano","micro",…]
  deadline      text,                              -- "1 week" | "2 weeks" | "1 month" | "Flexible"
  status        text not null default 'live' check (status in ('live','draft','closed')),
  pitches       integer not null default 0,
  new_pitches   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_campaigns_biz on campaigns (business_id, status);

alter table campaigns enable row level security;

-- MVP policy: admin client handles writes (bypass RLS); reads open for now.
create policy "campaigns_all" on campaigns for all using (true) with check (true);
