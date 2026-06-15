-- ============================================================================
-- Influencer media: avatar + recent posts grid
-- Parallels business_posts; populated by the IG cron + seed-images script.
-- ============================================================================

-- Avatar URL on influencer profiles (Supabase Storage path)
alter table influencer_profiles add column if not exists avatar_url text;

-- Recent posts for the Lookbook grid (up to 6, ordered by position)
create table influencer_posts (
  id              bigint generated always as identity primary key,
  influencer_id   uuid not null references influencer_profiles(id) on delete cascade,
  ig_media_id     text,
  thumbnail_url   text,
  permalink       text,
  caption         text,
  likes           integer default 0,
  comments        integer default 0,
  posted_at       timestamptz,
  position        smallint   -- 0..5 grid order
);

create index idx_influencer_posts_inf on influencer_posts(influencer_id, position);

alter table influencer_posts enable row level security;

-- Published influencer's posts are readable by all authenticated users.
create policy inf_posts_read on influencer_posts for select to authenticated
  using (exists (
    select 1 from influencer_profiles p
    where p.id = influencer_id
      and (p.published or p.user_id = current_app_user_id())
  ));

create policy inf_posts_write on influencer_posts for all to authenticated
  using (exists (
    select 1 from influencer_profiles p
    where p.id = influencer_id and p.user_id = current_app_user_id()
  ))
  with check (exists (
    select 1 from influencer_profiles p
    where p.id = influencer_id and p.user_id = current_app_user_id()
  ));
