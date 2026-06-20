-- Cooking Tutorial Core v0.1
-- Reuses public.recipes as the recipe source of truth and keeps user sessions private.

create table public.cooking_action_assets (
  id uuid primary key default gen_random_uuid(),
  action_key text not null unique,
  zh_name text not null,
  en_name text not null,
  asset_type text not null default 'placeholder',
  asset_url text null,
  fallback_icon text null,
  short_hint text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cooking_action_assets_action_key_format_check
    check (action_key ~ '^[a-z][a-z0-9_]*$'),
  constraint cooking_action_assets_type_check
    check (asset_type in ('placeholder', 'image', 'gif', 'lottie', 'svg', 'video')),
  constraint cooking_action_assets_sort_order_check
    check (sort_order >= 0)
);

create table public.recipe_tutorial_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number integer not null,
  title text not null,
  body text not null,
  action_key text not null references public.cooking_action_assets(action_key),
  ingredient_keys text[] not null default '{}',
  equipment_keys text[] not null default '{}',
  estimated_minutes integer null,
  timer_seconds integer null,
  assistant_context text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recipe_tutorial_steps_recipe_step_unique
    unique (recipe_id, step_number),
  constraint recipe_tutorial_steps_step_number_check
    check (step_number > 0),
  constraint recipe_tutorial_steps_estimated_minutes_check
    check (estimated_minutes is null or estimated_minutes >= 0),
  constraint recipe_tutorial_steps_timer_seconds_check
    check (timer_seconds is null or timer_seconds >= 0),
  constraint recipe_tutorial_steps_equipment_keys_check
    check (equipment_keys <@ array[
      'knife',
      'cutting_board',
      'bowl',
      'plate',
      'spoon',
      'chopsticks_or_fork',
      'spatula',
      'basic_storage_container',
      'stove_or_hotplate',
      'frying_pan_or_wok',
      'pot',
      'rice_cooker',
      'microwave',
      'oven',
      'air_fryer',
      'electric_kettle',
      'steamer',
      'blender',
      'pressure_cooker',
      'toaster',
      'pan',
      'wok',
      'saucepan',
      'baking_tray',
      'ladle',
      'tongs',
      'mixing_bowl',
      'peeler',
      'measuring_cup'
    ]::text[])
);

create table public.cooking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  current_step_number integer not null default 1,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cooking_sessions_step_number_check
    check (current_step_number > 0),
  constraint cooking_sessions_status_check
    check (status in ('active', 'paused', 'completed')),
  constraint cooking_sessions_completed_at_check
    check (
      (status = 'completed' and completed_at is not null)
      or (status <> 'completed' and completed_at is null)
    )
);

create index idx_recipe_tutorial_steps_recipe
  on public.recipe_tutorial_steps(recipe_id, step_number);

create index idx_cooking_action_assets_sort_order
  on public.cooking_action_assets(sort_order, action_key);

create index idx_cooking_sessions_user_history
  on public.cooking_sessions(user_id, updated_at desc);

create unique index idx_cooking_sessions_one_open_per_recipe
  on public.cooking_sessions(user_id, recipe_id)
  where status in ('active', 'paused');

create trigger trigger_cooking_action_assets_updated_at
  before update on public.cooking_action_assets
  for each row
  execute function public.set_updated_at();

create trigger trigger_recipe_tutorial_steps_updated_at
  before update on public.recipe_tutorial_steps
  for each row
  execute function public.set_updated_at();

create trigger trigger_cooking_sessions_updated_at
  before update on public.cooking_sessions
  for each row
  execute function public.set_updated_at();

grant select on table public.cooking_action_assets to anon, authenticated;
grant select on table public.recipe_tutorial_steps to anon, authenticated;
grant select, insert, update on table public.cooking_sessions to authenticated;

alter table public.cooking_action_assets enable row level security;
alter table public.recipe_tutorial_steps enable row level security;
alter table public.cooking_sessions enable row level security;

create policy cooking_action_assets_select_policy
on public.cooking_action_assets for select
to anon, authenticated
using (true);

create policy recipe_tutorial_steps_select_policy
on public.recipe_tutorial_steps for select
to anon, authenticated
using (true);

create policy cooking_sessions_select_policy
on public.cooking_sessions for select
to authenticated
using (auth.uid() = user_id);

create policy cooking_sessions_insert_policy
on public.cooking_sessions for insert
to authenticated
with check (auth.uid() = user_id);

create policy cooking_sessions_update_policy
on public.cooking_sessions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
