-- ============================================================================
-- Influenza — Storage buckets + access policies
-- pitches: influencer video pitches (public read so businesses can play)
-- avatars: profile images (public read)
-- post-thumbs: cached IG post thumbnails for vibe grids (public read)
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('pitches',     'pitches',     true),
  ('avatars',     'avatars',     true),
  ('post-thumbs', 'post-thumbs', true)
on conflict (id) do nothing;

-- Public read for these display assets.
create policy "public read pitches"
  on storage.objects for select using (bucket_id = 'pitches');
create policy "public read avatars"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "public read post-thumbs"
  on storage.objects for select using (bucket_id = 'post-thumbs');

-- Authenticated users may upload/manage objects within their own folder,
-- where the first path segment is their auth uid (e.g. "<uid>/pitch.mp4").
create policy "auth write own pitches"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'pitches' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "auth update own pitches"
  on storage.objects for update to authenticated
  using (bucket_id = 'pitches' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "auth write own avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "auth write own post-thumbs"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-thumbs' and (storage.foldername(name))[1] = auth.uid()::text);
