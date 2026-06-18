// types/recipe.ts
// Recipe / Ingredient Foundation v0.2 - Domain Types
// Responsibilities: recipe knowledge-base types, service return shapes, and key dictionaries.

import type { KitchenEquipmentKey } from '@/types/profile'

export type IngredientCategoryKey =
  | 'vegetable'
  | 'fruit'
  | 'fruit_snack'
  | 'protein'
  | 'seafood'
  | 'grain'
  | 'carb'
  | 'pantry'
  | 'seasoning'
  | 'dairy'
  | 'sweetener'
  | 'sauce'

export type IngredientContentTier = 'P0' | 'P1' | 'P2'

export type IngredientStorageType = 'fridge' | 'freezer' | 'pantry' | 'canned' | 'room_temp'

export type RecipeCuisineKey =
  | 'chinese_home'
  | 'western_simple'
  | 'shandong'
  | 'sichuan'
  | 'cantonese'
  | 'huaiyang'
  | 'chinese'
  | 'western'
  | 'korean'
  | 'japanese'
  | 'fusion'

export type RecipeDifficultyKey = 'beginner' | 'normal' | 'confident'

export type RecipeCostLevelKey = 'low' | 'low_to_medium' | 'medium' | 'high'

export type RecipeMealStyleKey =
  | 'air_fryer'
  | 'blender_breakfast'
  | 'breakfast'
  | 'fridge_cleanout'
  | 'fried_rice'
  | 'microwave'
  | 'noodle'
  | 'pasta'
  | 'rice_bowl'
  | 'rice_cooker'
  | 'salad_light'
  | 'sandwich_wrap'
  | 'side'
  | 'soup_stew'
  | 'stir_fry'
  | 'quick_easy'
  | 'budget'
  | 'healthy_light'
  | 'high_protein'
  | 'one_pot'
  | 'low_cleanup'
  | 'comfort_food'
  | 'meal_prep'

export type FlavorProfileKey =
  | 'balanced'
  | 'bright'
  | 'mild_spicy'
  | 'nutty'
  | 'savory'
  | 'slightly_sweet'
  | 'sweet'
  | 'garlicky'
  | 'light'
  | 'umami'
  | 'fresh'
  | 'spicy'
  | 'crispy'
  | 'tangy'

export type RecipeSceneKey =
  | 'breakfast'
  | 'fridge_cleanout'
  | 'full_meal'
  | 'light_meal'
  | 'one_to_two_servings'
  | 'very_quick'
  | 'weekday_quick'
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'leftover'
  | 'weeknight'
  | 'student_budget'

export type IngredientRoleKey = 'main' | 'side' | 'seasoning' | 'garnish'

export type NecessityKey = 'required' | 'recommended' | 'optional'

export type UnitKey = 'piece' | 'gram' | 'ml' | 'tbsp' | 'tsp' | 'cup' | 'serving' | 'pinch'

export type RecommendationCookTimeFitKey = 15 | 30 | 45 | '60_plus'

export type RecipeJsonValue =
  | string
  | number
  | boolean
  | null
  | RecipeJsonValue[]
  | { [key: string]: RecipeJsonValue }

export interface RecipePreferenceMatchMetadata {
  dietary_rule_keys?: string[]
  cuisine_preference_keys?: string[]
  max_cook_time_fit?: RecommendationCookTimeFitKey[]
  cooking_skill_fit?: RecipeDifficultyKey[]
  required_equipment_keys?: KitchenEquipmentKey[]
  avoid_ingredient_hard_filter_keys?: string[]
  avoid_ingredient_soft_conflict_keys?: string[]
  fridge_core_match_keys?: string[]
  fridge_optional_boost_keys?: string[]
  pantry_match_keys?: string[]
  substitution_match_keys?: string[]
  ranking_boost_keys?: string[]
  [key: string]: unknown
}

export interface RecipeRecommendationMetadata {
  source_version?: string
  source_sha256?: string
  dietary_rules_supported?: string[]
  max_cook_time_fit?: RecommendationCookTimeFitKey[]
  cooking_skill_fit?: RecipeDifficultyKey[]
  spice_level?: 'none' | 'mild' | 'medium' | 'hot'
  leftover_friendly?: boolean
  visual_quality?: string | null
  budget_note?: string | null
  tags?: string[]
  student_friendliness?: string | null
  preference_match?: RecipePreferenceMatchMetadata
  [key: string]: unknown
}

export interface Ingredient {
  ingredientKey: string
  zhName: string
  enName: string
  categoryKey: IngredientCategoryKey
  aliases: string[]
  defaultUnitKey: UnitKey | null
  isFresh: boolean
  isPantryItem: boolean
  isActive: boolean
  sortOrder: number | null
  contentTier?: IngredientContentTier | null
  subcategoryKey?: string | null
  storageType?: IngredientStorageType | null
  isBasicPantry?: boolean
  isFridgeRecognitionTarget?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Recipe {
  id: string
  recipeKey: string
  zhName: string
  enName: string | null
  description: string | null
  cuisineKey: RecipeCuisineKey
  difficultyKey: RecipeDifficultyKey
  totalTimeMinutes: number
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servingCount: number
  estimatedCostLevel: RecipeCostLevelKey | null
  mealStyleKeys: RecipeMealStyleKey[]
  flavorProfileKeys: FlavorProfileKey[]
  sceneKeys: RecipeSceneKey[]
  recommendationMetadata: RecipeRecommendationMetadata | null
  coverImageUrl: string | null
  cardImageUrl: string | null
  isActive: boolean
  sortOrder: number | null
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientKey: string
  roleKey: IngredientRoleKey
  necessityKey: NecessityKey
  isMinimumRequired: boolean
  quantityText: string | null
  quantityValue: number | null
  unitKey: UnitKey | null
  sortOrder: number
  note: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredientDetail extends RecipeIngredient {
  ingredient: Ingredient
}

export interface RecipeTool {
  id: string
  recipeId: string
  equipmentKey: KitchenEquipmentKey
  necessityKey: NecessityKey
  sortOrder: number
  note: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RecipeSubstitution {
  id: string
  recipeId: string
  ingredientKey: string
  substituteIngredientKey: string
  qualityImpact: number
  note: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RecipeSubstitutionDetail extends RecipeSubstitution {
  ingredient: Ingredient
  substituteIngredient: Ingredient
}

export interface RecipeStep {
  id: string
  recipeId: string
  stepNumber: number
  title: string | null
  body: string
  estimatedMinutes: number | null
  timerSeconds: number | null
  imageUrl: string | null
  ingredientKeys: string[]
  equipmentKeys: KitchenEquipmentKey[]
  tips: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RecipeCandidate {
  recipe: Recipe
  ingredients: RecipeIngredientDetail[]
  tools: RecipeTool[]
  substitutions: RecipeSubstitutionDetail[]
}

export interface RecipeDetail extends RecipeCandidate {
  steps: RecipeStep[]
}

export interface RecognizedIngredientInput {
  name: string
  quantityText?: string | null
  confidence?: number | null
}

export interface NormalizedRecognizedIngredient {
  rawName: string
  ingredientKey: string | null
  ingredient: Ingredient | null
  matchedAlias: string | null
  quantityText: string | null
  confidence: number | null
}

export const INGREDIENT_ROLE_KEYS: IngredientRoleKey[] = ['main', 'side', 'seasoning', 'garnish']

export const NECESSITY_KEYS: NecessityKey[] = ['required', 'recommended', 'optional']

export const RECIPE_DIFFICULTY_KEYS: RecipeDifficultyKey[] = ['beginner', 'normal', 'confident']

export const RECIPE_CUISINE_KEYS: RecipeCuisineKey[] = [
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
  'fusion',
]

export const RECIPE_MEAL_STYLE_KEYS: RecipeMealStyleKey[] = [
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
  'meal_prep',
]

export const FLAVOR_PROFILE_KEYS: FlavorProfileKey[] = [
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
  'tangy',
]

export const RECIPE_SCENE_KEYS: RecipeSceneKey[] = [
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
  'student_budget',
]

export const UNIT_KEYS: UnitKey[] = ['piece', 'gram', 'ml', 'tbsp', 'tsp', 'cup', 'serving', 'pinch']

export const INGREDIENT_CONTENT_TIERS: IngredientContentTier[] = ['P0', 'P1', 'P2']

export const INGREDIENT_STORAGE_TYPES: IngredientStorageType[] = [
  'fridge',
  'freezer',
  'pantry',
  'canned',
  'room_temp',
]
