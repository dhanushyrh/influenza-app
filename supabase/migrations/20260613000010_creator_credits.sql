-- creator_credits: one row per influencer, tracks pitch credit balance
create table if not exists creator_credits (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references app_users(id) on delete cascade,
  balance    integer     not null default 3,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- credit_ledger: full history of credit events per creator
create table if not exists credit_ledger (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references app_users(id) on delete cascade,
  kind       text        not null check (kind in ('spend','promote','referral','buy','welcome')),
  label      text        not null,
  amount     integer     not null,
  note       text,
  created_at timestamptz not null default now()
);

-- creator_referrals: tracks who invited whom and their conversion state
create table if not exists creator_referrals (
  id          uuid        primary key default gen_random_uuid(),
  referrer_id uuid        not null references app_users(id) on delete cascade,
  referee_id  uuid        references app_users(id),
  status      text        not null default 'invited' check (status in ('invited','joined','verifying','verified')),
  earned      integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- creator_promos: records of creator promotional shares for credit rewards
create table if not exists creator_promos (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references app_users(id) on delete cascade,
  type       text        not null check (type in ('Story','Feed post')),
  reach      integer     not null default 0,
  status     text        not null default 'pending' check (status in ('pending','ready','claimed')),
  credits    integer     not null default 0,
  hrs_left   integer     not null default 24,
  created_at timestamptz not null default now()
);

-- RLS
alter table creator_credits    enable row level security;
alter table credit_ledger      enable row level security;
alter table creator_referrals  enable row level security;
alter table creator_promos     enable row level security;

-- MVP policies: admin client handles all writes (bypass RLS), reads open for now
create policy "creator_credits_all"   on creator_credits   for all using (true) with check (true);
create policy "credit_ledger_all"     on credit_ledger     for all using (true) with check (true);
create policy "creator_referrals_all" on creator_referrals for all using (true) with check (true);
create policy "creator_promos_all"    on creator_promos    for all using (true) with check (true);

-- seed 3 welcome credits for existing influencer test accounts
insert into creator_credits (user_id, balance)
select u.id, 3
from app_users u
where u.role = 'influencer'
on conflict (user_id) do nothing;
