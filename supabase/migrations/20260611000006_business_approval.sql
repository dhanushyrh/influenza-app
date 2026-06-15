-- Add approval flag to business_profiles for admin-gated signup.
alter table business_profiles add column if not exists approved boolean default false;
