-- Creator credit history. Migration 20260613000010 tried to create `credit_ledger`
-- for creators, but that name was already taken by the business credit_ledger
-- (business_id/delta/reason), so `create table if not exists` silently skipped it.
-- This table is the creator-side ledger under a non-colliding name.
create table if not exists creator_credit_ledger (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references app_users(id) on delete cascade,
  kind       text        not null check (kind in ('spend','promote','referral','buy','welcome')),
  label      text        not null,
  amount     integer     not null,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists idx_creator_ledger_user on creator_credit_ledger(user_id, created_at desc);

alter table creator_credit_ledger enable row level security;
drop policy if exists "creator_credit_ledger_all" on creator_credit_ledger;
create policy "creator_credit_ledger_all" on creator_credit_ledger for all using (true) with check (true);
