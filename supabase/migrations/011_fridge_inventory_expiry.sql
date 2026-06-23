-- Fridge inventory expiry v1
-- Adds user inventory facts and public ingredient storage guidance.

alter table public.fridge_items
  add column if not exists stored_at timestamptz null,
  add column if not exists opened_at timestamptz null,
  add column if not exists expires_at date null,
  add column if not exists storage_location text not null default 'fridge',
  add column if not exists expiry_source text not null default 'system_suggested';

update public.fridge_items
set stored_at = coalesce(stored_at, last_seen_at, created_at),
    storage_location = coalesce(storage_location, 'fridge'),
    expiry_source = coalesce(expiry_source, 'system_suggested')
where stored_at is null
   or storage_location is null
   or expiry_source is null;

alter table public.fridge_items
  drop constraint if exists fridge_items_storage_location_check,
  add constraint fridge_items_storage_location_check
    check (storage_location in ('fridge', 'freezer', 'pantry', 'room_temp'));

alter table public.fridge_items
  drop constraint if exists fridge_items_expiry_source_check,
  add constraint fridge_items_expiry_source_check
    check (expiry_source in ('system_suggested', 'user_override', 'unknown'));

alter table public.fridge_items
  drop constraint if exists fridge_items_opened_after_stored_check,
  add constraint fridge_items_opened_after_stored_check
    check (opened_at is null or stored_at is null or opened_at >= stored_at);

alter table public.fridge_items
  drop constraint if exists fridge_items_expires_after_stored_check,
  add constraint fridge_items_expires_after_stored_check
    check (expires_at is null or stored_at is null or expires_at >= stored_at::date);

create index if not exists fridge_items_user_expiry_idx
  on public.fridge_items(user_id, status, expires_at);

create index if not exists fridge_items_user_storage_location_idx
  on public.fridge_items(user_id, status, storage_location);

create table if not exists public.ingredient_storage_guidelines (
  id uuid primary key default gen_random_uuid(),
  ingredient_key text not null references public.ingredients(ingredient_key) on update cascade on delete cascade,
  storage_location text not null,
  suggested_days_min integer not null,
  suggested_days_max integer not null,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ingredient_storage_guidelines_storage_location_check
    check (storage_location in ('fridge', 'freezer', 'pantry', 'room_temp')),
  constraint ingredient_storage_guidelines_days_check
    check (
      suggested_days_min > 0
      and suggested_days_max >= suggested_days_min
      and suggested_days_max <= 730
    ),
  constraint ingredient_storage_guidelines_unique
    unique (ingredient_key, storage_location)
);

create index if not exists ingredient_storage_guidelines_ingredient_idx
  on public.ingredient_storage_guidelines(ingredient_key);

create trigger trigger_ingredient_storage_guidelines_updated_at
  before update on public.ingredient_storage_guidelines
  for each row
  execute function public.set_updated_at();

grant select
on table public.ingredient_storage_guidelines
to anon, authenticated;

alter table public.ingredient_storage_guidelines enable row level security;

create policy ingredient_storage_guidelines_select_policy on public.ingredient_storage_guidelines
  for select to anon, authenticated
  using (true);

with guideline_seed(ingredient_key, storage_location, suggested_days_min, suggested_days_max, note) as (
  values
    ('egg', 'fridge', 21, 35, '蛋类以包装日期和气味观察为准，破壳或明显异味时不要食用。'),
    ('tomato', 'fridge', 3, 7, '成熟番茄冷藏可延缓软化，口感可能下降。'),
    ('cabbage', 'fridge', 7, 14, '切开后建议尽快用完，并保持切面包裹。'),
    ('lettuce', 'fridge', 3, 5, '叶菜洗后需沥干并密封冷藏。'),
    ('spinach', 'fridge', 2, 4, '叶菜类建议尽快食用。'),
    ('broccoli', 'fridge', 3, 5, '花球变黄或异味时不要食用。'),
    ('mushroom', 'fridge', 3, 5, '蘑菇受潮容易变软，建议纸袋或透气保存。'),
    ('tofu', 'fridge', 2, 4, '开封后需换清水冷藏，并尽快食用。'),
    ('milk', 'fridge', 3, 7, '开封后按包装说明并尽快饮用。'),
    ('chicken', 'fridge', 1, 2, '生肉冷藏时间较短，长期保存建议冷冻。'),
    ('beef', 'fridge', 2, 3, '生肉冷藏时间较短，长期保存建议冷冻。'),
    ('pork', 'fridge', 2, 3, '生肉冷藏时间较短，长期保存建议冷冻。'),
    ('fish', 'fridge', 1, 2, '水产建议尽快烹饪，长期保存建议冷冻。'),
    ('shrimp', 'fridge', 1, 2, '水产建议尽快烹饪，长期保存建议冷冻。'),
    ('carrot', 'fridge', 14, 21, '根茎类冷藏保存相对稳定，避免表面潮湿。'),
    ('potato', 'room_temp', 14, 30, '避光、通风保存，不建议冷藏。'),
    ('onion', 'room_temp', 14, 30, '保持干燥通风，切开后冷藏并尽快食用。'),
    ('garlic', 'room_temp', 21, 60, '保持干燥通风，发霉或异味时不要食用。')
)
insert into public.ingredient_storage_guidelines (
  ingredient_key,
  storage_location,
  suggested_days_min,
  suggested_days_max,
  note
)
select
  guideline_seed.ingredient_key,
  guideline_seed.storage_location,
  guideline_seed.suggested_days_min,
  guideline_seed.suggested_days_max,
  guideline_seed.note
from guideline_seed
where exists (
  select 1
  from public.ingredients
  where ingredients.ingredient_key = guideline_seed.ingredient_key
)
on conflict (ingredient_key, storage_location) do update
set suggested_days_min = excluded.suggested_days_min,
    suggested_days_max = excluded.suggested_days_max,
    note = excluded.note;
