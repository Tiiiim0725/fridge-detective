-- Recipe / Ingredient Foundation v0.1
-- Public read-only recipe knowledge base for recommendation candidates and tutorial detail.

create table public.ingredients (
  ingredient_key text primary key,
  zh_name text not null,
  en_name text not null,
  category_key text not null,
  aliases text[] not null default '{}',
  default_unit_key text null,
  is_fresh boolean not null default true,
  is_pantry_item boolean not null default false,
  is_active boolean not null default true,
  sort_order integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ingredients_ingredient_key_format_check
    check (ingredient_key ~ '^[a-z][a-z0-9_]*$'),
  constraint ingredients_category_key_check
    check (category_key in (
      'vegetable', 'fruit', 'protein', 'seafood', 'grain', 'pantry', 'seasoning', 'dairy', 'sweetener', 'sauce'
    )),
  constraint ingredients_aliases_length_check
    check (array_length(aliases, 1) is null or array_length(aliases, 1) <= 8),
  constraint ingredients_default_unit_key_check
    check (
      default_unit_key is null
      or default_unit_key in ('piece', 'gram', 'ml', 'tbsp', 'tsp', 'cup', 'serving', 'pinch')
    )
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  recipe_key text unique not null,
  zh_name text not null,
  en_name text null,
  description text null,
  cuisine_key text not null,
  difficulty_key text not null,
  total_time_minutes integer not null,
  prep_time_minutes integer null,
  cook_time_minutes integer null,
  serving_count integer not null default 1,
  estimated_cost_level text null,
  meal_style_keys text[] not null default '{}',
  flavor_profile_keys text[] not null default '{}',
  scene_keys text[] not null default '{}',
  cover_image_url text null,
  card_image_url text null,
  is_active boolean not null default true,
  sort_order integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recipes_recipe_key_format_check
    check (recipe_key ~ '^[a-z][a-z0-9_]*$'),
  constraint recipes_cuisine_key_check
    check (cuisine_key in ('chinese', 'western', 'korean', 'japanese', 'fusion')),
  constraint recipes_difficulty_key_check
    check (difficulty_key in ('easy', 'medium', 'hard')),
  constraint recipes_total_time_minutes_check
    check (total_time_minutes > 0 and total_time_minutes <= 180),
  constraint recipes_prep_time_minutes_check
    check (prep_time_minutes is null or prep_time_minutes >= 0),
  constraint recipes_cook_time_minutes_check
    check (cook_time_minutes is null or cook_time_minutes >= 0),
  constraint recipes_serving_count_check
    check (serving_count > 0 and serving_count <= 8),
  constraint recipes_estimated_cost_level_check
    check (estimated_cost_level is null or estimated_cost_level in ('low', 'medium', 'high')),
  constraint recipes_meal_style_keys_check
    check (
      meal_style_keys <@ array[
        'quick_easy', 'budget', 'healthy_light', 'high_protein', 'one_pot', 'low_cleanup', 'comfort_food', 'meal_prep'
      ]::text[]
      and (array_length(meal_style_keys, 1) is null or array_length(meal_style_keys, 1) <= 3)
    ),
  constraint recipes_flavor_profile_keys_check
    check (
      flavor_profile_keys <@ array[
        'savory', 'slightly_sweet', 'sweet', 'garlicky', 'light', 'umami', 'fresh', 'spicy', 'crispy', 'tangy'
      ]::text[]
      and (array_length(flavor_profile_keys, 1) is null or array_length(flavor_profile_keys, 1) <= 4)
    ),
  constraint recipes_scene_keys_check
    check (
      scene_keys <@ array[
        'breakfast', 'lunch', 'dinner', 'dessert', 'leftover', 'weeknight', 'student_budget'
      ]::text[]
    )
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_key text not null references public.ingredients(ingredient_key),
  role_key text not null,
  necessity_key text not null,
  is_minimum_required boolean not null default false,
  quantity_text text null,
  quantity_value numeric null,
  unit_key text null,
  sort_order integer not null default 0,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recipe_ingredients_recipe_id_ingredient_key_unique unique (recipe_id, ingredient_key),
  constraint recipe_ingredients_role_key_check
    check (role_key in ('main', 'side', 'seasoning', 'garnish')),
  constraint recipe_ingredients_necessity_key_check
    check (necessity_key in ('required', 'recommended', 'optional')),
  constraint recipe_ingredients_quantity_value_check
    check (quantity_value is null or quantity_value >= 0),
  constraint recipe_ingredients_unit_key_check
    check (
      unit_key is null
      or unit_key in ('piece', 'gram', 'ml', 'tbsp', 'tsp', 'cup', 'serving', 'pinch')
    )
);

create table public.recipe_tools (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  equipment_key text not null,
  necessity_key text not null,
  sort_order integer not null default 0,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recipe_tools_recipe_id_equipment_key_unique unique (recipe_id, equipment_key),
  constraint recipe_tools_equipment_key_check
    check (equipment_key in (
      'pot', 'pan', 'wok', 'saucepan', 'baking_tray', 'rice_cooker', 'air_fryer', 'oven', 'microwave', 'blender', 'toaster', 'knife', 'cutting_board', 'spatula', 'ladle', 'tongs', 'mixing_bowl', 'peeler', 'measuring_cup'
    )),
  constraint recipe_tools_necessity_key_check
    check (necessity_key in ('required', 'recommended', 'optional'))
);

create table public.recipe_substitutions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_key text not null references public.ingredients(ingredient_key),
  substitute_ingredient_key text not null references public.ingredients(ingredient_key),
  quality_impact numeric not null default 0.8,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recipe_substitutions_unique unique (recipe_id, ingredient_key, substitute_ingredient_key),
  constraint recipe_substitutions_quality_impact_check
    check (quality_impact > 0 and quality_impact <= 1),
  constraint recipe_substitutions_not_self_check
    check (ingredient_key <> substitute_ingredient_key)
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number integer not null,
  title text null,
  body text not null,
  estimated_minutes integer null,
  timer_seconds integer null,
  image_url text null,
  ingredient_keys text[] not null default '{}',
  equipment_keys text[] not null default '{}',
  tips text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recipe_steps_recipe_id_step_number_unique unique (recipe_id, step_number),
  constraint recipe_steps_step_number_check
    check (step_number > 0),
  constraint recipe_steps_estimated_minutes_check
    check (estimated_minutes is null or estimated_minutes >= 0),
  constraint recipe_steps_timer_seconds_check
    check (timer_seconds is null or timer_seconds >= 0),
  constraint recipe_steps_equipment_keys_check
    check (equipment_keys <@ array[
      'pot', 'pan', 'wok', 'saucepan', 'baking_tray', 'rice_cooker', 'air_fryer', 'oven', 'microwave', 'blender', 'toaster', 'knife', 'cutting_board', 'spatula', 'ladle', 'tongs', 'mixing_bowl', 'peeler', 'measuring_cup'
    ]::text[])
);

create index idx_ingredients_category_key on public.ingredients(category_key);
create index idx_ingredients_is_active on public.ingredients(is_active);
create index idx_ingredients_aliases on public.ingredients using gin(aliases);

create index idx_recipes_is_active_sort_order on public.recipes(is_active, sort_order);
create index idx_recipes_cuisine_key on public.recipes(cuisine_key);
create index idx_recipes_meal_style_keys on public.recipes using gin(meal_style_keys);
create index idx_recipes_flavor_profile_keys on public.recipes using gin(flavor_profile_keys);

create index idx_recipe_ingredients_recipe_id on public.recipe_ingredients(recipe_id);
create index idx_recipe_ingredients_ingredient_key on public.recipe_ingredients(ingredient_key);
create index idx_recipe_ingredients_minimum_required on public.recipe_ingredients(recipe_id, is_minimum_required);

create index idx_recipe_tools_recipe_id on public.recipe_tools(recipe_id);
create index idx_recipe_tools_equipment_key on public.recipe_tools(equipment_key);

create index idx_recipe_substitutions_recipe_id on public.recipe_substitutions(recipe_id);
create index idx_recipe_substitutions_ingredient_key on public.recipe_substitutions(ingredient_key);

create index idx_recipe_steps_recipe_id_step_number on public.recipe_steps(recipe_id, step_number);
create index idx_recipe_steps_ingredient_keys on public.recipe_steps using gin(ingredient_keys);

create trigger trigger_ingredients_updated_at
  before update on public.ingredients
  for each row
  execute function public.set_updated_at();

create trigger trigger_recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.set_updated_at();

create trigger trigger_recipe_ingredients_updated_at
  before update on public.recipe_ingredients
  for each row
  execute function public.set_updated_at();

create trigger trigger_recipe_tools_updated_at
  before update on public.recipe_tools
  for each row
  execute function public.set_updated_at();

create trigger trigger_recipe_substitutions_updated_at
  before update on public.recipe_substitutions
  for each row
  execute function public.set_updated_at();

create trigger trigger_recipe_steps_updated_at
  before update on public.recipe_steps
  for each row
  execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;

grant select on table public.ingredients to anon, authenticated;
grant select on table public.recipes to anon, authenticated;
grant select on table public.recipe_ingredients to anon, authenticated;
grant select on table public.recipe_tools to anon, authenticated;
grant select on table public.recipe_substitutions to anon, authenticated;
grant select on table public.recipe_steps to anon, authenticated;

alter table public.ingredients enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_tools enable row level security;
alter table public.recipe_substitutions enable row level security;
alter table public.recipe_steps enable row level security;

create policy ingredients_select_policy on public.ingredients
  for select to anon, authenticated
  using (true);

create policy recipes_select_policy on public.recipes
  for select to anon, authenticated
  using (true);

create policy recipe_ingredients_select_policy on public.recipe_ingredients
  for select to anon, authenticated
  using (true);

create policy recipe_tools_select_policy on public.recipe_tools
  for select to anon, authenticated
  using (true);

create policy recipe_substitutions_select_policy on public.recipe_substitutions
  for select to anon, authenticated
  using (true);

create policy recipe_steps_select_policy on public.recipe_steps
  for select to anon, authenticated
  using (true);
