-- ============================================================================
-- Influenza — demo seed data (Bengaluru / food niche)
-- For local dev only. Run after schema.sql.
-- ============================================================================

insert into locations (city, state, geo_lat, geo_lng) values
  ('Bengaluru','Karnataka', 12.971599, 77.594566),
  ('Mysuru','Karnataka', 12.295810, 76.639381);

insert into niches (category, subtopic) values
  ('food_drinks','cafe'),
  ('food_drinks','street_food'),
  ('food_drinks','fine_dining'),
  ('service','salon'),
  ('product','fashion');

-- platform-defined base service catalog
insert into service_types (code, name, description) values
  ('post','Instagram Post','Single feed post'),
  ('reel','Instagram Reel','Short-form video reel'),
  ('story','Instagram Story','24h story (set of frames)'),
  ('campaign','Campaign','Multi-deliverable collaboration over a period');

-- influencer user + profile + cached stats + demographics
with u as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('influencer','aisha@example.com','ig_1001','creator') returning id
), p as (
  insert into influencer_profiles (user_id, display_name, handle, bio, location_id, geo_lat, geo_lng, published)
  select id,'Aisha Khan','@aisha.eats','Bengaluru food explorer 🍜',
         (select id from locations where city='Bengaluru'), 12.978100, 77.640900, true
  from u returning id
)
insert into influencer_stats (influencer_id, followers, avg_views, avg_likes, avg_comments, reach_24h, impressions_24h, profile_views_24h, posts_sampled)
select id, 8200, 4200, 540, 38, 6100, 9300, 410, 12 from p;

insert into audience_demographics (influencer_id, age_buckets, gender_split, top_locations)
select id,
  '{"13-17":3.2,"18-24":41.0,"25-34":38.5,"35-44":12.1,"45+":5.2}'::jsonb,
  '{"male":39.0,"female":59.5,"other":1.5}'::jsonb,
  '[{"city":"Bengaluru","pct":68.4},{"city":"Mysuru","pct":7.1}]'::jsonb
from influencer_profiles where handle='@aisha.eats';

insert into influencer_niches (influencer_id, niche_id)
select ip.id, n.id from influencer_profiles ip, niches n
where ip.handle='@aisha.eats' and n.subtopic in ('cafe','street_food');

-- influencer extends base services with own pricing + negotiable flags
insert into influencer_services (influencer_id, service_type_id, price, negotiable)
select ip.id, st.id,
       case st.code when 'post' then 3000 when 'reel' then 6000 when 'story' then 1500 end,
       case st.code when 'reel' then true else false end
from influencer_profiles ip, service_types st
where ip.handle='@aisha.eats' and st.code in ('post','reel','story');

-- a bundle package made of those services
with pkg as (
  insert into service_packages (influencer_id, name, description, price, negotiable)
  select id,'Launch Combo','1 reel + 1 post + 3 stories', 9000, true
  from influencer_profiles where handle='@aisha.eats' returning id, influencer_id
)
insert into package_items (package_id, influencer_service_id, quantity)
select pkg.id, isv.id,
       case st.code when 'story' then 3 else 1 end
from pkg
join influencer_services isv on isv.influencer_id = pkg.influencer_id
join service_types st on st.id = isv.service_type_id
where st.code in ('reel','post','story');

-- business user + profile + cached stats
with bu as (
  insert into app_users (role, email, ig_user_id, ig_account_type)
  values ('business','owner@thirdwave.example','ig_2001','business') returning id
), bp as (
  insert into business_profiles (user_id, name, handle, bio, location_id, geo_lat, geo_lng, hiring_status, target_age_min, target_age_max, target_gender, target_area)
  select id,'Third Wave Coffee — Indiranagar','@thirdwave.ind','Specialty coffee ☕',
         (select id from locations where city='Bengaluru'), 12.971900, 77.640300,
         'actively_looking',18,35,'any','Indiranagar'
  from bu returning id
)
insert into business_stats (business_id, followers, avg_views, avg_likes, avg_comments, reach_24h, impressions_24h, profile_views_24h, posts_sampled)
select id, 14200, 5200, 720, 41, 9800, 15200, 880, 12 from bp;

-- a demo invite link: /onboarding/demo-token-123
insert into invites (token, role, email) values ('demo-token-123','influencer','newcreator@example.com');
