// types/recipe.ts
// Recipe / Ingredient Foundation v0.1 - Domain Types
// Responsibilities: recipe knowledge-base types, service return shapes, and key dictionaries.

import type { KitchenEquipmentKey, MealStyleKey } from '@/types/profile'

export type IngredientCategoryKey =
  | 'vegetable'
  | 'fruit'
  | 'protein'
  | 'seafood'
  | 'grain'
  | 'pantry'
  | 'seasoning'
  | 'dairy'
  | 'sweetener'
  | 'sauce'

export type RecipeCuisineKey = 'chinese' | 'western' | 'korean' | 'japanese' | 'fusion'

export type RecipeDifficultyKey = 'easy' | 'medium' | 'hard'

export type RecipeCostLevelKey = 'low' | 'medium' | 'high'

export type FlavorProfileKey =
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
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'leftover'
  | 'weeknight'
  | 'student_budget'

export type IngredientRoleKey = 'main' | 'side' | 'seasoning' | 'garnish'

export type NecessityKey = 'required' | 'recommended' | 'optional'

export type UnitKey = 'piece' | 'gram' | 'ml' | 'tbsp' | 'tsp' | 'cup' | 'serving' | 'pinch'

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
  mealStyleKeys: MealStyleKey[]
  flavorProfileKeys: FlavorProfileKey[]
  sceneKeys: RecipeSceneKey[]
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

export const RECIPE_DIFFICULTY_KEYS: RecipeDifficultyKey[] = ['easy', 'medium', 'hard']

export const RECIPE_CUISINE_KEYS: RecipeCuisineKey[] = ['chinese', 'western', 'korean', 'japanese', 'fusion']

export const FLAVOR_PROFILE_KEYS: FlavorProfileKey[] = [
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
  'lunch',
  'dinner',
  'dessert',
  'leftover',
  'weeknight',
  'student_budget',
]

export const UNIT_KEYS: UnitKey[] = ['piece', 'gram', 'ml', 'tbsp', 'tsp', 'cup', 'serving', 'pinch']
