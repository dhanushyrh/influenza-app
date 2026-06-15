-- Rename coverage_areas → coverage_cities on influencer_profiles.
-- Previously stored neighbourhood areas; now stores up to 3 cities the creator covers.
alter table influencer_profiles
  rename column coverage_areas to coverage_cities;
