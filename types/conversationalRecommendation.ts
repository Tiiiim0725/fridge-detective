// types/conversationalRecommendation.ts
// Conversational recipe recommendation v0.1 - AI intent parsing + safe rerank contract.

import type {
  CuisinePreferenceKey,
} from '@/types/profile'
import type {
  FlavorProfileKey,
} from '@/types/recipe'
import type {
  RecipeRecommendationResult,
} from '@/types/recommendation'

export interface ConversationalRecipeRecommendationInput {
  message: string
  /**
   * v1 only echoes this value back as a temporary frontend correlation id.
   * It does not mean the backend stores conversation history or supports multi-turn context.
   */
  conversationId?: string | null
  limit?: number
}

export interface ParsedRecipeIntent {
  cuisineKeys?: CuisinePreferenceKey[]
  flavorTags?: FlavorProfileKey[]
  desiredIngredientKeys?: string[]
  avoidedIngredientKeys?: string[]
  maxMinutes?: number | null
  mood?: string | null
}

export type ConversationalRecommendationErrorCode =
  | 'empty_message'
  | 'no_deterministic_candidates'
  | 'deterministic_recommendation_failed'
  | 'ai_timeout'
  | 'ai_request_failed'
  | 'ai_unparseable_response'
  | 'ai_invalid_recipe_keys'
  | 'unknown_error'

export type ConversationalRecipeRecommendation = RecipeRecommendationResult & {
  aiReason: string | null
}

export interface ConversationalRecipeRecommendationResult {
  recommendations: ConversationalRecipeRecommendation[]
  intentSummary: string | null
  parsedIntent: ParsedRecipeIntent | null
  fallbackUsed: boolean
  userMessage: string
  /**
   * Echo-only temporary correlation id. The backend does not store conversations in v1.
   */
  conversationId: string | null
  warningMessage: string | null
  errorCode: ConversationalRecommendationErrorCode | null
}

export interface ConversationalRecommendationCandidatePayload {
  recipeKey: string
  zhName: string
  description: string | null
  score: number
  matchedCoreIngredients: string[]
  missingCoreIngredients: string[]
  matchedOptionalIngredients: string[]
  matchedPantryItems: string[]
  missingPantryItems: string[]
  softConflicts: string[]
  reasons: string[]
  warnings: string[]
  totalTimeMinutes: number
  difficultyKey: string
  cuisineKey: string
  ingredientKeys: string[]
}

export interface RerankRecipeRecommendationsRequest {
  message: string
  limit: number
  allowedCuisineKeys: string[]
  allowedFlavorTags: string[]
  allowedIngredientKeys: string[]
  candidates: ConversationalRecommendationCandidatePayload[]
}

export interface RerankRecipeRecommendationsResponse {
  intentSummary: string | null
  parsedIntent: {
    cuisineKeys?: string[]
    flavorTags?: string[]
    desiredIngredientKeys?: string[]
    avoidedIngredientKeys?: string[]
    maxMinutes?: number | null
    mood?: string | null
  } | null
  rankedRecipes: Array<{
    recipeKey: string
    aiReason: string
  }>
  warningMessage?: string | null
}
