// services/manualFridgeService.ts
// Manual add orchestration for fridge inventory and pantry candidates.

import { addManualScanItem, saveConfirmedFridgeItems } from '@/services/fridgeService'
import { normalizeIngredientName } from '@/services/ingredientService'
import { addPantryItems } from '@/services/profileService'
import { isValidFridgeQuantity } from '@/types/fridge'
import type {
  FridgeItem,
  FridgeQuantityKind,
  FridgeScanItem,
} from '@/types/fridge'
import type { PantryItem, PantryItemKey } from '@/types/profile'

export interface AddManualFridgeItemInput {
  scanId?: string | null
  rawName: string
  displayName?: string | null
  quantityKind?: FridgeQuantityKind
  quantityText?: string | null
  quantityCount?: number | null
}

export interface ManualFridgeLocalCandidate {
  id: string
  ingredientKey: string
  rawName: string
  displayName: string
  quantityKind: FridgeQuantityKind
  quantityText: string | null
  quantityCount: number | null
  source: 'manual'
  needsReview: boolean
  createdAt: string
}

export interface ManualPantryLocalCandidate {
  id: string
  ingredientKey: PantryItemKey
  rawName: string
  displayName: string
  source: 'manual'
  createdAt: string
}

export type AddManualFridgeItemResult =
  | {
      kind: 'scan_item'
      item: FridgeScanItem
    }
  | {
      kind: 'local_candidate'
      item: ManualFridgeLocalCandidate
    }
  | {
      kind: 'pantry_candidate'
      item: ManualPantryLocalCandidate
    }
  | {
      kind: 'unmatched'
      rawName: string
      message: string
    }

interface NormalizedManualQuantity {
  quantityKind: FridgeQuantityKind
  quantityText: string | null
  quantityCount: number | null
  wasDowngraded: boolean
}

function normalizeOptionalId(value?: string | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function makeLocalCandidateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeManualQuantity(
  quantityKind?: FridgeQuantityKind,
  quantityText?: string | null,
  quantityCount?: number | null
): NormalizedManualQuantity {
  const normalizedKind = quantityKind ?? 'unknown'
  const normalizedText = typeof quantityText === 'string' && quantityText.trim().length > 0
    ? quantityText.trim()
    : null
  const normalizedCount = quantityCount ?? null

  if (!isValidFridgeQuantity(normalizedKind, normalizedText, normalizedCount)) {
    return {
      quantityKind: 'unknown',
      quantityText: null,
      quantityCount: null,
      wasDowngraded: true,
    }
  }

  if (normalizedKind === 'text') {
    return {
      quantityKind: 'text',
      quantityText: normalizedText,
      quantityCount: null,
      wasDowngraded: false,
    }
  }

  if (normalizedKind === 'count') {
    return {
      quantityKind: 'count',
      quantityText: null,
      quantityCount: normalizedCount,
      wasDowngraded: false,
    }
  }

  return {
    quantityKind: 'unknown',
    quantityText: null,
    quantityCount: null,
    wasDowngraded: false,
  }
}

export async function addManualFridgeItem(
  input: AddManualFridgeItemInput
): Promise<AddManualFridgeItemResult> {
  const rawName = input.rawName.trim()

  if (!rawName) {
    return {
      kind: 'unmatched',
      rawName,
      message: '请输入一个食材名称。',
    }
  }

  const ingredient = await normalizeIngredientName(rawName)

  if (!ingredient) {
    return {
      kind: 'unmatched',
      rawName,
      message: `没有在食材字典里找到“${rawName}”，可以换个常见说法再试。`,
    }
  }

  if (ingredient.isPantryItem) {
    return {
      kind: 'pantry_candidate',
      item: {
        id: makeLocalCandidateId('manual-pantry'),
        ingredientKey: ingredient.ingredientKey as PantryItemKey,
        rawName,
        displayName: input.displayName ?? ingredient.zhName ?? ingredient.enName,
        source: 'manual',
        createdAt: new Date().toISOString(),
      },
    }
  }

  const scanId = normalizeOptionalId(input.scanId)

  if (scanId) {
    const scanItem = await addManualScanItem({
      scanId,
      rawName,
      displayName: input.displayName,
      quantityKind: input.quantityKind,
      quantityText: input.quantityText,
      quantityCount: input.quantityCount,
    })

    return {
      kind: 'scan_item',
      item: scanItem,
    }
  }

  const quantity = normalizeManualQuantity(input.quantityKind, input.quantityText, input.quantityCount)
  const now = new Date().toISOString()

  return {
    kind: 'local_candidate',
    item: {
      id: makeLocalCandidateId('manual-local'),
      ingredientKey: ingredient.ingredientKey,
      rawName,
      displayName: input.displayName ?? ingredient.zhName ?? ingredient.enName,
      quantityKind: quantity.quantityKind,
      quantityText: quantity.quantityText,
      quantityCount: quantity.quantityCount,
      source: 'manual',
      needsReview: quantity.wasDowngraded,
      createdAt: now,
    },
  }
}

export async function confirmManualFridgeItems(
  items: ManualFridgeLocalCandidate[]
): Promise<FridgeItem[]> {
  if (items.length === 0) {
    return []
  }

  return saveConfirmedFridgeItems(items.map((item) => ({
    ingredientKey: item.ingredientKey,
    rawName: item.rawName,
    displayName: item.displayName,
    quantityKind: item.quantityKind,
    quantityText: item.quantityText,
    quantityCount: item.quantityCount,
    source: 'manual',
  })))
}

export async function confirmManualPantryItems(
  items: ManualPantryLocalCandidate[]
): Promise<PantryItem[]> {
  if (items.length === 0) {
    return []
  }

  return addPantryItems({
    pantryItemKeys: items.map((item) => item.ingredientKey),
  })
}
