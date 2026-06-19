// services/recipeService.ts
// Recipe / Ingredient Foundation v0.2 - Public read-only recipe service.

import { supabase } from '@/lib/supabase'
import { getIngredientDictionary } from '@/services/ingredientService'
import type {
  FlavorProfileKey,
  Ingredient,
  IngredientRoleKey,
  NecessityKey,
  Recipe,
  RecipeCandidate,
  RecipeCostLevelKey,
  RecipeCuisineKey,
  RecipeDetail,
  RecipeDifficultyKey,
  RecipeIngredient,
  RecipeIngredientDetail,
  RecipeMealStyleKey,
  RecipeRecommendationMetadata,
  RecipeSceneKey,
  RecipeStep,
  RecipeSubstitution,
  RecipeSubstitutionDetail,
  RecipeTool,
  UnitKey,
} from '@/types/recipe'
import type { KitchenEquipmentKey } from '@/types/profile'

interface RecipeRow {
  id: string
  recipe_key: string
  zh_name: string
  en_name: string | null
  description: string | null
  cuisine_key: string
  difficulty_key: string
  total_time_minutes: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  serving_count: number
  estimated_cost_level: string | null
  meal_style_keys: string[]
  flavor_profile_keys: string[]
  scene_keys: string[]
  recommendation_metadata: RecipeRecommendationMetadata | null
  cover_image_url: string | null
  card_image_url: string | null
  is_active: boolean
  sort_order: number | null
  created_at: string
  updated_at: string
}

interface RecipeIngredientRow {
  id: string
  recipe_id: string
  ingredient_key: string
  role_key: string
  necessity_key: string
  is_minimum_required: boolean
  quantity_text: string | null
  quantity_value: number | null
  unit_key: string | null
  sort_order: number
  note: string | null
  created_at: string
  updated_at: string
}

interface RecipeToolRow {
  id: string
  recipe_id: string
  equipment_key: string
  necessity_key: string
  sort_order: number
  note: string | null
  created_at: string
  updated_at: string
}

interface RecipeSubstitutionRow {
  id: string
  recipe_id: string
  ingredient_key: string
  substitute_ingredient_key: string
  quality_impact: number
  note: string | null
  created_at: string
  updated_at: string
}

interface RecipeStepRow {
  id: string
  recipe_id: string
  step_number: number
  title: string | null
  body: string
  estimated_minutes: number | null
  timer_seconds: number | null
  image_url: string | null
  ingredient_keys: string[]
  equipment_keys: string[]
  tips: string | null
  created_at: string
  updated_at: string
}

function toServiceError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : fallbackMessage
    const code = typeof record.code === 'string' ? ` [code: ${record.code}]` : ''
    const details = typeof record.details === 'string' ? ` [details: ${record.details}]` : ''
    const hint = typeof record.hint === 'string' ? ` [hint: ${record.hint}]` : ''
    return new Error(`${message}${code}${details}${hint}`)
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  return new Error(fallbackMessage)
}

function mapRecipeRow(row: RecipeRow): Recipe {
  return {
    id: row.id,
    recipeKey: row.recipe_key,
    zhName: row.zh_name,
    enName: row.en_name,
    description: row.description,
    cuisineKey: row.cuisine_key as RecipeCuisineKey,
    difficultyKey: row.difficulty_key as RecipeDifficultyKey,
    totalTimeMinutes: row.total_time_minutes,
    prepTimeMinutes: row.prep_time_minutes,
    cookTimeMinutes: row.cook_time_minutes,
    servingCount: row.serving_count,
    estimatedCostLevel: row.estimated_cost_level as RecipeCostLevelKey | null,
    mealStyleKeys: row.meal_style_keys as RecipeMealStyleKey[],
    flavorProfileKeys: row.flavor_profile_keys as FlavorProfileKey[],
    sceneKeys: row.scene_keys as RecipeSceneKey[],
    recommendationMetadata: row.recommendation_metadata ?? null,
    coverImageUrl: row.cover_image_url,
    cardImageUrl: row.card_image_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapRecipeIngredientRow(row: RecipeIngredientRow): RecipeIngredient {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    ingredientKey: row.ingredient_key,
    roleKey: row.role_key as IngredientRoleKey,
    necessityKey: row.necessity_key as NecessityKey,
    isMinimumRequired: row.is_minimum_required,
    quantityText: row.quantity_text,
    quantityValue: row.quantity_value,
    unitKey: row.unit_key as UnitKey | null,
    sortOrder: row.sort_order,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapRecipeToolRow(row: RecipeToolRow): RecipeTool {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    equipmentKey: row.equipment_key as KitchenEquipmentKey,
    necessityKey: row.necessity_key as NecessityKey,
    sortOrder: row.sort_order,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapRecipeSubstitutionRow(row: RecipeSubstitutionRow): RecipeSubstitution {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    ingredientKey: row.ingredient_key,
    substituteIngredientKey: row.substitute_ingredient_key,
    qualityImpact: row.quality_impact,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapRecipeStepRow(row: RecipeStepRow): RecipeStep {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    stepNumber: row.step_number,
    title: row.title,
    body: row.body,
    estimatedMinutes: row.estimated_minutes,
    timerSeconds: row.timer_seconds,
    imageUrl: row.image_url,
    ingredientKeys: row.ingredient_keys,
    equipmentKeys: row.equipment_keys as KitchenEquipmentKey[],
    tips: row.tips,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function groupByRecipeId<T extends { recipeId: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()

  for (const item of items) {
    const current = grouped.get(item.recipeId) ?? []
    current.push(item)
    grouped.set(item.recipeId, current)
  }

  return grouped
}

function buildIngredientMap(ingredients: Ingredient[]): Map<string, Ingredient> {
  return new Map(ingredients.map((ingredient) => [ingredient.ingredientKey, ingredient]))
}

function attachIngredientDetails(
  ingredients: RecipeIngredient[],
  ingredientMap: Map<string, Ingredient>
): RecipeIngredientDetail[] {
  return ingredients.map((item) => {
    const ingredient = ingredientMap.get(item.ingredientKey)

    if (!ingredient) {
      throw new Error(`Missing ingredient dictionary row for ${item.ingredientKey}`)
    }

    return {
      ...item,
      ingredient,
    }
  })
}

function attachSubstitutionDetails(
  substitutions: RecipeSubstitution[],
  ingredientMap: Map<string, Ingredient>
): RecipeSubstitutionDetail[] {
  return substitutions.map((item) => {
    const ingredient = ingredientMap.get(item.ingredientKey)
    const substituteIngredient = ingredientMap.get(item.substituteIngredientKey)

    if (!ingredient) {
      throw new Error(`Missing ingredient dictionary row for ${item.ingredientKey}`)
    }

    if (!substituteIngredient) {
      throw new Error(`Missing ingredient dictionary row for ${item.substituteIngredientKey}`)
    }

    return {
      ...item,
      ingredient,
      substituteIngredient,
    }
  })
}

async function queryRecipeIngredients(recipeIds: string[]): Promise<RecipeIngredient[]> {
  if (recipeIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .in('recipe_id', recipeIds)
    .order('sort_order', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query recipe ingredients')
  }

  return (data ?? []).map((row) => mapRecipeIngredientRow(row as RecipeIngredientRow))
}

async function queryRecipeTools(recipeIds: string[]): Promise<RecipeTool[]> {
  if (recipeIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('recipe_tools')
    .select('*')
    .in('recipe_id', recipeIds)
    .order('sort_order', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query recipe tools')
  }

  return (data ?? []).map((row) => mapRecipeToolRow(row as RecipeToolRow))
}

async function queryRecipeSubstitutions(recipeIds: string[]): Promise<RecipeSubstitution[]> {
  if (recipeIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('recipe_substitutions')
    .select('*')
    .in('recipe_id', recipeIds)
    .order('created_at', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query recipe substitutions')
  }

  return (data ?? []).map((row) => mapRecipeSubstitutionRow(row as RecipeSubstitutionRow))
}

async function queryRecipeSteps(recipeId: string): Promise<RecipeStep[]> {
  const { data, error } = await supabase
    .from('recipe_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('step_number', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query recipe steps')
  }

  return (data ?? []).map((row) => mapRecipeStepRow(row as RecipeStepRow))
}

function buildRecipeCandidates(
  recipes: Recipe[],
  recipeIngredients: RecipeIngredient[],
  recipeTools: RecipeTool[],
  recipeSubstitutions: RecipeSubstitution[],
  ingredientMap: Map<string, Ingredient>
): RecipeCandidate[] {
  const ingredientsByRecipeId = groupByRecipeId(recipeIngredients)
  const toolsByRecipeId = groupByRecipeId(recipeTools)
  const substitutionsByRecipeId = groupByRecipeId(recipeSubstitutions)

  return recipes.map((recipe) => ({
    recipe,
    ingredients: attachIngredientDetails(ingredientsByRecipeId.get(recipe.id) ?? [], ingredientMap),
    tools: toolsByRecipeId.get(recipe.id) ?? [],
    substitutions: attachSubstitutionDetails(substitutionsByRecipeId.get(recipe.id) ?? [], ingredientMap),
  }))
}

export async function getActiveRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('zh_name', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query active recipes')
  }

  return (data ?? []).map((row) => mapRecipeRow(row as RecipeRow))
}

export async function getRecommendationCandidates(): Promise<RecipeCandidate[]> {
  const recipes = await getActiveRecipes()
  const recipeIds = recipes.map((recipe) => recipe.id)

  if (recipeIds.length === 0) {
    return []
  }

  const [recipeIngredients, recipeTools, recipeSubstitutions, ingredients] = await Promise.all([
    queryRecipeIngredients(recipeIds),
    queryRecipeTools(recipeIds),
    queryRecipeSubstitutions(recipeIds),
    getIngredientDictionary(),
  ])

  return buildRecipeCandidates(
    recipes,
    recipeIngredients,
    recipeTools,
    recipeSubstitutions,
    buildIngredientMap(ingredients)
  )
}

export async function getRecipeDetail(recipeKey: string): Promise<RecipeDetail> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('recipe_key', recipeKey)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to query recipe detail')
  }

  if (!data) {
    throw new Error(`Recipe not found: ${recipeKey}`)
  }

  const recipe = mapRecipeRow(data as RecipeRow)
  const [recipeIngredients, recipeTools, recipeSubstitutions, ingredients, steps] = await Promise.all([
    queryRecipeIngredients([recipe.id]),
    queryRecipeTools([recipe.id]),
    queryRecipeSubstitutions([recipe.id]),
    getIngredientDictionary(),
    queryRecipeSteps(recipe.id),
  ])
  const ingredientMap = buildIngredientMap(ingredients)
  const [candidate] = buildRecipeCandidates(
    [recipe],
    recipeIngredients,
    recipeTools,
    recipeSubstitutions,
    ingredientMap
  )

  return {
    ...candidate,
    steps,
  }
}
