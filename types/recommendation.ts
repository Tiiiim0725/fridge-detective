// types/recommendation.ts
// Recipe Recommendation v0.2 - Domain Types

import type {
  CookTimePreferenceKey,
  CookingSkillKey,
  CuisinePreferenceKey,
  DietaryRuleKey,
  KitchenEquipmentKey,
  PantryItemKey,
} from '@/types/profile'
import type { Recipe, RecipeCandidate } from '@/types/recipe'

export interface RecipeRecommendationPreferences {
  dietaryRules: DietaryRuleKey[]
  avoidIngredientKeys: string[]
  cuisinePreferences: CuisinePreferenceKey[]
  cookTimePreferenceKey: CookTimePreferenceKey
  cookingSkill: CookingSkillKey
}

export interface RecipeRecommendationInput {
  candidates: RecipeCandidate[]
  preferences: RecipeRecommendationPreferences | null
  equipmentKeys: KitchenEquipmentKey[]
  pantryItemKeys: PantryItemKey[]
  fridgeIngredientKeys: string[]
  limit?: number
}

export interface RecipeRecommendationResult {
  recipe: Recipe
  score: number
  matchedCoreIngredients: string[]
  missingCoreIngredients: string[]
  matchedOptionalIngredients: string[]
  matchedPantryItems: string[]
  missingPantryItems: string[]
  softConflicts: string[]
  reasons: string[]
  warnings: string[]
}

export interface RecipeRecommendationRunResult {
  recommendations: RecipeRecommendationResult[]
  totalCandidates: number
  eligibleCandidates: number
  filteredCandidates: number
  warnings: string[]
}
