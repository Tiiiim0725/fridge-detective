import { supabase } from '@/lib/supabase'
import type { KitchenEquipmentKey } from '@/types/profile'
import type {
  CookingActionAsset,
  CookingActionAssetType,
  RecipeTutorialStep,
  TutorialBundle,
  TutorialOverview,
  TutorialRecipeSummary,
} from '@/types/tutorial'

type RecipeRow = {
  id: string
  recipe_key: string
  zh_name: string
  en_name: string | null
  total_time_minutes: number
  cover_image_url: string | null
}

type TutorialStepRow = {
  id: string
  recipe_id: string
  step_number: number
  title: string
  body: string
  action_key: string
  ingredient_keys: string[]
  equipment_keys: string[]
  estimated_minutes: number | null
  timer_seconds: number | null
  assistant_context: string | null
  created_at: string
  updated_at: string
}

type ActionAssetRow = {
  id: string
  action_key: string
  zh_name: string
  en_name: string
  asset_type: string
  asset_url: string | null
  fallback_icon: string | null
  short_hint: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

function toServiceError(error: unknown, fallbackMessage: string): Error {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : fallbackMessage
    const code = typeof record.code === 'string' ? ` [code: ${record.code}]` : ''
    const details = typeof record.details === 'string' ? ` [details: ${record.details}]` : ''
    const hint = typeof record.hint === 'string' ? ` [hint: ${record.hint}]` : ''
    return new Error(`${message}${code}${details}${hint}`)
  }

  return error instanceof Error ? error : new Error(fallbackMessage)
}

function mapRecipe(row: RecipeRow): TutorialRecipeSummary {
  return {
    id: row.id,
    recipeKey: row.recipe_key,
    zhName: row.zh_name,
    enName: row.en_name,
    totalTimeMinutes: row.total_time_minutes,
    coverImageUrl: row.cover_image_url,
  }
}

function mapStep(row: TutorialStepRow): RecipeTutorialStep {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    stepNumber: row.step_number,
    title: row.title,
    body: row.body,
    actionKey: row.action_key,
    ingredientKeys: row.ingredient_keys ?? [],
    equipmentKeys: (row.equipment_keys ?? []) as KitchenEquipmentKey[],
    estimatedMinutes: row.estimated_minutes,
    timerSeconds: row.timer_seconds,
    assistantContext: row.assistant_context,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapActionAsset(row: ActionAssetRow): CookingActionAsset {
  return {
    id: row.id,
    actionKey: row.action_key,
    zhName: row.zh_name,
    enName: row.en_name,
    assetType: row.asset_type as CookingActionAssetType,
    assetUrl: row.asset_url,
    fallbackIcon: row.fallback_icon,
    shortHint: row.short_hint,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

async function getRecipe(recipeKey: string): Promise<TutorialRecipeSummary | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, recipe_key, zh_name, en_name, total_time_minutes, cover_image_url')
    .eq('recipe_key', recipeKey)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw toServiceError(error, 'Failed to query tutorial recipe')
  return data ? mapRecipe(data as RecipeRow) : null
}

export async function getTutorialOverview(recipeKey: string): Promise<TutorialOverview | null> {
  const recipe = await getRecipe(recipeKey)
  if (!recipe) return null

  const { count, error } = await supabase
    .from('recipe_tutorial_steps')
    .select('id', { count: 'exact', head: true })
    .eq('recipe_id', recipe.id)

  if (error) throw toServiceError(error, 'Failed to query tutorial availability')
  if (!count) return null

  return {
    recipeId: recipe.id,
    recipeKey: recipe.recipeKey,
    stepCount: count,
  }
}

export async function getTutorialBundle(recipeKey: string): Promise<TutorialBundle | null> {
  const recipe = await getRecipe(recipeKey)
  if (!recipe) return null

  const { data: stepData, error: stepError } = await supabase
    .from('recipe_tutorial_steps')
    .select('*')
    .eq('recipe_id', recipe.id)
    .order('step_number', { ascending: true })

  if (stepError) throw toServiceError(stepError, 'Failed to query tutorial steps')

  const steps = (stepData ?? []).map((row) => mapStep(row as TutorialStepRow))
  if (steps.length === 0) return null

  const actionKeys = Array.from(new Set(steps.map((step) => step.actionKey)))
  const { data: assetData, error: assetError } = await supabase
    .from('cooking_action_assets')
    .select('*')
    .in('action_key', actionKeys)
    .order('sort_order', { ascending: true })

  if (assetError) throw toServiceError(assetError, 'Failed to query cooking action assets')

  return {
    recipe,
    steps,
    actionAssets: (assetData ?? []).map((row) => mapActionAsset(row as ActionAssetRow)),
  }
}
