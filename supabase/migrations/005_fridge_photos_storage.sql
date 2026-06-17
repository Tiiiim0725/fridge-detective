-- Fridge photo storage bucket and owner-scoped policies.

insert into storage.buckets (id, name, public)
values ('fridge-photos', 'fridge-photos', false)
on conflict (id) do update
set public = false;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'fridge_photos_select_own_path'
  ) then
    create policy fridge_photos_select_own_path on storage.objects
      for select to authenticated
      using (
        bucket_id = 'fridge-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'fridge_photos_insert_own_path'
  ) then
    create policy fridge_photos_insert_own_path on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'fridge-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'fridge_photos_update_own_path'
  ) then
    create policy fridge_photos_update_own_path on storage.objects
      for update to authenticated
      using (
        bucket_id = 'fridge-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'fridge-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'fridge_photos_delete_own_path'
  ) then
    create policy fridge_photos_delete_own_path on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'fridge-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end
$$;
