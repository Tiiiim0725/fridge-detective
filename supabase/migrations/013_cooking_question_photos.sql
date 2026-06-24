-- Cooking question photos v0.1
-- Stores user-scoped photos uploaded while asking the cooking helper about a tutorial step.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'cooking-question-photos',
  'cooking-question-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'cooking_question_photos_select_own_path'
  ) then
    create policy cooking_question_photos_select_own_path on storage.objects
      for select to authenticated
      using (
        bucket_id = 'cooking-question-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'cooking_question_photos_insert_own_path'
  ) then
    create policy cooking_question_photos_insert_own_path on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'cooking-question-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'cooking_question_photos_delete_own_path'
  ) then
    create policy cooking_question_photos_delete_own_path on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'cooking-question-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end
$$;

create table public.cooking_question_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid null references public.cooking_sessions(id) on delete set null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number integer not null,
  storage_bucket text not null default 'cooking-question-photos',
  storage_path text not null,
  content_type text null,
  file_size integer null,
  width integer null,
  height integer null,
  created_at timestamptz not null default now(),

  constraint cooking_question_photos_step_number_check
    check (step_number > 0),
  constraint cooking_question_photos_bucket_check
    check (storage_bucket = 'cooking-question-photos'),
  constraint cooking_question_photos_storage_path_check
    check (length(trim(storage_path)) > 0),
  constraint cooking_question_photos_file_size_check
    check (file_size is null or file_size > 0),
  constraint cooking_question_photos_dimensions_check
    check (
      (width is null and height is null)
      or (
        width is not null
        and height is not null
        and width > 0
        and height > 0
      )
    ),
  constraint cooking_question_photos_storage_unique
    unique (storage_bucket, storage_path)
);

alter table public.cooking_ai_questions
  add column if not exists question_photo_id uuid null
    references public.cooking_question_photos(id) on delete set null;

create index idx_cooking_question_photos_user_created
  on public.cooking_question_photos(user_id, created_at desc);

create index idx_cooking_question_photos_session_created
  on public.cooking_question_photos(session_id, created_at desc);

create index idx_cooking_question_photos_recipe_step
  on public.cooking_question_photos(recipe_id, step_number, created_at desc);

create index idx_cooking_ai_questions_photo
  on public.cooking_ai_questions(question_photo_id)
  where question_photo_id is not null;

grant select, insert on table public.cooking_question_photos to authenticated;

alter table public.cooking_question_photos enable row level security;

create policy cooking_question_photos_select_policy
on public.cooking_question_photos for select
to authenticated
using (auth.uid() = user_id);

create policy cooking_question_photos_insert_policy
on public.cooking_question_photos for insert
to authenticated
with check (auth.uid() = user_id);
