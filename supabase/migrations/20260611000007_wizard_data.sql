-- Columns collected during the onboarding wizards.

-- Phone number collected on both creator and business sign-up steps.
alter table app_users
  add column if not exists phone text;

-- Areas the creator covers inside their city (multi-select in the wizard).
alter table influencer_profiles
  add column if not exists coverage_areas jsonb default '[]'::jsonb;

-- Business category (maps to the CATEGORIES key: food_drinks | service | product).
alter table business_profiles
  add column if not exists category text;

-- Campaign-preference fields collected during the business wizard prefs step.
alter table business_profiles
  add column if not exists target_creator_size jsonb default '[]'::jsonb; -- ["nano","micro",...]
alter table business_profiles
  add column if not exists target_budget text;  -- "micro" | "mid" | "big"
