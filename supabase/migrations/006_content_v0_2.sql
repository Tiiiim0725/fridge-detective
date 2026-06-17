-- Content v0.2 foundation
-- Ingredient dictionary metadata and User Preference v0.2 constraints.

alter table public.ingredients
  add column if not exists content_tier text null,
  add column if not exists subcategory_key text null,
  add column if not exists storage_type text null,
  add column if not exists is_basic_pantry boolean not null default false,
  add column if not exists is_fridge_recognition_target boolean not null default false;

alter table public.ingredients
  drop constraint if exists ingredients_content_tier_check,
  add constraint ingredients_content_tier_check
    check (content_tier is null or content_tier in ('P0', 'P1', 'P2'));

alter table public.ingredients
  drop constraint if exists ingredients_storage_type_check,
  add constraint ingredients_storage_type_check
    check (
      storage_type is null
      or storage_type in ('fridge', 'freezer', 'pantry', 'canned', 'room_temp')
    );

create index if not exists idx_ingredients_content_tier
  on public.ingredients(content_tier);

create index if not exists idx_ingredients_fridge_recognition_target
  on public.ingredients(is_fridge_recognition_target);

alter table public.user_preferences
  add column if not exists cook_time_preference_key text default 'under_30',
  add column if not exists cooking_skill text default 'normal';

alter table public.user_preferences
  drop constraint if exists user_preferences_cook_time_preference_key_check,
  add constraint user_preferences_cook_time_preference_key_check
    check (
      cook_time_preference_key is null
      or cook_time_preference_key in ('under_15', 'under_30', 'under_45', 'over_45_ok')
    );

alter table public.user_preferences
  alter column cook_time_preference_key set default 'under_30';

alter table public.user_preferences
  alter column cooking_skill set default 'normal';

alter table public.user_preferences
  drop constraint if exists user_preferences_cooking_skill_check,
  add constraint user_preferences_cooking_skill_check
    check (
      cooking_skill is null
      or cooking_skill in ('beginner', 'normal', 'confident')
    );

alter table public.user_preferences
  drop constraint if exists user_preferences_cuisine_preferences_check;

alter table public.user_preferences
  add constraint user_preferences_cuisine_preferences_check
    check (
      cuisine_preferences <@ array[
        'chinese_home',
        'western_simple',
        'shandong',
        'sichuan',
        'cantonese',
        'huaiyang'
      ]::text[]
      and (
        coalesce(array_length(array_positions(cuisine_preferences, 'shandong'), 1), 0)
        + coalesce(array_length(array_positions(cuisine_preferences, 'sichuan'), 1), 0)
        + coalesce(array_length(array_positions(cuisine_preferences, 'cantonese'), 1), 0)
        + coalesce(array_length(array_positions(cuisine_preferences, 'huaiyang'), 1), 0)
        <= 2
      )
    ) not valid;

alter table public.user_preferences
  drop constraint if exists user_preferences_diet_tags_check;

alter table public.user_preferences
  add constraint user_preferences_diet_tags_check
    check (
      diet_tags <@ array[
        'none',
        'vegetarian',
        'vegan',
        'halal_friendly'
      ]::text[]
      and not (
        'none' = any(diet_tags)
        and array_length(diet_tags, 1) > 1
      )
    ) not valid;

alter table public.user_preferences
  drop constraint if exists user_preferences_disliked_ingredient_keys_check;

alter table public.user_preferences
  add constraint user_preferences_disliked_ingredient_keys_check
    check (array_position(disliked_ingredient_keys, null::text) is null) not valid;

alter table public.kitchen_equipment
  drop constraint if exists kitchen_equipment_equipment_key_check;

alter table public.kitchen_equipment
  add constraint kitchen_equipment_equipment_key_check
    check (equipment_key in (
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
      -- Legacy keys kept for Recipe / Ingredient Foundation v0.1 compatibility.
      'pan',
      'wok',
      'saucepan',
      'baking_tray',
      'ladle',
      'tongs',
      'mixing_bowl',
      'peeler',
      'measuring_cup'
    )) not valid;
