// services/ingredientService.ts
// Recipe / Ingredient Foundation v0.1 - Ingredient dictionary and normalization service.

import { supabase } from '@/lib/supabase'
import type {
  Ingredient,
  IngredientCategoryKey,
  NormalizedRecognizedIngredient,
  RecognizedIngredientInput,
  UnitKey,
} from '@/types/recipe'

interface IngredientRow {
  ingredient_key: string
  zh_name: string
  en_name: string
  category_key: string
  aliases: string[]
  default_unit_key: string | null
  is_fresh: boolean
  is_pantry_item: boolean
  is_active: boolean
  sort_order: number | null
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

function mapIngredientRow(row: IngredientRow): Ingredient {
  return {
    ingredientKey: row.ingredient_key,
    zhName: row.zh_name,
    enName: row.en_name,
    categoryKey: row.category_key as IngredientCategoryKey,
    aliases: row.aliases ?? [],
    defaultUnitKey: row.default_unit_key as UnitKey | null,
    isFresh: row.is_fresh,
    isPantryItem: row.is_pantry_item,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function normalizeLookupText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeKeyLikeText(value: string): string {
  return normalizeLookupText(value).replace(/[-\s]+/g, '_')
}

function buildIngredientLookup(ingredients: Ingredient[]): Map<string, { ingredient: Ingredient; matchedAlias: string | null }> {
  const lookup = new Map<string, { ingredient: Ingredient; matchedAlias: string | null }>()

  for (const ingredient of ingredients) {
    const keyForms = [
      ingredient.ingredientKey,
      ingredient.zhName,
      ingredient.enName,
      normalizeKeyLikeText(ingredient.enName),
    ]

    for (const keyForm of keyForms) {
      lookup.set(normalizeLookupText(keyForm), { ingredient, matchedAlias: null })
      lookup.set(normalizeKeyLikeText(keyForm), { ingredient, matchedAlias: null })
    }

    for (const alias of ingredient.aliases) {
      lookup.set(normalizeLookupText(alias), { ingredient, matchedAlias: alias })
      lookup.set(normalizeKeyLikeText(alias), { ingredient, matchedAlias: alias })
    }
  }

  return lookup
}

function normalizeRecognizedInput(input: string | RecognizedIngredientInput): RecognizedIngredientInput {
  if (typeof input === 'string') {
    return {
      name: input,
      quantityText: null,
      confidence: null,
    }
  }

  return input
}

export async function getIngredientDictionary(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('zh_name', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query ingredient dictionary')
  }

  return (data ?? []).map((row) => mapIngredientRow(row as IngredientRow))
}

export async function normalizeIngredientName(rawName: string): Promise<Ingredient | null> {
  const raw = rawName.trim()

  if (!raw) {
    return null
  }

  const ingredients = await getIngredientDictionary()
  const lookup = buildIngredientLookup(ingredients)
  const normalized = normalizeLookupText(raw)
  const keyLike = normalizeKeyLikeText(raw)
  const match = lookup.get(normalized) ?? lookup.get(keyLike)

  return match?.ingredient ?? null
}

export async function normalizeRecognizedIngredients(
  rawItems: Array<string | RecognizedIngredientInput>
): Promise<NormalizedRecognizedIngredient[]> {
  const ingredients = await getIngredientDictionary()
  const lookup = buildIngredientLookup(ingredients)

  return rawItems.map((item) => {
    const input = normalizeRecognizedInput(item)
    const rawName = input.name.trim()
    const normalized = normalizeLookupText(rawName)
    const keyLike = normalizeKeyLikeText(rawName)
    const match = lookup.get(normalized) ?? lookup.get(keyLike) ?? null

    return {
      rawName,
      ingredientKey: match?.ingredient.ingredientKey ?? null,
      ingredient: match?.ingredient ?? null,
      matchedAlias: match?.matchedAlias ?? null,
      quantityText: input.quantityText ?? null,
      confidence: input.confidence ?? null,
    }
  })
}
