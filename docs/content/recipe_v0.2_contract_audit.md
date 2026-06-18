# Recipe Content v0.2 Contract Audit

Date: 2026-06-18

Branch: `integration/recipe-v0.2-recommendation`

Baseline: `origin/develop` at `a030f69`

## Source Policy

The locked formal JSON remains outside the app repository:

- External locked source: `/Users/nianqiao/Desktop/Fridge A/菜品生成/正式菜品库_200道_v0.2.json`
- Source version: `formal_recipes_200_v0.2`
- Source sha256: `4c9ee4fcabb4bdfcee233cf717982fba0212cbe08006a556b41fdabe9fa758d2`

The app repository stores only generated/app-facing artifacts:

- `supabase/seeds/recipe_seed_v0.2.sql`
- `docs/content/recipe_v0.2_contract_audit.md`
- Recipe summary and local recommendation result docs

## Confirmed Decisions

| Area | Decision |
| --- | --- |
| Recommendation metadata | Store curated recommendation data in `recipes.recommendation_metadata jsonb` for MVP. Do not force derivation from normalized relations yet. |
| Normalized relations | Keep `recipe_ingredients`, `recipe_tools`, `recipe_substitutions`, and `recipe_steps` for display, detail pages, and explainability. |
| Recipe meal style | `recipes.meal_style_keys` means recipe content form, such as `stir_fry`, `rice_bowl`, and `noodle`. It is separate from profile `MealStyleKey`. |
| Difficulty | Canonical recipe difficulty is `beginner`, `normal`, `confident`, aligned with User Profile v0.2 `cookingSkill`. |
| Pantry aliases | Add `black_vinegar` and `light_soy_sauce` as allowed pantry keys for free input / alias matching. They are not quick-grid items. |
| Basic pantry | `is_basic_pantry` remains only `salt` and `sugar`. |

## Content Summary

| Area | Result |
| --- | --- |
| Recipe count | 200 |
| Ingredient dictionary count | 128 |
| `ingredient_seed_v0.2.sql` coverage | Covers all 128 formal ingredient keys, plus 58 extra dictionary keys |
| Seed copied into app repo | `supabase/seeds/recipe_seed_v0.2.sql` |
| Image assets | Stay outside app repo for now; frontend image work is deferred |

## Distinct Keys From Formal JSON

| Key family | Values |
| --- | --- |
| `cuisine_key` | `cantonese`, `chinese_home`, `huaiyang`, `shandong`, `sichuan`, `western_simple` |
| `difficulty` / `cooking_skill_fit` | `beginner`, `normal`, `confident` |
| `estimated_cost_level` | `low`, `low_to_medium`, `medium` |
| `ingredient.category_key` | `carb`, `fruit_snack`, `pantry`, `protein`, `vegetable` |
| `meal_style_keys` / `meal_type` | `air_fryer`, `blender_breakfast`, `breakfast`, `fridge_cleanout`, `fried_rice`, `microwave`, `noodle`, `pasta`, `rice_bowl`, `rice_cooker`, `salad_light`, `sandwich_wrap`, `side`, `soup_stew`, `stir_fry` |
| `flavor_profile_keys` | `balanced`, `bright`, `mild_spicy`, `nutty`, `savory`, `sweet` |
| `scene_keys` | `breakfast`, `fridge_cleanout`, `full_meal`, `light_meal`, `one_to_two_servings`, `very_quick`, `weekday_quick` |
| `required_equipment` / step equipment | `air_fryer`, `blender`, `bowl`, `chopsticks_or_fork`, `cutting_board`, `frying_pan_or_wok`, `knife`, `microwave`, `plate`, `pot`, `rice_cooker`, `spatula`, `spoon`, `steamer`, `stove_or_hotplate` |
| `dietary_rules_supported` | `none`, `vegetarian`, `vegan`, `halal_friendly` |
| `pantry_match_keys` | `black_pepper`, `black_vinegar`, `cooking_oil`, `cornstarch`, `hot_sauce`, `light_soy_sauce`, `mustard`, `olive_oil`, `salt`, `sesame_oil`, `soy_sauce`, `sugar`, `white_pepper` |

## Implemented Alignment

| Formal JSON field | SQL table / field | TypeScript type | recipeService return field | Recommendation use |
| --- | --- | --- | --- | --- |
| `recipe_key` | `recipes.recipe_key` | `Recipe.recipeKey` | `candidate.recipe.recipeKey` | Identity and detail navigation |
| `cuisine_key` | `recipes.cuisine_key` | `RecipeCuisineKey` | `candidate.recipe.cuisineKey` | Cuisine preference scoring |
| `difficulty` | `recipes.difficulty_key` | `RecipeDifficultyKey` | `candidate.recipe.difficultyKey` | Skill fit and display |
| `cook_time_minutes` | `recipes.total_time_minutes`, `recipes.cook_time_minutes` | `Recipe.totalTimeMinutes`, `Recipe.cookTimeMinutes` | `candidate.recipe` | `cookTimePreferenceKey` filter |
| `meal_style_keys` | `recipes.meal_style_keys` | `RecipeMealStyleKey[]` | `candidate.recipe.mealStyleKeys` | Content-style boosts and chips |
| `flavor_profile_keys` | `recipes.flavor_profile_keys` | `FlavorProfileKey[]` | `candidate.recipe.flavorProfileKeys` | Display and optional ranking |
| `scene_keys` | `recipes.scene_keys` | `RecipeSceneKey[]` | `candidate.recipe.sceneKeys` | Scene boosts and display |
| `required_equipment` | `recipe_tools.equipment_key` | `KitchenEquipmentKey` | `candidate.tools` | Equipment hard filter |
| `minimum_required_ingredients` | `recipe_ingredients` with `is_minimum_required = true` | `RecipeIngredientDetail[]` | `candidate.ingredients` | Fridge core coverage |
| `optional_ingredients` | `recipe_ingredients` with `necessity_key = optional` | `RecipeIngredientDetail[]` | `candidate.ingredients` | Optional boost |
| `substitutions` | `recipe_substitutions` | `RecipeSubstitutionDetail[]` | `candidate.substitutions` | Substitute coverage |
| `preference_match` and related fields | `recipes.recommendation_metadata` | `RecipeRecommendationMetadata` | `candidate.recipe.recommendationMetadata` | MVP recommendation scoring |

## 008 Migration Scope

`supabase/migrations/008_recipe_content_v0_2_alignment.sql` layers v0.2 changes without modifying deployed migrations:

- Adds `recipes.recommendation_metadata jsonb` and a JSON object check.
- Adds a GIN index for `recommendation_metadata`.
- Expands ingredient category, cuisine, cost, content meal style, flavor, scene, and equipment constraints for v0.2 content.
- Keeps legacy SQL values where needed so existing v0.1 rows do not make migration fail.
- Adds `black_vinegar` and `light_soy_sauce` to `pantry_items` allowed keys.

## Profile Input Contract

Use current User Profile v0.2 fields:

| Old local test field | Current app field | Adapter rule |
| --- | --- | --- |
| `maxCookTime` | `preferences.cookTimePreferenceKey` | `under_15 -> 15`, `under_30 -> 30`, `under_45 -> 45`, `over_45_ok -> no 45-minute cap` |
| `kitchenEquipment` | `onboardingContext.equipmentKeys` | Use `getOnboardingContext()` |
| `pantryItems` | `onboardingContext.pantryItemKeys` | Use `getOnboardingContext()` and pantry dictionary |
| `fridgeIngredientKeys` | `getCurrentFridgeItems().map(item => item.ingredientKey)` | Filter null keys before scoring |

## Remaining Team Questions

1. Should a later migration clean up legacy SQL values such as `easy/medium/hard` after all old recipe rows are removed?
2. Should `recommendation_metadata` get runtime validation in `recommendationService`, or is generated-seed validation enough for MVP?
3. Should `recipe_seed_v0.2.sql` eventually split ingredient dictionary seeding from recipe seeding to avoid overlapping with `ingredient_seed_v0.2.sql`?
