-- Rich UI payload fields for the creator/business deal pipeline.
-- The /inf and /biz apps render a hand-authored timeline + deliverables that the
-- normalized pitches/deals tables can't hold; these columns carry that payload.

-- influencer_profiles: creator-facing availability toggle + cover image
alter table influencer_profiles
  add column if not exists available boolean default true,
  add column if not exists cover_url text;

-- pitches: a proposal carries a title + deliverable list + an optional counter amount.
-- from_role records the direction (creator proposal vs business pitch).
alter table pitches
  add column if not exists title        text,
  add column if not exists deliverables jsonb default '[]'::jsonb,
  add column if not exists counter      numeric(10,2),
  add column if not exists from_role    text default 'business';

-- deals: copy of the proposal payload + the rendered event log, submission, review
alter table deals
  add column if not exists title        text,
  add column if not exists deliverables jsonb default '[]'::jsonb,
  add column if not exists counter      numeric(10,2),
  add column if not exists submission   jsonb,
  add column if not exists review       jsonb,
  add column if not exists log          jsonb default '[]'::jsonb;

-- RLS: admin client (service role) handles all pipeline reads/writes and bypasses
-- RLS. Enable + open policies consistent with the creator_credits migration so
-- the tables behave the same way under the anon/service split.
alter table pitches  enable row level security;
alter table threads  enable row level security;
alter table messages enable row level security;
alter table deals    enable row level security;

drop policy if exists "pitches_all"  on pitches;
drop policy if exists "threads_all"  on threads;
drop policy if exists "messages_all" on messages;
drop policy if exists "deals_all"    on deals;

create policy "pitches_all"  on pitches  for all using (true) with check (true);
create policy "threads_all"  on threads  for all using (true) with check (true);
create policy "messages_all" on messages for all using (true) with check (true);
create policy "deals_all"    on deals    for all using (true) with check (true);
