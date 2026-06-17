-- Link creator proposals to a specific campaign brief.
alter table pitches
  add column if not exists campaign_id uuid references campaigns(id) on delete set null;

create index if not exists idx_pitches_campaign on pitches (campaign_id, status);
