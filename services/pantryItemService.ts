// services/pantryItemService.ts
// Pantry item dictionary helpers backed by the shared ingredients dictionary.

import { getIngredientDictionary } from '@/services/ingredientService'
import type { Ingredient } from '@/types/recipe'

export interface PantryTargetSplitItem {
  ingredientKey: string | null
}

export interface PantryTargetSplit<T extends PantryTargetSplitItem> {
  fridgeItems: T[]
  pantryItems: T[]
  unmatchedItems: T[]
}

function normalizeLookupText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeKeyLikeText(value: string): string {
  return normalizeLookupText(value).replace(/[-\s]+/g, '_')
}

function buildPantryLookup(ingredients: Ingredient[]): Map<string, Ingredient> {
  const lookup = new Map<string, Ingredient>()

  for (const ingredient of ingredients) {
    const keyForms = [
      ingredient.ingredientKey,
      ingredient.zhName,
      ingredient.enName,
      normalizeKeyLikeText(ingredient.enName),
    ]

    for (const keyForm of keyForms) {
      lookup.set(normalizeLookupText(keyForm), ingredient)
      lookup.set(normalizeKeyLikeText(keyForm), ingredient)
    }

    for (const alias of ingredient.aliases) {
      lookup.set(normalizeLookupText(alias), ingredient)
      lookup.set(normalizeKeyLikeText(alias), ingredient)
    }
  }

  return lookup
}

export async function getPantryItemDictionary(): Promise<Ingredient[]> {
  const ingredients = await getIngredientDictionary()
  return ingredients.filter((ingredient) => ingredient.isActive && ingredient.isPantryItem)
}

export async function normalizePantryItemName(rawName: string): Promise<Ingredient | null> {
  const raw = rawName.trim()

  if (!raw) {
    return null
  }

  const pantryItems = await getPantryItemDictionary()
  const lookup = buildPantryLookup(pantryItems)
  const normalized = normalizeLookupText(raw)
  const keyLike = normalizeKeyLikeText(raw)

  return lookup.get(normalized) ?? lookup.get(keyLike) ?? null
}

export async function isPantryIngredientKey(ingredientKey: string | null | undefined): Promise<boolean> {
  if (!ingredientKey) {
    return false
  }

  const pantryItems = await getPantryItemDictionary()
  return pantryItems.some((ingredient) => ingredient.ingredientKey === ingredientKey)
}

export async function splitIngredientsByPantryTarget<T extends PantryTargetSplitItem>(
  items: T[]
): Promise<PantryTargetSplit<T>> {
  const pantryItems = await getPantryItemDictionary()
  const pantryKeys = new Set(pantryItems.map((ingredient) => ingredient.ingredientKey))

  return items.reduce<PantryTargetSplit<T>>((result, item) => {
    if (!item.ingredientKey) {
      result.unmatchedItems.push(item)
    } else if (pantryKeys.has(item.ingredientKey)) {
      result.pantryItems.push(item)
    } else {
      result.fridgeItems.push(item)
    }

    return result
  }, {
    fridgeItems: [],
    pantryItems: [],
    unmatchedItems: [],
  })
}
