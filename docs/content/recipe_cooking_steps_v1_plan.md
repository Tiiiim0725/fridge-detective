# Recipe Cooking Steps v1 Plan

Date: 2026-06-26

## Goal

Build the cooking-step content foundation for the 200 recipe catalog.

This phase does not push database changes. It prepares:

- A 200-recipe working manifest keyed by `recipe_key`.
- A reusable `action_key` pool for future tutorial visuals.
- Five representative recipe samples.
- A validation script for content quality and schema safety.

## Data Targets

There are two existing step tables:

- `recipe_steps`: concise recipe-detail steps for `app/recipe/[recipeKey].tsx`.
- `recipe_tutorial_steps`: guided cooking steps for `/recipe/[recipeKey]/cook`.

Each final recipe should eventually have both:

- `recipe_steps`: 3-6 concise overview steps.
- `recipe_tutorial_steps`: 4-18 guided steps, depending on recipe complexity.

## Tutorial Step Rules

- Maximum 18 tutorial steps per recipe.
- No hard minimum.
- Simple recipes: 4-6 steps.
- Common stir-fries, rice bowls, noodles, pasta: 8-14 steps.
- Complex recipes: up to 15-18 steps.
- Do not split meaningless micro-steps just to increase count.
- Each title should be 4-10 Chinese characters.
- Each body should usually be 35-70 Chinese characters and should not exceed 90 Chinese characters.
- Each step should describe one primary action.
- Each step must include an executable state judgment, not only a time.
- Do not use absolute food-safety wording such as "绝对安全", "一定熟了", or "一定可食用".
- Put complex explanations in `assistant_context`, not the main body.
- `action_key` represents the core reusable visual action for the step.
- This phase only stores `action_key`; it does not create animation assets.

## Action Key v1 Pool

The first pool contains 28 reusable actions:

```txt
prep_ingredients
wash_ingredients
slice_vegetables
cut_meat
mix_sauce
marinate
beat_eggs
boil_water
cook_rice
heat_pan
add_oil
saute_aromatics
stir_fry
pan_fry
sear_meat
scramble_eggs
simmer
boil_noodles
steam
microwave
air_fry
bake
combine_ingredients
toss_salad
season
plate_dish
check_doneness
rest_food
```

The pool intentionally stays between 25 and 40 keys so future simple line animations remain manageable.

## Current Schema Notes

`recipe_tutorial_steps.action_key` references `cooking_action_assets(action_key)`.

Before inserting tutorial steps into Supabase, the action-key pool must exist in `cooking_action_assets`. If these rows are not already present remotely, a later migration should insert them before tutorial step batches.

The next migration number should be confirmed with main control before any database work. As of this planning pass, the repository contains migrations through `014_recipe_images_storage.sql`.

## Phase 1 Files

- `docs/content/recipe_cooking_steps_manifest_v1.csv`
  - Generated 200-recipe working list.
- `docs/content/recipe_cooking_steps_samples_v1.json`
  - Action-key pool and five sample recipes.
- `scripts/validate-recipe-cooking-steps-v1.mjs`
  - Local validation for action keys, step counts, title/body length, banned wording, and recipe-key coverage.

## Sample Coverage

The initial five samples cover:

- Simple stir-fry: `tomato_egg_stir_fry`
- Simple side: `garlic_broccoli`
- Normal meat stir-fry: `beef_onion_stir_fry`
- Pasta: `tomato_mushroom_pasta`
- Rice bowl/curry: `curry_chicken_rice`

## Later Batch Plan

After sample review:

- Batch A: recipe sort order 1-50.
- Batch B: recipe sort order 51-100.
- Batch C: recipe sort order 101-150.
- Batch D: recipe sort order 151-200.

Each batch should be validated before SQL generation. Formal database work should use migration list and dry-run before any remote `db push`.
