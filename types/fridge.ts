// types/fridge.ts
// Fridge Foundation v0.1 - Domain Types
// Responsibilities: fridge scan, photo, draft item, confirmed item, and guide step types.

export type FridgeScanMode = 'guided_multi_photo' | 'manual' | 'mock'

export type FridgeScanStatus =
  | 'draft'
  | 'photos_uploaded'
  | 'recognizing'
  | 'partially_recognized'
  | 'recognized'
  | 'confirmed'
  | 'failed'
  | 'cancelled'

export type FridgePhotoZoneKey =
  | 'fridge_top'
  | 'fridge_middle'
  | 'fridge_bottom'
  | 'fridge_door'
  | 'fridge_drawer'
  | 'fridge_extra'

export type FridgePhotoRecognitionStatus =
  | 'pending'
  | 'recognizing'
  | 'recognized'
  | 'failed'
  | 'skipped'

export type FridgeQuantityKind = 'unknown' | 'text' | 'count'

export type FridgeScanItemSource = 'ai' | 'manual' | 'mock'

export type FridgeScanItemStatus =
  | 'detected'
  | 'confirmed'
  | 'edited'
  | 'rejected'

export type FridgeItemSource = 'scan_confirmed' | 'manual' | 'mock'

export type FridgeItemStatus = 'active' | 'removed'

export interface FridgeScan {
  id: string
  userId: string
  scanMode: FridgeScanMode
  status: FridgeScanStatus
  errorMessage: string | null
  completedAt: string | null
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FridgeScanPhoto {
  id: string
  scanId: string
  userId: string
  storageBucket: string
  storagePath: string
  photoOrder: number
  zoneKey: FridgePhotoZoneKey
  guidePrompt: string
  contentType: string | null
  fileSize: number | null
  width: number | null
  height: number | null
  recognitionStatus: FridgePhotoRecognitionStatus
  aiProvider: string | null
  aiModel: string | null
  aiRawResponse: unknown | null
  aiErrorMessage: string | null
  recognizedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FridgeScanItem {
  id: string
  scanId: string
  photoId: string | null
  userId: string
  ingredientKey: string | null
  rawName: string
  displayName: string
  quantityKind: FridgeQuantityKind
  quantityText: string | null
  quantityCount: number | null
  confidence: number | null
  source: FridgeScanItemSource
  status: FridgeScanItemStatus
  needsReview: boolean
  uncertaintyReason: string | null
  createdAt: string
  updatedAt: string
}

export interface FridgeItem {
  id: string
  userId: string
  ingredientKey: string | null
  rawName: string
  displayName: string
  quantityKind: FridgeQuantityKind
  quantityText: string | null
  quantityCount: number | null
  source: FridgeItemSource
  status: FridgeItemStatus
  lastSeenAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateFridgeScanInput {
  scanMode?: FridgeScanMode
}

export interface AddFridgeScanPhotoInput {
  scanId: string
  storageBucket?: string
  storagePath: string
  photoOrder: number
  zoneKey: FridgePhotoZoneKey
  guidePrompt: string
  contentType?: string | null
  fileSize?: number | null
  width?: number | null
  height?: number | null
}

export interface RecognizedFridgeItemInput {
  rawName: string
  displayName?: string | null
  quantityKind?: FridgeQuantityKind
  quantityText?: string | null
  quantityCount?: number | null
  confidence?: number | null
  needsReview?: boolean
  uncertaintyReason?: string | null
}

export interface SaveRecognizedScanItemsInput {
  scanId: string
  photoId: string
  items: RecognizedFridgeItemInput[]
}

export interface ManualFridgeScanItemInput {
  scanId: string
  photoId?: string | null
  rawName: string
  displayName?: string | null
  quantityKind?: FridgeQuantityKind
  quantityText?: string | null
  quantityCount?: number | null
}

export interface ConfirmFridgeScanItemsInput {
  scanId: string
  itemIds: string[]
}

export interface SaveConfirmedFridgeItemInput {
  ingredientKey?: string | null
  rawName: string
  displayName: string
  quantityKind?: FridgeQuantityKind
  quantityText?: string | null
  quantityCount?: number | null
  source?: FridgeItemSource
}

export type FridgePhotoGuideStep = {
  zoneKey: FridgePhotoZoneKey
  title: string
  guidePrompt: string
  photoOrder: number
  isOptional: boolean
}

export const FRIDGE_PHOTO_GUIDE_STEPS: FridgePhotoGuideStep[] = [
  {
    zoneKey: 'fridge_top',
    title: '冷藏室顶部',
    guidePrompt: '请从冰箱冷藏室顶部开始，对准食材拍摄',
    photoOrder: 1,
    isOptional: false,
  },
  {
    zoneKey: 'fridge_middle',
    title: '冷藏室中部',
    guidePrompt: '请拍摄冷藏室中部的食材',
    photoOrder: 2,
    isOptional: false,
  },
  {
    zoneKey: 'fridge_bottom',
    title: '冷藏室底部',
    guidePrompt: '请拍摄冷藏室底部的食材',
    photoOrder: 3,
    isOptional: false,
  },
  {
    zoneKey: 'fridge_door',
    title: '冰箱门架',
    guidePrompt: '请拍摄冰箱门架上的食材和调料',
    photoOrder: 4,
    isOptional: true,
  },
  {
    zoneKey: 'fridge_drawer',
    title: '抽屉 / 蔬菜区',
    guidePrompt: '请拍摄抽屉或蔬菜区',
    photoOrder: 5,
    isOptional: true,
  },
  {
    zoneKey: 'fridge_extra',
    title: '额外补拍',
    guidePrompt: '如果还有遗漏，请补拍其他区域',
    photoOrder: 6,
    isOptional: true,
  },
]

export const FRIDGE_SCAN_MODES = ['guided_multi_photo', 'manual', 'mock'] as const

export const FRIDGE_SCAN_STATUSES = [
  'draft',
  'photos_uploaded',
  'recognizing',
  'partially_recognized',
  'recognized',
  'confirmed',
  'failed',
  'cancelled',
] as const

export const FRIDGE_PHOTO_ZONE_KEYS = [
  'fridge_top',
  'fridge_middle',
  'fridge_bottom',
  'fridge_door',
  'fridge_drawer',
  'fridge_extra',
] as const

export const FRIDGE_PHOTO_RECOGNITION_STATUSES = [
  'pending',
  'recognizing',
  'recognized',
  'failed',
  'skipped',
] as const

export const FRIDGE_QUANTITY_KINDS = ['unknown', 'text', 'count'] as const

export const FRIDGE_SCAN_ITEM_SOURCES = ['ai', 'manual', 'mock'] as const

export const FRIDGE_SCAN_ITEM_STATUSES = [
  'detected',
  'confirmed',
  'edited',
  'rejected',
] as const

export const FRIDGE_ITEM_SOURCES = ['scan_confirmed', 'manual', 'mock'] as const

export const FRIDGE_ITEM_STATUSES = ['active', 'removed'] as const

export function isValidFridgeQuantity(
  quantityKind: FridgeQuantityKind,
  quantityText?: string | null,
  quantityCount?: number | null
): boolean {
  const hasQuantityText = typeof quantityText === 'string' && quantityText.trim().length > 0
  const hasQuantityCount = typeof quantityCount === 'number'

  if (quantityKind === 'unknown') {
    return !hasQuantityText && quantityCount == null
  }

  if (quantityKind === 'text') {
    return hasQuantityText && quantityCount == null
  }

  return (
    !hasQuantityText
    && hasQuantityCount
    && Number.isFinite(quantityCount)
    && quantityCount >= 0
  )
}
