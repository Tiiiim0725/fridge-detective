-- Fridge Foundation v0.1
-- Private user fridge scans, scan photos, scan draft items, and confirmed fridge items.

create table public.fridge_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_mode text not null default 'guided_multi_photo',
  status text not null default 'draft',
  error_message text null,
  completed_at timestamptz null,
  confirmed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fridge_scans_scan_mode_check
    check (scan_mode in ('guided_multi_photo', 'manual', 'mock')),
  constraint fridge_scans_status_check
    check (status in (
      'draft',
      'photos_uploaded',
      'recognizing',
      'partially_recognized',
      'recognized',
      'confirmed',
      'failed',
      'cancelled'
    ))
);

create table public.fridge_scan_photos (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.fridge_scans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_bucket text not null default 'fridge-photos',
  storage_path text not null,
  photo_order integer not null,
  zone_key text not null,
  guide_prompt text not null,
  content_type text null,
  file_size integer null,
  width integer null,
  height integer null,
  recognition_status text not null default 'pending',
  ai_provider text null,
  ai_model text null,
  ai_raw_response jsonb null,
  ai_error_message text null,
  recognized_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fridge_scan_photos_photo_order_check
    check (photo_order > 0),
  constraint fridge_scan_photos_file_size_check
    check (file_size is null or file_size >= 0),
  constraint fridge_scan_photos_width_check
    check (width is null or width > 0),
  constraint fridge_scan_photos_height_check
    check (height is null or height > 0),
  constraint fridge_scan_photos_zone_key_check
    check (zone_key in (
      'fridge_top',
      'fridge_middle',
      'fridge_bottom',
      'fridge_door',
      'fridge_drawer',
      'fridge_extra'
    )),
  constraint fridge_scan_photos_recognition_status_check
    check (recognition_status in ('pending', 'recognizing', 'recognized', 'failed', 'skipped')),
  constraint fridge_scan_photos_scan_id_photo_order_unique
    unique (scan_id, photo_order),
  constraint fridge_scan_photos_user_storage_unique
    unique (user_id, storage_bucket, storage_path)
);

create table public.fridge_scan_items (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.fridge_scans(id) on delete cascade,
  photo_id uuid null references public.fridge_scan_photos(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_key text null references public.ingredients(ingredient_key) on update cascade on delete set null,
  raw_name text not null,
  display_name text not null,
  quantity_kind text not null default 'unknown',
  quantity_text text null,
  quantity_count integer null,
  confidence numeric null,
  source text not null default 'ai',
  status text not null default 'detected',
  needs_review boolean not null default true,
  uncertainty_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fridge_scan_items_quantity_kind_check
    check (quantity_kind in ('unknown', 'text', 'count')),
  constraint fridge_scan_items_quantity_check
    check (
      (
        quantity_kind = 'unknown'
        and quantity_text is null
        and quantity_count is null
      )
      or (
        quantity_kind = 'text'
        and quantity_text is not null
        and quantity_count is null
      )
      or (
        quantity_kind = 'count'
        and quantity_text is null
        and quantity_count is not null
        and quantity_count >= 0
      )
    ),
  constraint fridge_scan_items_confidence_check
    check (confidence is null or confidence between 0 and 1),
  constraint fridge_scan_items_source_check
    check (source in ('ai', 'manual', 'mock')),
  constraint fridge_scan_items_status_check
    check (status in ('detected', 'confirmed', 'edited', 'rejected'))
);

create table public.fridge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_key text null references public.ingredients(ingredient_key) on update cascade on delete set null,
  raw_name text not null,
  display_name text not null,
  quantity_kind text not null default 'unknown',
  quantity_text text null,
  quantity_count integer null,
  source text not null default 'scan_confirmed',
  status text not null default 'active',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fridge_items_quantity_kind_check
    check (quantity_kind in ('unknown', 'text', 'count')),
  constraint fridge_items_quantity_check
    check (
      (
        quantity_kind = 'unknown'
        and quantity_text is null
        and quantity_count is null
      )
      or (
        quantity_kind = 'text'
        and quantity_text is not null
        and quantity_count is null
      )
      or (
        quantity_kind = 'count'
        and quantity_text is null
        and quantity_count is not null
        and quantity_count >= 0
      )
    ),
  constraint fridge_items_source_check
    check (source in ('scan_confirmed', 'manual', 'mock')),
  constraint fridge_items_status_check
    check (status in ('active', 'removed'))
);

create index fridge_scans_user_id_idx on public.fridge_scans(user_id);
create index fridge_scans_user_status_idx on public.fridge_scans(user_id, status);
create index fridge_scans_created_at_idx on public.fridge_scans(created_at desc);

create index fridge_scan_photos_scan_id_idx on public.fridge_scan_photos(scan_id);
create index fridge_scan_photos_user_id_idx on public.fridge_scan_photos(user_id);
create index fridge_scan_photos_user_status_idx on public.fridge_scan_photos(user_id, recognition_status);
create index fridge_scan_photos_scan_order_idx on public.fridge_scan_photos(scan_id, photo_order);

create index fridge_scan_items_scan_id_idx on public.fridge_scan_items(scan_id);
create index fridge_scan_items_photo_id_idx on public.fridge_scan_items(photo_id);
create index fridge_scan_items_user_id_idx on public.fridge_scan_items(user_id);
create index fridge_scan_items_user_status_idx on public.fridge_scan_items(user_id, status);
create index fridge_scan_items_ingredient_key_idx on public.fridge_scan_items(ingredient_key);

create index fridge_items_user_id_idx on public.fridge_items(user_id);
create index fridge_items_user_status_idx on public.fridge_items(user_id, status);
create index fridge_items_ingredient_key_idx on public.fridge_items(ingredient_key);
create unique index fridge_items_unique_active_ingredient_idx
  on public.fridge_items(user_id, ingredient_key)
  where ingredient_key is not null and status = 'active';

create trigger trigger_fridge_scans_updated_at
  before update on public.fridge_scans
  for each row
  execute function public.set_updated_at();

create trigger trigger_fridge_scan_photos_updated_at
  before update on public.fridge_scan_photos
  for each row
  execute function public.set_updated_at();

create trigger trigger_fridge_scan_items_updated_at
  before update on public.fridge_scan_items
  for each row
  execute function public.set_updated_at();

create trigger trigger_fridge_items_updated_at
  before update on public.fridge_items
  for each row
  execute function public.set_updated_at();

grant select, insert, update, delete
on table public.fridge_scans
to authenticated;

grant select, insert, update, delete
on table public.fridge_scan_photos
to authenticated;

grant select, insert, update, delete
on table public.fridge_scan_items
to authenticated;

grant select, insert, update, delete
on table public.fridge_items
to authenticated;

alter table public.fridge_scans enable row level security;
alter table public.fridge_scan_photos enable row level security;
alter table public.fridge_scan_items enable row level security;
alter table public.fridge_items enable row level security;

create policy fridge_scans_select_policy on public.fridge_scans
  for select to authenticated
  using (auth.uid() = user_id);

create policy fridge_scans_insert_policy on public.fridge_scans
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy fridge_scans_update_policy on public.fridge_scans
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy fridge_scans_delete_policy on public.fridge_scans
  for delete to authenticated
  using (auth.uid() = user_id);

create policy fridge_scan_photos_select_policy on public.fridge_scan_photos
  for select to authenticated
  using (auth.uid() = user_id);

create policy fridge_scan_photos_insert_policy on public.fridge_scan_photos
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy fridge_scan_photos_update_policy on public.fridge_scan_photos
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy fridge_scan_photos_delete_policy on public.fridge_scan_photos
  for delete to authenticated
  using (auth.uid() = user_id);

create policy fridge_scan_items_select_policy on public.fridge_scan_items
  for select to authenticated
  using (auth.uid() = user_id);

create policy fridge_scan_items_insert_policy on public.fridge_scan_items
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy fridge_scan_items_update_policy on public.fridge_scan_items
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy fridge_scan_items_delete_policy on public.fridge_scan_items
  for delete to authenticated
  using (auth.uid() = user_id);

create policy fridge_items_select_policy on public.fridge_items
  for select to authenticated
  using (auth.uid() = user_id);

create policy fridge_items_insert_policy on public.fridge_items
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy fridge_items_update_policy on public.fridge_items
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy fridge_items_delete_policy on public.fridge_items
  for delete to authenticated
  using (auth.uid() = user_id);
