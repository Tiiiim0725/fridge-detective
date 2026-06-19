-- Recipe Content v0.2 alignment
-- Align generated 200-recipe content with the current Profile/Pantry v0.2 contract.
-- Do not edit deployed 003/006/007 migrations; this migration layers the v0.2 changes.

alter table public.recipes
  add column if not exists recommendation_metadata jsonb null;

alter table public.recipes
  drop constraint if exists recipes_recommendation_metadata_object_check;

alter table public.recipes
  add constraint recipes_recommendation_metadata_object_check
    check (
      recommendation_metadata is null
      or jsonb_typeof(recommendation_metadata) = 'object'
    );

alter table public.ingredients
  drop constraint if exists ingredients_category_key_check;

alter table public.ingredients
  add constraint ingredients_category_key_check
    check (category_key in (
      'vegetable',
      'fruit',
      'fruit_snack',
      'protein',
      'seafood',
      'grain',
      'carb',
      'pantry',
      'seasoning',
      'dairy',
      'sweetener',
      'sauce'
    ));

alter table public.recipes
  drop constraint if exists recipes_cuisine_key_check;

alter table public.recipes
  add constraint recipes_cuisine_key_check
    check (cuisine_key in (
      'chinese_home',
      'western_simple',
      'shandong',
      'sichuan',
      'cantonese',
      'huaiyang',
      'chinese',
      'western',
      'korean',
      'japanese',
      'fusion'
    ));

alter table public.recipes
  drop constraint if exists recipes_difficulty_key_check;

alter table public.recipes
  add constraint recipes_difficulty_key_check
    check (difficulty_key in (
      'beginner',
      'normal',
      'confident',
      'easy',
      'medium',
      'hard'
    ));

alter table public.recipes
  drop constraint if exists recipes_estimated_cost_level_check;

alter table public.recipes
  add constraint recipes_estimated_cost_level_check
    check (
      estimated_cost_level is null
      or estimated_cost_level in ('low', 'low_to_medium', 'medium', 'high')
    );

alter table public.recipes
  drop constraint if exists recipes_meal_style_keys_check;

alter table public.recipes
  add constraint recipes_meal_style_keys_check
    check (
      meal_style_keys <@ array[
        'air_fryer',
        'blender_breakfast',
        'breakfast',
        'fridge_cleanout',
        'fried_rice',
        'microwave',
        'noodle',
        'pasta',
        'rice_bowl',
        'rice_cooker',
        'salad_light',
        'sandwich_wrap',
        'side',
        'soup_stew',
        'stir_fry',
        'quick_easy',
        'budget',
        'healthy_light',
        'high_protein',
        'one_pot',
        'low_cleanup',
        'comfort_food',
        'meal_prep'
      ]::text[]
      and (array_length(meal_style_keys, 1) is null or array_length(meal_style_keys, 1) <= 5)
    );

alter table public.recipes
  drop constraint if exists recipes_flavor_profile_keys_check;

alter table public.recipes
  add constraint recipes_flavor_profile_keys_check
    check (
      flavor_profile_keys <@ array[
        'balanced',
        'bright',
        'mild_spicy',
        'nutty',
        'savory',
        'slightly_sweet',
        'sweet',
        'garlicky',
        'light',
        'umami',
        'fresh',
        'spicy',
        'crispy',
        'tangy'
      ]::text[]
      and (array_length(flavor_profile_keys, 1) is null or array_length(flavor_profile_keys, 1) <= 4)
    );

alter table public.recipes
  drop constraint if exists recipes_scene_keys_check;

alter table public.recipes
  add constraint recipes_scene_keys_check
    check (
      scene_keys <@ array[
        'breakfast',
        'fridge_cleanout',
        'full_meal',
        'light_meal',
        'one_to_two_servings',
        'very_quick',
        'weekday_quick',
        'lunch',
        'dinner',
        'dessert',
        'leftover',
        'weeknight',
        'student_budget'
      ]::text[]
    );

alter table public.recipe_tools
  drop constraint if exists recipe_tools_equipment_key_check;

alter table public.recipe_tools
  add constraint recipe_tools_equipment_key_check
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
      'pan',
      'wok',
      'saucepan',
      'baking_tray',
      'ladle',
      'tongs',
      'mixing_bowl',
      'peeler',
      'measuring_cup'
    ));

alter table public.recipe_steps
  drop constraint if exists recipe_steps_equipment_keys_check;

alter table public.recipe_steps
  add constraint recipe_steps_equipment_keys_check
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
    ]::text[]);

alter table public.pantry_items
  drop constraint if exists pantry_items_pantry_item_key_check;

alter table public.pantry_items
  add constraint pantry_items_pantry_item_key_check
    check (pantry_item_key in (
      'cooking_oil',
      'olive_oil',
      'sesame_oil',
      'butter',
      'salt',
      'sugar',
      'black_pepper',
      'white_pepper',
      'soy_sauce',
      'light_soy_sauce',
      'dark_soy_sauce',
      'vinegar',
      'black_vinegar',
      'oyster_sauce',
      'cooking_wine',
      'ketchup',
      'mayonnaise',
      'mustard',
      'hot_sauce',
      'chili_flakes',
      'chili_oil',
      'cumin',
      'curry_powder',
      'garlic_powder',
      'paprika',
      'doubanjiang',
      'gochujang',
      'miso',
      'chili_crisp',
      'pasta_sauce',
      'curry_blocks',
      'rice',
      'pasta',
      'noodles',
      'instant_noodles',
      'flour',
      'cornstarch',
      'breadcrumbs',
      'canned_tuna',
      'canned_corn',
      'canned_tomato',
      'frozen_vegetables',
      'frozen_dumplings'
    ));

create index if not exists idx_recipes_recommendation_metadata
  on public.recipes using gin (recommendation_metadata);
