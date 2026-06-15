-- ============================================================================
-- Influenza — MVP extended seed (4 more influencers, 1 more business,
--             2 mock-onboarding invite tokens for end-to-end testing)
-- Depends on 20260610000001_init.sql + the initial seed.sql already applied.
-- ============================================================================

-- ---- Influencer 2: Rohan Mehta (@rohan.bites) --------------------------------
with u as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('influencer','rohan@example.com','ig_1002','creator') returning id
), p as (
  insert into influencer_profiles (user_id, display_name, handle, bio, location_id, geo_lat, geo_lng, published)
  select id, 'Rohan Mehta', '@rohan.bites',
         'Bengaluru street food hunter 🌮 | cart-to-cart since 2018',
         (select id from locations where city = 'Bengaluru'),
         12.961400, 77.601400, true
  from u returning id
), st as (
  insert into influencer_stats (influencer_id, followers, avg_views, avg_likes, avg_comments,
                                 reach_24h, impressions_24h, profile_views_24h, posts_sampled)
  select id, 15400, 7350, 980, 61, 11400, 17400, 770, 12 from p returning influencer_id
)
insert into audience_demographics (influencer_id, age_buckets, gender_split, top_locations)
select influencer_id,
  '{"13-17":2.8,"18-24":38.5,"25-34":42.1,"35-44":12.8,"45+":3.8}'::jsonb,
  '{"male":58.5,"female":39.5,"other":2.0}'::jsonb,
  '[{"city":"Bengaluru","pct":72.1},{"city":"Mysuru","pct":5.8},{"city":"Chennai","pct":3.4}]'::jsonb
from st;

insert into influencer_niches (influencer_id, niche_id)
select ip.id, n.id from influencer_profiles ip, niches n
where ip.handle = '@rohan.bites' and n.subtopic = 'street_food';

insert into influencer_services (influencer_id, service_type_id, price, negotiable)
select ip.id, st.id,
       case st.code when 'post' then 4500 when 'reel' then 9000 when 'story' then 2000 end,
       case st.code when 'reel' then true when 'post' then true else false end
from influencer_profiles ip, service_types st
where ip.handle = '@rohan.bites' and st.code in ('post','reel','story');

with pkg as (
  insert into service_packages (influencer_id, name, description, price, negotiable)
  select id, 'Street Reel Pack', '2 reels + 2 posts', 25000, true
  from influencer_profiles where handle = '@rohan.bites' returning id, influencer_id
)
insert into package_items (package_id, influencer_service_id, quantity)
select pkg.id, isv.id, case st.code when 'reel' then 2 else 2 end
from pkg
join influencer_services isv on isv.influencer_id = pkg.influencer_id
join service_types st on st.id = isv.service_type_id
where st.code in ('reel','post');

-- ---- Influencer 3: Priya Nair (@priya.plates) --------------------------------
with u as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('influencer','priya@example.com','ig_1003','creator') returning id
), p as (
  insert into influencer_profiles (user_id, display_name, handle, bio, location_id, geo_lat, geo_lng, published)
  select id, 'Priya Nair', '@priya.plates',
         'Fine dining reviews & food photography 📸 | Bengaluru',
         (select id from locations where city = 'Bengaluru'),
         12.934500, 77.610800, true
  from u returning id
), st as (
  insert into influencer_stats (influencer_id, followers, avg_views, avg_likes, avg_comments,
                                 reach_24h, impressions_24h, profile_views_24h, posts_sampled)
  select id, 4300, 2100, 410, 52, 3200, 4800, 195, 12 from p returning influencer_id
)
insert into audience_demographics (influencer_id, age_buckets, gender_split, top_locations)
select influencer_id,
  '{"13-17":1.2,"18-24":28.0,"25-34":48.5,"35-44":17.8,"45+":4.5}'::jsonb,
  '{"male":34.5,"female":63.5,"other":2.0}'::jsonb,
  '[{"city":"Bengaluru","pct":81.2},{"city":"Chennai","pct":6.3},{"city":"Mysuru","pct":3.1}]'::jsonb
from st;

insert into influencer_niches (influencer_id, niche_id)
select ip.id, n.id from influencer_profiles ip, niches n
where ip.handle = '@priya.plates' and n.subtopic = 'fine_dining';

insert into influencer_services (influencer_id, service_type_id, price, negotiable)
select ip.id, st.id,
       case st.code when 'post' then 2400 when 'reel' then 4800 when 'story' then 1200 end,
       false
from influencer_profiles ip, service_types st
where ip.handle = '@priya.plates' and st.code in ('post','reel','story');

with pkg as (
  insert into service_packages (influencer_id, name, description, price, negotiable)
  select id, 'Fine Dine Feature', '1 reel + 1 post + 2 stories', 7200, false
  from influencer_profiles where handle = '@priya.plates' returning id, influencer_id
)
insert into package_items (package_id, influencer_service_id, quantity)
select pkg.id, isv.id, case st.code when 'story' then 2 else 1 end
from pkg
join influencer_services isv on isv.influencer_id = pkg.influencer_id
join service_types st on st.id = isv.service_type_id
where st.code in ('reel','post','story');

-- ---- Influencer 4: Karan Shetty (@karaneats) ---------------------------------
with u as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('influencer','karan@example.com','ig_1004','business') returning id
), p as (
  insert into influencer_profiles (user_id, display_name, handle, bio, location_id, geo_lat, geo_lng, published)
  select id, 'Karan Shetty', '@karaneats',
         'Udupi to Ulsoor — every bite counts 🍛 | Bengaluru food',
         (select id from locations where city = 'Bengaluru'),
         12.980100, 77.573200, true
  from u returning id
), st as (
  insert into influencer_stats (influencer_id, followers, avg_views, avg_likes, avg_comments,
                                 reach_24h, impressions_24h, profile_views_24h, posts_sampled)
  select id, 22100, 11000, 1240, 73, 16400, 24900, 1105, 12 from p returning influencer_id
)
insert into audience_demographics (influencer_id, age_buckets, gender_split, top_locations)
select influencer_id,
  '{"13-17":5.1,"18-24":44.5,"25-34":34.2,"35-44":11.6,"45+":4.6}'::jsonb,
  '{"male":62.0,"female":36.5,"other":1.5}'::jsonb,
  '[{"city":"Bengaluru","pct":65.8},{"city":"Mangaluru","pct":8.2},{"city":"Mysuru","pct":6.1}]'::jsonb
from st;

insert into influencer_niches (influencer_id, niche_id)
select ip.id, n.id from influencer_profiles ip, niches n
where ip.handle = '@karaneats' and n.subtopic in ('street_food','cafe');

insert into influencer_services (influencer_id, service_type_id, price, negotiable)
select ip.id, st.id,
       case st.code when 'post' then 6000 when 'reel' then 12000 when 'story' then 2500 end,
       case st.code when 'reel' then true when 'post' then true else false end
from influencer_profiles ip, service_types st
where ip.handle = '@karaneats' and st.code in ('post','reel','story');

with pkg as (
  insert into service_packages (influencer_id, name, description, price, negotiable)
  select id, 'Mega Collab', '3 reels + 3 posts + 5 stories', 55000, true
  from influencer_profiles where handle = '@karaneats' returning id, influencer_id
)
insert into package_items (package_id, influencer_service_id, quantity)
select pkg.id, isv.id, case st.code when 'reel' then 3 when 'post' then 3 else 5 end
from pkg
join influencer_services isv on isv.influencer_id = pkg.influencer_id
join service_types st on st.id = isv.service_type_id
where st.code in ('reel','post','story');

-- ---- Influencer 5: Sneha Rao (@snehaforks) -----------------------------------
with u as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('influencer','sneha@example.com','ig_1005','creator') returning id
), p as (
  insert into influencer_profiles (user_id, display_name, handle, bio, location_id, geo_lat, geo_lng, published)
  select id, 'Sneha Rao', '@snehaforks',
         'Café crawls & cozy corners ☕ | Bengaluru vibes',
         (select id from locations where city = 'Bengaluru'),
         12.946800, 77.578200, true
  from u returning id
), st as (
  insert into influencer_stats (influencer_id, followers, avg_views, avg_likes, avg_comments,
                                 reach_24h, impressions_24h, profile_views_24h, posts_sampled)
  select id, 6800, 3400, 600, 44, 5000, 7600, 340, 12 from p returning influencer_id
)
insert into audience_demographics (influencer_id, age_buckets, gender_split, top_locations)
select influencer_id,
  '{"13-17":4.5,"18-24":45.8,"25-34":35.2,"35-44":11.0,"45+":3.5}'::jsonb,
  '{"male":28.5,"female":69.5,"other":2.0}'::jsonb,
  '[{"city":"Bengaluru","pct":76.3},{"city":"Mysuru","pct":7.5},{"city":"Chennai","pct":3.8}]'::jsonb
from st;

insert into influencer_niches (influencer_id, niche_id)
select ip.id, n.id from influencer_profiles ip, niches n
where ip.handle = '@snehaforks' and n.subtopic = 'cafe';

insert into influencer_services (influencer_id, service_type_id, price, negotiable)
select ip.id, st.id,
       case st.code when 'post' then 2800 when 'reel' then 5500 when 'story' then 1400 end,
       case st.code when 'reel' then true else false end
from influencer_profiles ip, service_types st
where ip.handle = '@snehaforks' and st.code in ('post','reel','story');

with pkg as (
  insert into service_packages (influencer_id, name, description, price, negotiable)
  select id, 'Café Spotlight', '1 reel + 1 post + 3 stories', 8500, true
  from influencer_profiles where handle = '@snehaforks' returning id, influencer_id
)
insert into package_items (package_id, influencer_service_id, quantity)
select pkg.id, isv.id, case st.code when 'story' then 3 else 1 end
from pkg
join influencer_services isv on isv.influencer_id = pkg.influencer_id
join service_types st on st.id = isv.service_type_id
where st.code in ('reel','post','story');

-- ---- Business 2: Chai Nivas — Koramangala -----------------------------------
with bu as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('business','owner@chainivas.example','ig_2002','business') returning id
), bp as (
  insert into business_profiles (user_id, name, handle, bio, location_id, geo_lat, geo_lng,
                                   hiring_status, target_age_min, target_age_max,
                                   target_gender, target_area, pitch_text)
  select id, 'Chai Nivas — Koramangala', '@chainivas.ind',
         'Masala chai & millet snacks 🍵 | Koramangala 5th block',
         (select id from locations where city = 'Bengaluru'),
         12.934800, 77.618200,
         'actively_looking', 18, 40, 'any', 'Koramangala',
         'We want food creators who love chai culture to feature our monsoon menu.'
  from bu returning id
)
insert into business_stats (business_id, followers, avg_views, avg_likes, avg_comments,
                              reach_24h, impressions_24h, profile_views_24h, posts_sampled)
select id, 8900, 3100, 420, 28, 6200, 9400, 510, 12 from bp;

-- ---- Mock-onboarding invite tokens (for end-to-end UI testing) ---------------
-- Deepa persona: @deepa.bakes — café/bakery, 11.8K followers
insert into invites (token, role, email, expires_at)
values ('mock-onboard-deepa', 'influencer', 'deepa@example.com',
        now() + interval '365 days');

-- Vikram persona: @vikram.eats — street food, 9.2K followers
insert into invites (token, role, email, expires_at)
values ('mock-onboard-vikram', 'influencer', 'vikram@example.com',
        now() + interval '365 days');
