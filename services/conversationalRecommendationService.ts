// services/conversationalRecommendationService.ts
// Conversational recipe recommendation v0.1 - deterministic recommendations with AI rerank fallback.

import { supabase } from '@/lib/supabase'
import { getCurrentFridgeItems } from '@/services/fridgeService'
import { getIngredientDictionary } from '@/services/ingredientService'
import { getOnboardingContext } from '@/services/profileService'
import { getRecommendationCandidates } from '@/services/recipeService'
import { rankRecipeRecommendations } from '@/services/recommendationService'
import {
  CUISINE_PREFERENCE_KEYS,
} from '@/types/profile'
import type {
  CuisinePreferenceKey,
} from '@/types/profile'
import {
  FLAVOR_PROFILE_KEYS,
} from '@/types/recipe'
import type {
  FlavorProfileKey,
  Ingredient,
  RecipeCandidate,
} from '@/types/recipe'
import type {
  RecipeRecommendationResult,
  RecipeRecommendationRunResult,
} from '@/types/recommendation'
import type {
  ConversationalRecommendationCandidatePayload,
  ConversationalRecommendationErrorCode,
  ConversationalRecipeRecommendation,
  ConversationalRecipeRecommendationInput,
  ConversationalRecipeRecommendationResult,
  ParsedRecipeIntent,
  RerankRecipeRecommendationsRequest,
  RerankRecipeRecommendationsResponse,
} from '@/types/conversationalRecommendation'

const CANDIDATE_POOL_LIMIT = 20
const DEFAULT_FINAL_LIMIT = 8
const MIN_FINAL_LIMIT = 3
const MAX_FINAL_LIMIT = 8
const MAX_MESSAGE_LENGTH = 1000
const FALLBACK_WARNING = '暂时先按你的冰箱和偏好推荐，稍后可以再试试描述想吃什么。'
const FILTERED_FALLBACK_WARNING = '已按你的临时要求过滤，暂时使用常规排序。'
const DETERMINISTIC_FAILED_WARNING = '推荐暂时加载失败，请稍后重试。'

function unique<T extends string>(values: T[]): T[] {
  return [...new Set(values.filter(Boolean))]
}

function clampLimit(limit: number | null | undefined): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) {
    return DEFAULT_FINAL_LIMIT
  }

  return Math.min(MAX_FINAL_LIMIT, Math.max(MIN_FINAL_LIMIT, Math.floor(limit)))
}

function normalizeMessage(message: string): string {
  return message.trim().slice(0, MAX_MESSAGE_LENGTH)
}

function emptyResult(
  input: {
    userMessage: string
    conversationId: string | null
    errorCode: ConversationalRecommendationErrorCode
    warningMessage: string | null
  }
): ConversationalRecipeRecommendationResult {
  return {
    recommendations: [],
    intentSummary: null,
    parsedIntent: null,
    fallbackUsed: false,
    userMessage: input.userMessage,
    conversationId: input.conversationId,
    warningMessage: input.warningMessage,
    errorCode: input.errorCode,
  }
}

function toConversationalRecommendations(
  recommendations: RecipeRecommendationResult[],
  aiReasonByRecipeKey: Map<string, string> | null
): ConversationalRecipeRecommendation[] {
  return recommendations.map((item) => ({
    ...item,
    aiReason: aiReasonByRecipeKey?.get(item.recipe.recipeKey) ?? null,
  }))
}

function deterministicFailureResult(
  userMessage: string,
  conversationId: string | null
): ConversationalRecipeRecommendationResult {
  return {
    recommendations: [],
    intentSummary: null,
    parsedIntent: null,
    fallbackUsed: false,
    userMessage,
    conversationId,
    warningMessage: DETERMINISTIC_FAILED_WARNING,
    errorCode: 'deterministic_recommendation_failed',
  }
}

function deterministicFallbackResult(input: {
  recommendations: RecipeRecommendationResult[]
  userMessage: string
  conversationId: string | null
  parsedIntent: ParsedRecipeIntent | null
  intentSummary: string | null
  errorCode: ConversationalRecommendationErrorCode
  warningMessage: string
  limit: number
}): ConversationalRecipeRecommendationResult {
  return {
    recommendations: toConversationalRecommendations(
      input.recommendations.slice(0, input.limit),
      null
    ),
    intentSummary: input.intentSummary,
    parsedIntent: input.parsedIntent,
    fallbackUsed: true,
    userMessage: input.userMessage,
    conversationId: input.conversationId,
    warningMessage: input.warningMessage,
    errorCode: input.errorCode,
  }
}

function buildRecipeIngredientKeyMap(candidates: RecipeCandidate[]): Map<string, string[]> {
  return new Map(candidates.map((candidate) => [
    candidate.recipe.recipeKey,
    unique(candidate.ingredients.map((item) => item.ingredientKey)),
  ]))
}

function buildCandidatePayload(
  item: RecipeRecommendationResult,
  ingredientKeys: string[]
): ConversationalRecommendationCandidatePayload {
  return {
    recipeKey: item.recipe.recipeKey,
    zhName: item.recipe.zhName,
    description: item.recipe.description,
    score: item.score,
    matchedCoreIngredients: item.matchedCoreIngredients,
    missingCoreIngredients: item.missingCoreIngredients,
    matchedOptionalIngredients: item.matchedOptionalIngredients,
    matchedPantryItems: item.matchedPantryItems,
    missingPantryItems: item.missingPantryItems,
    softConflicts: item.softConflicts,
    reasons: item.reasons,
    warnings: item.warnings,
    totalTimeMinutes: item.recipe.totalTimeMinutes,
    difficultyKey: item.recipe.difficultyKey,
    cuisineKey: item.recipe.cuisineKey,
    ingredientKeys,
  }
}

function buildIngredientKeySet(ingredients: Ingredient[]): Set<string> {
  return new Set(ingredients.map((ingredient) => ingredient.ingredientKey))
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return unique(value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim()))
}

function normalizeMood(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const mood = value.trim()
  return mood.length > 0 ? mood.slice(0, 80) : null
}

function normalizeMaxMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  const minutes = Math.floor(value)
  return minutes > 0 && minutes <= 240 ? minutes : null
}

function normalizeParsedIntent(
  value: unknown,
  allowedIngredientKeys: Set<string>
): ParsedRecipeIntent | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const record = value as Record<string, unknown>
  const cuisineSet = new Set<string>(CUISINE_PREFERENCE_KEYS)
  const flavorSet = new Set<string>(FLAVOR_PROFILE_KEYS)
  const cuisineKeys = normalizeStringArray(record.cuisineKeys)
    .filter((key): key is CuisinePreferenceKey => cuisineSet.has(key))
  const flavorTags = normalizeStringArray(record.flavorTags)
    .filter((key): key is FlavorProfileKey => flavorSet.has(key))
  const desiredIngredientKeys = normalizeStringArray(record.desiredIngredientKeys)
    .filter((key) => allowedIngredientKeys.has(key))
  const avoidedIngredientKeys = normalizeStringArray(record.avoidedIngredientKeys)
    .filter((key) => allowedIngredientKeys.has(key))
  const maxMinutes = normalizeMaxMinutes(record.maxMinutes)
  const mood = normalizeMood(record.mood)
  const parsedIntent: ParsedRecipeIntent = {}

  if (cuisineKeys.length > 0) parsedIntent.cuisineKeys = cuisineKeys
  if (flavorTags.length > 0) parsedIntent.flavorTags = flavorTags
  if (desiredIngredientKeys.length > 0) parsedIntent.desiredIngredientKeys = desiredIngredientKeys
  if (avoidedIngredientKeys.length > 0) parsedIntent.avoidedIngredientKeys = avoidedIngredientKeys
  if (maxMinutes !== null) parsedIntent.maxMinutes = maxMinutes
  if (mood !== null) parsedIntent.mood = mood

  return Object.keys(parsedIntent).length > 0 ? parsedIntent : null
}

function sanitizeIntentSummary(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const summary = value.trim()
  return summary.length > 0 ? summary.slice(0, 120) : null
}

function sanitizeAiReason(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const reason = value.trim()
  return reason.length > 0 ? reason.slice(0, 80) : null
}

function applyTemporaryHardFilters(
  recommendations: RecipeRecommendationResult[],
  parsedIntent: ParsedRecipeIntent | null,
  ingredientKeysByRecipeKey: Map<string, string[]>
): RecipeRecommendationResult[] {
  const avoidedIngredientKeys = new Set(parsedIntent?.avoidedIngredientKeys ?? [])
  const maxMinutes = parsedIntent?.maxMinutes ?? null

  return recommendations.filter((item) => {
    if (typeof maxMinutes === 'number' && item.recipe.totalTimeMinutes > maxMinutes) {
      return false
    }

    if (avoidedIngredientKeys.size === 0) {
      return true
    }

    const recipeIngredientKeys = ingredientKeysByRecipeKey.get(item.recipe.recipeKey) ?? []
    return !recipeIngredientKeys.some((key) => avoidedIngredientKeys.has(key))
  })
}

function normalizeAiOrdering(
  response: RerankRecipeRecommendationsResponse,
  allowedRecipeKeys: Set<string>
): {
  orderedRecipeKeys: string[]
  aiReasonByRecipeKey: Map<string, string>
  invalidRecipeKeyCount: number
} | null {
  if (!Array.isArray(response.rankedRecipes)) {
    return null
  }

  const orderedRecipeKeys: string[] = []
  const aiReasonByRecipeKey = new Map<string, string>()
  let invalidRecipeKeyCount = 0

  for (const item of response.rankedRecipes) {
    if (typeof item !== 'object' || item === null) {
      continue
    }

    const record = item as Record<string, unknown>
    const recipeKey = typeof record.recipeKey === 'string' ? record.recipeKey : null

    if (!recipeKey || !allowedRecipeKeys.has(recipeKey)) {
      invalidRecipeKeyCount += 1
      continue
    }

    if (orderedRecipeKeys.includes(recipeKey)) {
      continue
    }

    orderedRecipeKeys.push(recipeKey)
    const aiReason = sanitizeAiReason(record.aiReason)

    if (aiReason) {
      aiReasonByRecipeKey.set(recipeKey, aiReason)
    }
  }

  return {
    orderedRecipeKeys,
    aiReasonByRecipeKey,
    invalidRecipeKeyCount,
  }
}

function buildFinalAiRecommendations(input: {
  deterministicRecommendations: RecipeRecommendationResult[]
  safeRecommendations: RecipeRecommendationResult[]
  aiResponse: RerankRecipeRecommendationsResponse
  limit: number
}): {
  recommendations: ConversationalRecipeRecommendation[]
  invalidRecipeKeyCount: number
} | null {
  const top20RecipeKeys = new Set(input.deterministicRecommendations.map((item) => item.recipe.recipeKey))
  const safeByRecipeKey = new Map(input.safeRecommendations.map((item) => [item.recipe.recipeKey, item]))
  const ordering = normalizeAiOrdering(input.aiResponse, top20RecipeKeys)

  if (!ordering || ordering.orderedRecipeKeys.length === 0) {
    return null
  }

  const finalKeys: string[] = []
  let aiSafeOrderedCount = 0

  for (const recipeKey of ordering.orderedRecipeKeys) {
    if (safeByRecipeKey.has(recipeKey) && !finalKeys.includes(recipeKey)) {
      finalKeys.push(recipeKey)
      aiSafeOrderedCount += 1
    }
  }

  for (const item of input.safeRecommendations) {
    if (!finalKeys.includes(item.recipe.recipeKey)) {
      finalKeys.push(item.recipe.recipeKey)
    }
  }

  const recommendations = finalKeys
    .slice(0, input.limit)
    .map((recipeKey) => safeByRecipeKey.get(recipeKey))
    .filter((item): item is RecipeRecommendationResult => Boolean(item))

  if (recommendations.length === 0 || aiSafeOrderedCount === 0) {
    return null
  }

  return {
    recommendations: toConversationalRecommendations(recommendations, ordering.aiReasonByRecipeKey),
    invalidRecipeKeyCount: ordering.invalidRecipeKeyCount,
  }
}

function mapInvokeErrorCode(error: unknown): ConversationalRecommendationErrorCode {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

  if (message.includes('timeout')) {
    return 'ai_timeout'
  }

  if (message.includes('parse') || message.includes('json') || message.includes('schema')) {
    return 'ai_unparseable_response'
  }

  return 'ai_request_failed'
}

async function getFunctionErrorCode(error: unknown): Promise<ConversationalRecommendationErrorCode> {
  const maybeError = error as {
    context?: {
      json?: () => Promise<unknown>
    }
  }

  if (maybeError.context && typeof maybeError.context.json === 'function') {
    try {
      const body = await maybeError.context.json()
      const errorCode = (body as { errorCode?: unknown }).errorCode

      if (
        errorCode === 'ai_timeout' ||
        errorCode === 'ai_request_failed' ||
        errorCode === 'ai_unparseable_response' ||
        errorCode === 'unknown_error'
      ) {
        return errorCode
      }
    } catch {
      // Fall through to message-based mapping.
    }
  }

  return mapInvokeErrorCode(error)
}

function isRerankResponse(value: unknown): value is RerankRecipeRecommendationsResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  return Array.isArray(record.rankedRecipes)
}

async function invokeAiRerank(
  request: RerankRecipeRecommendationsRequest
): Promise<RerankRecipeRecommendationsResponse> {
  const { data, error } = await supabase.functions.invoke('rerank-recipe-recommendations', {
    body: request,
  })

  if (error) {
    throw error
  }

  if (!isRerankResponse(data)) {
    throw new Error('AI rerank response JSON schema was invalid.')
  }

  return data
}

async function buildDeterministicRun(): Promise<{
  run: RecipeRecommendationRunResult
  candidates: RecipeCandidate[]
  ingredients: Ingredient[]
}> {
  const [onboardingContext, fridgeItems, candidates, ingredients] = await Promise.all([
    getOnboardingContext(),
    getCurrentFridgeItems(),
    getRecommendationCandidates(),
    getIngredientDictionary(),
  ])

  return {
    run: rankRecipeRecommendations({
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
      limit: CANDIDATE_POOL_LIMIT,
    }),
    candidates,
    ingredients,
  }
}

export async function getConversationalRecipeRecommendations(
  input: ConversationalRecipeRecommendationInput
): Promise<ConversationalRecipeRecommendationResult> {
  const userMessage = normalizeMessage(input.message)
  const conversationId = input.conversationId ?? null
  const finalLimit = clampLimit(input.limit)

  if (!userMessage) {
    return emptyResult({
      userMessage,
      conversationId,
      errorCode: 'empty_message',
      warningMessage: '请先告诉我你现在想吃什么。',
    })
  }

  let deterministicRun: RecipeRecommendationRunResult
  let candidates: RecipeCandidate[]
  let ingredients: Ingredient[]

  try {
    const result = await buildDeterministicRun()
    deterministicRun = result.run
    candidates = result.candidates
    ingredients = result.ingredients
  } catch (error) {
    console.error('Deterministic recommendation failed', error)
    return deterministicFailureResult(userMessage, conversationId)
  }

  const deterministicRecommendations = deterministicRun.recommendations

  if (deterministicRecommendations.length === 0) {
    return emptyResult({
      userMessage,
      conversationId,
      errorCode: 'no_deterministic_candidates',
      warningMessage: '暂时没有符合你长期偏好和厨房条件的推荐。',
    })
  }

  const ingredientKeySet = buildIngredientKeySet(ingredients)
  const ingredientKeysByRecipeKey = buildRecipeIngredientKeyMap(candidates)
  const candidatePayloads = deterministicRecommendations.map((item) => buildCandidatePayload(
    item,
    ingredientKeysByRecipeKey.get(item.recipe.recipeKey) ?? []
  ))
  const aiRequest: RerankRecipeRecommendationsRequest = {
    message: userMessage,
    limit: finalLimit,
    allowedCuisineKeys: [...CUISINE_PREFERENCE_KEYS],
    allowedFlavorTags: [...FLAVOR_PROFILE_KEYS],
    allowedIngredientKeys: [...ingredientKeySet],
    candidates: candidatePayloads,
  }

  let aiResponse: RerankRecipeRecommendationsResponse

  try {
    aiResponse = await invokeAiRerank(aiRequest)
  } catch (error) {
    console.error('AI rerank failed; using deterministic fallback', error)
    return deterministicFallbackResult({
      recommendations: deterministicRecommendations,
      userMessage,
      conversationId,
      parsedIntent: null,
      intentSummary: null,
      errorCode: await getFunctionErrorCode(error),
      warningMessage: FALLBACK_WARNING,
      limit: finalLimit,
    })
  }

  const parsedIntent = normalizeParsedIntent(aiResponse.parsedIntent, ingredientKeySet)
  const intentSummary = sanitizeIntentSummary(aiResponse.intentSummary)
  const safeRecommendations = applyTemporaryHardFilters(
    deterministicRecommendations,
    parsedIntent,
    ingredientKeysByRecipeKey
  )

  if (safeRecommendations.length === 0) {
    return emptyResult({
      userMessage,
      conversationId,
      errorCode: 'no_deterministic_candidates',
      warningMessage: '按你的临时要求筛选后，暂时没有合适推荐。',
    })
  }

  const finalAiResult = buildFinalAiRecommendations({
    deterministicRecommendations,
    safeRecommendations,
    aiResponse,
    limit: finalLimit,
  })

  if (!finalAiResult || finalAiResult.invalidRecipeKeyCount > 0) {
    return deterministicFallbackResult({
      recommendations: safeRecommendations,
      userMessage,
      conversationId,
      parsedIntent,
      intentSummary,
      errorCode: finalAiResult ? 'ai_invalid_recipe_keys' : 'ai_unparseable_response',
      warningMessage: parsedIntent ? FILTERED_FALLBACK_WARNING : FALLBACK_WARNING,
      limit: finalLimit,
    })
  }

  return {
    recommendations: finalAiResult.recommendations,
    intentSummary,
    parsedIntent,
    fallbackUsed: false,
    userMessage,
    conversationId,
    warningMessage: null,
    errorCode: null,
  }
}
