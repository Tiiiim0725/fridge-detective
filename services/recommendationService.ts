// services/recommendationService.ts
// Recipe Recommendation v0.2 - MVP ranking over recipe content metadata.

import { getCurrentFridgeItems } from '@/services/fridgeService'
import { getOnboardingContext } from '@/services/profileService'
import { getRecommendationCandidates } from '@/services/recipeService'
import type {
  CookTimePreferenceKey,
  KitchenEquipmentKey,
  PantryItemKey,
} from '@/types/profile'
import {
  DEFAULT_ASSUMED_KITCHEN_EQUIPMENT_KEYS,
  MVP_DEFAULT_KITCHEN_EQUIPMENT_KEYS,
} from '@/types/profile'
import type {
  RecipeCandidate,
  RecipePreferenceMatchMetadata,
} from '@/types/recipe'
import type {
  RecipeRecommendationInput,
  RecipeRecommendationPreferences,
  RecipeRecommendationResult,
  RecipeRecommendationRunResult,
} from '@/types/recommendation'

const DEFAULT_RECOMMENDATION_LIMIT = 8

const SCORE_WEIGHTS = {
  coreCoverage: 70,
  optionalIngredient: 4,
  optionalIngredientCap: 12,
  pantryCoverage: 10,
  cuisinePreference: 10,
  cookingSkillFit: 6,
  rankingBoost: 0.5,
  rankingBoostCap: 4,
}

function unique<T extends string>(values: T[]): T[] {
  return [...new Set(values.filter(Boolean))]
}

function intersect(a: string[], b: string[]): string[] {
  const bSet = new Set(b)
  return unique(a.filter((value) => bSet.has(value)))
}

export function getCookTimeLimitMinutes(
  cookTimePreferenceKey: CookTimePreferenceKey | null | undefined
): number | null {
  switch (cookTimePreferenceKey) {
    case 'under_15':
      return 15
    case 'under_30':
      return 30
    case 'under_45':
      return 45
    case 'over_45_ok':
      return null
    default:
      return 30
  }
}

function normalizeAvailableEquipment(equipmentKeys: KitchenEquipmentKey[]): KitchenEquipmentKey[] {
  const userEquipmentKeys = equipmentKeys.length > 0 ? equipmentKeys : MVP_DEFAULT_KITCHEN_EQUIPMENT_KEYS
  return unique([
    ...DEFAULT_ASSUMED_KITCHEN_EQUIPMENT_KEYS,
    ...userEquipmentKeys,
  ])
}

function getPreferenceMatch(candidate: RecipeCandidate): RecipePreferenceMatchMetadata | null {
  return candidate.recipe.recommendationMetadata?.preference_match ?? null
}

function getCoreIngredientKeys(candidate: RecipeCandidate, metadata: RecipePreferenceMatchMetadata | null): string[] {
  return unique(
    metadata?.fridge_core_match_keys
      ?? candidate.ingredients
        .filter((item) => item.isMinimumRequired)
        .map((item) => item.ingredientKey)
  )
}

function getOptionalIngredientKeys(candidate: RecipeCandidate, metadata: RecipePreferenceMatchMetadata | null): string[] {
  return unique(
    metadata?.fridge_optional_boost_keys
      ?? candidate.ingredients
        .filter((item) => item.necessityKey === 'optional')
        .map((item) => item.ingredientKey)
  )
}

function getPantryMatchKeys(candidate: RecipeCandidate, metadata: RecipePreferenceMatchMetadata | null): string[] {
  return unique(
    metadata?.pantry_match_keys
      ?? candidate.ingredients
        .filter((item) => item.roleKey === 'seasoning' || item.ingredient.isPantryItem)
        .map((item) => item.ingredientKey)
  )
}

function getRequiredEquipmentKeys(candidate: RecipeCandidate, metadata: RecipePreferenceMatchMetadata | null): KitchenEquipmentKey[] {
  return unique(
    metadata?.required_equipment_keys
      ?? candidate.tools
        .filter((tool) => tool.necessityKey === 'required')
        .map((tool) => tool.equipmentKey)
  )
}

function getDietaryRuleKeys(candidate: RecipeCandidate, metadata: RecipePreferenceMatchMetadata | null): string[] {
  return unique(
    metadata?.dietary_rule_keys
      ?? candidate.recipe.recommendationMetadata?.dietary_rules_supported
      ?? []
  )
}

function getCookingSkillFit(candidate: RecipeCandidate, metadata: RecipePreferenceMatchMetadata | null): string[] {
  return unique(
    metadata?.cooking_skill_fit
      ?? candidate.recipe.recommendationMetadata?.cooking_skill_fit
      ?? [candidate.recipe.difficultyKey]
  )
}

function buildResultForCandidate(
  candidate: RecipeCandidate,
  input: Required<Omit<RecipeRecommendationInput, 'preferences'>> & {
    preferences: RecipeRecommendationPreferences | null
  }
): RecipeRecommendationResult | null {
  const metadata = getPreferenceMatch(candidate)
  const warnings: string[] = []

  if (!metadata) {
    warnings.push('Missing recommendation metadata; used normalized recipe relations as fallback.')
  }

  const preferences = input.preferences
  const availableEquipmentKeys = normalizeAvailableEquipment(input.equipmentKeys)
  const fridgeIngredientKeys = unique(input.fridgeIngredientKeys)
  const pantryItemKeys = unique(input.pantryItemKeys)
  const availableFoodKeys = unique([
    ...fridgeIngredientKeys,
    ...pantryItemKeys,
  ])
  const avoidIngredientKeys = preferences?.avoidIngredientKeys ?? []
  const activeDietaryRules = unique((preferences?.dietaryRules ?? []).filter((key) => key !== 'none'))
  const cookTimeLimitMinutes = getCookTimeLimitMinutes(preferences?.cookTimePreferenceKey)

  const dietaryRuleKeys = getDietaryRuleKeys(candidate, metadata)
  if (activeDietaryRules.length > 0 && !activeDietaryRules.every((key) => dietaryRuleKeys.includes(key))) {
    return null
  }

  const hardAvoidKeys = unique(metadata?.avoid_ingredient_hard_filter_keys ?? [])
  if (intersect(avoidIngredientKeys, hardAvoidKeys).length > 0) {
    return null
  }

  const requiredEquipmentKeys = getRequiredEquipmentKeys(candidate, metadata)
  const missingEquipmentKeys = requiredEquipmentKeys.filter((key) => !availableEquipmentKeys.includes(key))
  if (missingEquipmentKeys.length > 0) {
    return null
  }

  if (cookTimeLimitMinutes !== null && candidate.recipe.totalTimeMinutes > cookTimeLimitMinutes) {
    return null
  }

  const coreIngredientKeys = getCoreIngredientKeys(candidate, metadata)
  const optionalIngredientKeys = getOptionalIngredientKeys(candidate, metadata)
  const pantryMatchKeys = getPantryMatchKeys(candidate, metadata)
  const matchedCoreIngredients = intersect(coreIngredientKeys, availableFoodKeys)
  const missingCoreIngredients = coreIngredientKeys.filter((key) => !matchedCoreIngredients.includes(key))
  const matchedOptionalIngredients = intersect(optionalIngredientKeys, fridgeIngredientKeys)
  const matchedPantryItems = intersect(pantryMatchKeys, pantryItemKeys)
  const missingPantryItems = pantryMatchKeys.filter((key) => !matchedPantryItems.includes(key))
  const softConflicts = intersect(avoidIngredientKeys, unique(metadata?.avoid_ingredient_soft_conflict_keys ?? []))
  const cuisineMatches = intersect(
    preferences?.cuisinePreferences ?? [],
    unique(metadata?.cuisine_preference_keys ?? [candidate.recipe.cuisineKey])
  )
  const cookingSkillFit = getCookingSkillFit(candidate, metadata)
  const rankingBoostKeys = unique(metadata?.ranking_boost_keys ?? [])

  const coreCoverageScore = coreIngredientKeys.length > 0
    ? (matchedCoreIngredients.length / coreIngredientKeys.length) * SCORE_WEIGHTS.coreCoverage
    : 0
  const optionalScore = Math.min(
    matchedOptionalIngredients.length * SCORE_WEIGHTS.optionalIngredient,
    SCORE_WEIGHTS.optionalIngredientCap
  )
  const pantryScore = pantryMatchKeys.length > 0
    ? (matchedPantryItems.length / pantryMatchKeys.length) * SCORE_WEIGHTS.pantryCoverage
    : 0
  const cuisineScore = cuisineMatches.length > 0 ? SCORE_WEIGHTS.cuisinePreference : 0
  const skillScore = preferences && cookingSkillFit.includes(preferences.cookingSkill)
    ? SCORE_WEIGHTS.cookingSkillFit
    : 0
  const rankingBoostScore = Math.min(
    rankingBoostKeys.length * SCORE_WEIGHTS.rankingBoost,
    SCORE_WEIGHTS.rankingBoostCap
  )
  const softConflictPenalty = softConflicts.length * 5
  const score = Number((
    coreCoverageScore
    + optionalScore
    + pantryScore
    + cuisineScore
    + skillScore
    + rankingBoostScore
    - softConflictPenalty
  ).toFixed(1))

  const reasons: string[] = []
  if (matchedCoreIngredients.length > 0) {
    reasons.push(`已有核心食材 ${matchedCoreIngredients.join(', ')}`)
  }
  if (cuisineMatches.length > 0) {
    reasons.push(`命中菜系偏好 ${cuisineMatches.join(', ')}`)
  }
  if (matchedPantryItems.length > 0) {
    reasons.push(`已有调料 ${matchedPantryItems.join(', ')}`)
  }
  if (matchedOptionalIngredients.length > 0) {
    reasons.push(`可选食材加分 ${matchedOptionalIngredients.join(', ')}`)
  }
  if (missingCoreIngredients.length > 0) {
    warnings.push(`Missing core ingredients: ${missingCoreIngredients.join(', ')}`)
  }
  if (missingPantryItems.length > 0) {
    warnings.push(`Missing pantry items: ${missingPantryItems.join(', ')}`)
  }
  if (softConflicts.length > 0) {
    warnings.push(`Soft avoid conflicts: ${softConflicts.join(', ')}`)
  }

  return {
    recipe: candidate.recipe,
    score,
    matchedCoreIngredients,
    missingCoreIngredients,
    matchedOptionalIngredients,
    matchedPantryItems,
    missingPantryItems,
    softConflicts,
    reasons,
    warnings,
  }
}

export function rankRecipeRecommendations(input: RecipeRecommendationInput): RecipeRecommendationRunResult {
  const normalizedInput = {
    candidates: input.candidates,
    preferences: input.preferences,
    equipmentKeys: input.equipmentKeys,
    pantryItemKeys: input.pantryItemKeys,
    fridgeIngredientKeys: input.fridgeIngredientKeys,
    limit: input.limit ?? DEFAULT_RECOMMENDATION_LIMIT,
  }
  const recommendations = normalizedInput.candidates
    .map((candidate) => buildResultForCandidate(candidate, normalizedInput))
    .filter((result): result is RecipeRecommendationResult => result !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.matchedCoreIngredients.length !== a.matchedCoreIngredients.length) {
        return b.matchedCoreIngredients.length - a.matchedCoreIngredients.length
      }
      if (a.recipe.totalTimeMinutes !== b.recipe.totalTimeMinutes) {
        return a.recipe.totalTimeMinutes - b.recipe.totalTimeMinutes
      }
      return (a.recipe.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.recipe.sortOrder ?? Number.MAX_SAFE_INTEGER)
    })

  const limitedRecommendations = recommendations.slice(0, normalizedInput.limit)
  const runWarnings = limitedRecommendations.flatMap((item) =>
    item.warnings.filter((warning) => warning.startsWith('Missing recommendation metadata'))
  )

  return {
    recommendations: limitedRecommendations,
    totalCandidates: normalizedInput.candidates.length,
    eligibleCandidates: recommendations.length,
    filteredCandidates: normalizedInput.candidates.length - recommendations.length,
    warnings: unique(runWarnings),
  }
}

export async function getPersonalizedRecipeRecommendations(limit = DEFAULT_RECOMMENDATION_LIMIT): Promise<RecipeRecommendationRunResult> {
  const [onboardingContext, fridgeItems, candidates] = await Promise.all([
    getOnboardingContext(),
    getCurrentFridgeItems(),
    getRecommendationCandidates(),
  ])

  return rankRecipeRecommendations({
    candidates,
    preferences: onboardingContext.preferences
      ? {
        dietaryRules: onboardingContext.preferences.dietaryRules,
        avoidIngredientKeys: onboardingContext.preferences.avoidIngredientKeys,
        cuisinePreferences: onboardingContext.preferences.cuisinePreferences,
        cookTimePreferenceKey: onboardingContext.preferences.cookTimePreferenceKey,
        cookingSkill: onboardingContext.preferences.cookingSkill,
      }
      : null,
    equipmentKeys: onboardingContext.equipmentKeys,
    pantryItemKeys: onboardingContext.pantryItemKeys,
    fridgeIngredientKeys: fridgeItems
      .map((item) => item.ingredientKey)
      .filter((ingredientKey): ingredientKey is string => typeof ingredientKey === 'string' && ingredientKey.length > 0),
    limit,
  })
}
