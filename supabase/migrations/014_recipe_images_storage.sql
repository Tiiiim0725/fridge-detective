-- Recipe images storage v0.1
-- Public read-only bucket for recipe card / cover images.
-- Uploads are handled by project maintainers through the Supabase CLI or Dashboard,
-- not by app users.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'recipe-images',
  'recipe-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'recipe_images_public_select'
  ) then
    create policy recipe_images_public_select on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'recipe-images');
  end if;
end
$$;
