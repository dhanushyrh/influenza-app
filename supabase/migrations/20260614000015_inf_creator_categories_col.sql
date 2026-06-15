-- The app stores a creator's chosen categories as a jsonb array on the profile
-- (lib/queries.ts MY_CREATOR_SELECT, lib/inf-map.ts mapMyCreator, and the
-- onboarding-complete route all reference influencer_profiles.creator_categories).
-- The taxonomy lives in the separate `creator_categories` table; this is the
-- per-profile selection column. Without it, getMyCreator silently falls back to mock.
alter table influencer_profiles add column if not exists creator_categories jsonb default '[]'::jsonb;
