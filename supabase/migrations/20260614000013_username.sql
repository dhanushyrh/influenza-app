-- Username login: each app_user gets a unique lowercased username (= IG handle
-- without the leading @). The login form looks up the email by username, then
-- calls auth.signInWithPassword(email, password).

alter table app_users add column if not exists username text;

-- Backfill from existing profile handles (strip leading @, lowercase).
update app_users u
set username = lower(ltrim(p.handle, '@'))
from influencer_profiles p
where p.user_id = u.id and u.username is null;

update app_users u
set username = lower(ltrim(b.handle, '@'))
from business_profiles b
where b.user_id = u.id and u.username is null;

-- Deduplicate before the unique index: keep the earliest row per username,
-- null the rest (duplicate/legacy accounts simply can't use username login).
with ranked as (
  select id, row_number() over (partition by username order by created_at, id) as rn
  from app_users
  where username is not null
)
update app_users u
set username = null
from ranked r
where u.id = r.id and r.rn > 1;

-- Unique index (partial: ignore rows that never completed onboarding).
create unique index if not exists idx_app_users_username
  on app_users (username)
  where username is not null;
