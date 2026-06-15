-- ============================================================================
-- Influenza — Row Level Security policies
-- Maps Supabase auth.uid() → app_users and scopes every table.
-- Depends on 20260610000001_init.sql.
-- ============================================================================

-- Resolve the current authenticated user's app_users row.
create or replace function current_app_user_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select id from app_users where auth_user_id = auth.uid()
$$;

-- Enable RLS on every table not already enabled in the init migration.
alter table locations             enable row level security;
alter table niches                enable row level security;
alter table service_types         enable row level security;
alter table influencer_stats      enable row level security;
alter table audience_demographics enable row level security;
alter table influencer_niches     enable row level security;
alter table package_items         enable row level security;
alter table business_stats        enable row level security;
alter table business_posts        enable row level security;
alter table swipes                enable row level security;
alter table interests             enable row level security;
alter table threads               enable row level security;
alter table invites               enable row level security;
alter table credit_ledger         enable row level security;
alter table subscriptions         enable row level security;
alter table deals                 enable row level security;
alter table payments              enable row level security;

-- ---------- reference data: any authenticated user may read -----------------
create policy ref_read_locations    on locations     for select to authenticated using (true);
create policy ref_read_niches       on niches        for select to authenticated using (true);
create policy ref_read_servicetypes on service_types for select to authenticated using (true);

-- ---------- app_users: self only ------------------------------------------
create policy au_self_select on app_users for select to authenticated using (auth_user_id = auth.uid());
create policy au_self_insert on app_users for insert to authenticated with check (auth_user_id = auth.uid());
create policy au_self_update on app_users for update to authenticated using (auth_user_id = auth.uid());

-- ---------- influencer_profiles --------------------------------------------
create policy inf_owner_all on influencer_profiles for all to authenticated
  using (user_id = current_app_user_id()) with check (user_id = current_app_user_id());
create policy inf_read_published on influencer_profiles for select to authenticated
  using (published = true);

-- helper predicate reused below: caller may see this influencer's child rows
-- if the profile is published or they own it.
create policy infstats_read on influencer_stats for select to authenticated
  using (exists (select 1 from influencer_profiles p
                 where p.id = influencer_id and (p.published or p.user_id = current_app_user_id())));
create policy infstats_write on influencer_stats for all to authenticated
  using (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()))
  with check (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()));

create policy demo_read on audience_demographics for select to authenticated
  using (exists (select 1 from influencer_profiles p
                 where p.id = influencer_id and (p.published or p.user_id = current_app_user_id())));
create policy demo_write on audience_demographics for all to authenticated
  using (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()))
  with check (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()));

create policy infniche_read on influencer_niches for select to authenticated
  using (exists (select 1 from influencer_profiles p
                 where p.id = influencer_id and (p.published or p.user_id = current_app_user_id())));
create policy infniche_write on influencer_niches for all to authenticated
  using (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()))
  with check (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()));

-- ---------- services & packages --------------------------------------------
create policy svc_read on influencer_services for select to authenticated
  using (exists (select 1 from influencer_profiles p
                 where p.id = influencer_id and (p.published or p.user_id = current_app_user_id())));
create policy svc_write on influencer_services for all to authenticated
  using (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()))
  with check (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()));

create policy pkg_read on service_packages for select to authenticated
  using (exists (select 1 from influencer_profiles p
                 where p.id = influencer_id and (p.published or p.user_id = current_app_user_id())));
create policy pkg_write on service_packages for all to authenticated
  using (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()))
  with check (exists (select 1 from influencer_profiles p where p.id = influencer_id and p.user_id = current_app_user_id()));

create policy pkgitem_read on package_items for select to authenticated
  using (exists (select 1 from service_packages sp join influencer_profiles p on p.id = sp.influencer_id
                 where sp.id = package_id and (p.published or p.user_id = current_app_user_id())));
create policy pkgitem_write on package_items for all to authenticated
  using (exists (select 1 from service_packages sp join influencer_profiles p on p.id = sp.influencer_id
                 where sp.id = package_id and p.user_id = current_app_user_id()))
  with check (exists (select 1 from service_packages sp join influencer_profiles p on p.id = sp.influencer_id
                 where sp.id = package_id and p.user_id = current_app_user_id()));

-- ---------- business side: owner writes, authenticated reads ---------------
create policy biz_owner_all on business_profiles for all to authenticated
  using (user_id = current_app_user_id()) with check (user_id = current_app_user_id());
create policy biz_read on business_profiles for select to authenticated using (true);

create policy bizstats_read on business_stats for select to authenticated using (true);
create policy bizstats_write on business_stats for all to authenticated
  using (exists (select 1 from business_profiles b where b.id = business_id and b.user_id = current_app_user_id()))
  with check (exists (select 1 from business_profiles b where b.id = business_id and b.user_id = current_app_user_id()));

create policy bizposts_read on business_posts for select to authenticated using (true);
create policy bizposts_write on business_posts for all to authenticated
  using (exists (select 1 from business_profiles b where b.id = business_id and b.user_id = current_app_user_id()))
  with check (exists (select 1 from business_profiles b where b.id = business_id and b.user_id = current_app_user_id()));

-- ---------- interaction layer ----------------------------------------------
-- swipes are private to the swiping business.
create policy swipes_owner on swipes for all to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id()))
  with check (business_id in (select id from business_profiles where user_id = current_app_user_id()));

-- interests: business owner manages; the targeted influencer may read.
create policy interests_select on interests for select to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id())
      or influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()));
create policy interests_write on interests for all to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id()))
  with check (business_id in (select id from business_profiles where user_id = current_app_user_id()));

-- pitches: business owner sends/reads its own; influencer reads + responds to theirs.
create policy pitch_select on pitches for select to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id())
      or influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()));
create policy pitch_insert on pitches for insert to authenticated
  with check (business_id in (select id from business_profiles where user_id = current_app_user_id()));
create policy pitch_update on pitches for update to authenticated
  using (influencer_id in (select id from influencer_profiles where user_id = current_app_user_id())
      or business_id in (select id from business_profiles where user_id = current_app_user_id()));

-- threads + messages: only the two participants.
create policy thread_participants on threads for all to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id())
      or influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()))
  with check (business_id in (select id from business_profiles where user_id = current_app_user_id())
      or influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()));

create policy msg_participants on messages for all to authenticated
  using (exists (select 1 from threads t where t.id = thread_id
                 and (t.business_id in (select id from business_profiles where user_id = current_app_user_id())
                   or t.influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()))))
  with check (sender_user_id = current_app_user_id());

-- ---------- monetization: owner may read; writes via service role only ------
create policy ledger_read on credit_ledger for select to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id()));
create policy subs_read on subscriptions for select to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id()));
create policy deals_read on deals for select to authenticated
  using (business_id in (select id from business_profiles where user_id = current_app_user_id())
      or influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()));
create policy payments_read on payments for select to authenticated
  using (exists (select 1 from deals d where d.id = deal_id
                 and (d.business_id in (select id from business_profiles where user_id = current_app_user_id())
                   or d.influencer_id in (select id from influencer_profiles where user_id = current_app_user_id()))));

-- invites: no anon/auth policy on purpose. Token validation runs server-side
-- with the service-role key (bypasses RLS). See app/onboarding flow.
