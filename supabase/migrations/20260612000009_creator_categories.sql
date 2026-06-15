-- Master list of creator/influencer categories shown in business onboarding
create table if not exists creator_categories (
  id      bigint generated always as identity primary key,
  slug    text not null unique,
  label   text not null,
  sort_order integer default 0
);

insert into creator_categories (slug, label, sort_order) values
  ('lifestyle',            'Lifestyle',               1),
  ('beauty',               'Beauty',                  2),
  ('fashion',              'Fashion',                  3),
  ('travel',               'Travel',                  4),
  ('health_fitness',       'Health & Fitness',         5),
  ('food_drink',           'Food & Drink',             6),
  ('comedy_entertainment', 'Comedy & Entertainment',   7),
  ('animals_pets',         'Animals & Pets',           8),
  ('music_dance',          'Music & Dance',            9),
  ('art_photography',      'Art & Photography',       10),
  ('adventure_outdoors',   'Adventure & Outdoors',    11),
  ('education',            'Education',               12),
  ('entrepreneur_business','Entrepreneur & Business', 13),
  ('athlete_sports',       'Athlete & Sports',        14),
  ('technology',           'Technology / Tech',       15),
  ('gaming',               'Gaming',                  16),
  ('healthcare',           'Healthcare',              17),
  ('automotive',           'Automotive',              18),
  ('celebrity',            'Celebrity & Public Figure',19)
on conflict (slug) do nothing;
