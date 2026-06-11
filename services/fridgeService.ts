// services/fridgeService.ts
// Fridge Foundation v0.1 - Fridge database service.

import { supabase } from '@/lib/supabase'
import { ensureAuthUser } from '@/services/authService'
import {
  normalizeIngredientName,
  normalizeRecognizedIngredients,
} from '@/services/ingredientService'
import { isValidFridgeQuantity } from '@/types/fridge'
import type {
  AddFridgeScanPhotoInput,
  ConfirmFridgeScanItemsInput,
  CreateFridgeScanInput,
  FridgeItem,
  FridgeItemSource,
  FridgeItemStatus,
  FridgePhotoRecognitionStatus,
  FridgePhotoZoneKey,
  FridgeQuantityKind,
  FridgeScan,
  FridgeScanItem,
  FridgeScanItemSource,
  FridgeScanItemStatus,
  FridgeScanMode,
  FridgeScanPhoto,
  FridgeScanStatus,
  ManualFridgeScanItemInput,
  SaveConfirmedFridgeItemInput,
  SaveRecognizedScanItemsInput,
} from '@/types/fridge'

interface FridgeScanRow {
  id: string
  user_id: string
  scan_mode: string
  status: string
  error_message: string | null
  completed_at: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

interface FridgeScanPhotoRow {
  id: string
  scan_id: string
  user_id: string
  storage_bucket: string
  storage_path: string
  photo_order: number
  zone_key: string
  guide_prompt: string
  content_type: string | null
  file_size: number | null
  width: number | null
  height: number | null
  recognition_status: string
  ai_provider: string | null
  ai_model: string | null
  ai_raw_response: unknown | null
  ai_error_message: string | null
  recognized_at: string | null
  created_at: string
  updated_at: string
}

interface FridgeScanItemRow {
  id: string
  scan_id: string
  photo_id: string | null
  user_id: string
  ingredient_key: string | null
  raw_name: string
  display_name: string
  quantity_kind: string
  quantity_text: string | null
  quantity_count: number | null
  confidence: number | null
  source: string
  status: string
  needs_review: boolean
  uncertainty_reason: string | null
  created_at: string
  updated_at: string
}

interface FridgeItemRow {
  id: string
  user_id: string
  ingredient_key: string | null
  raw_name: string
  display_name: string
  quantity_kind: string
  quantity_text: string | null
  quantity_count: number | null
  source: string
  status: string
  last_seen_at: string
  created_at: string
  updated_at: string
}

interface NormalizedQuantity {
  quantityKind: FridgeQuantityKind
  quantityText: string | null
  quantityCount: number | null
  wasDowngraded: boolean
}

interface SaveActiveFridgeItemInput {
  userId: string
  ingredientKey: string | null
  rawName: string
  displayName: string
  quantityKind: FridgeQuantityKind
  quantityText: string | null
  quantityCount: number | null
  source: FridgeItemSource
  lastSeenAt?: string
}

function toServiceError(error: unknown, fallbackMessage: string): Error {
  const parts: string[] = []
  let message: string | null = null
  let code: string | null = null
  let details: string | null = null
  let hint: string | null = null

  if (error instanceof Error) {
    message = error.message || null
    const record = error as unknown as Record<string, unknown>
    if (typeof record.code === 'string') code = record.code
    if (typeof record.details === 'string') details = record.details
    if (typeof record.hint === 'string') hint = record.hint
  } else if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    if (typeof record.message === 'string') message = record.message
    if (typeof record.code === 'string') code = record.code
    if (typeof record.details === 'string') details = record.details
    if (typeof record.hint === 'string') hint = record.hint
  } else if (typeof error === 'string') {
    message = error
  }

  parts.push(message || fallbackMessage)

  if (code) {
    parts.push(`[code: ${code}]`)
  }
  if (details) {
    parts.push(`[details: ${details}]`)
  }
  if (hint) {
    parts.push(`[hint: ${hint}]`)
  }

  return new Error(parts.join(' '))
}

function mapFridgeScanRow(row: FridgeScanRow): FridgeScan {
  return {
    id: row.id,
    userId: row.user_id,
    scanMode: row.scan_mode as FridgeScanMode,
    status: row.status as FridgeScanStatus,
    errorMessage: row.error_message,
    completedAt: row.completed_at,
    confirmedAt: row.confirmed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapFridgeScanPhotoRow(row: FridgeScanPhotoRow): FridgeScanPhoto {
  return {
    id: row.id,
    scanId: row.scan_id,
    userId: row.user_id,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    photoOrder: row.photo_order,
    zoneKey: row.zone_key as FridgePhotoZoneKey,
    guidePrompt: row.guide_prompt,
    contentType: row.content_type,
    fileSize: row.file_size,
    width: row.width,
    height: row.height,
    recognitionStatus: row.recognition_status as FridgePhotoRecognitionStatus,
    aiProvider: row.ai_provider,
    aiModel: row.ai_model,
    aiRawResponse: row.ai_raw_response,
    aiErrorMessage: row.ai_error_message,
    recognizedAt: row.recognized_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapFridgeScanItemRow(row: FridgeScanItemRow): FridgeScanItem {
  return {
    id: row.id,
    scanId: row.scan_id,
    photoId: row.photo_id,
    userId: row.user_id,
    ingredientKey: row.ingredient_key,
    rawName: row.raw_name,
    displayName: row.display_name,
    quantityKind: row.quantity_kind as FridgeQuantityKind,
    quantityText: row.quantity_text,
    quantityCount: row.quantity_count,
    confidence: row.confidence,
    source: row.source as FridgeScanItemSource,
    status: row.status as FridgeScanItemStatus,
    needsReview: row.needs_review,
    uncertaintyReason: row.uncertainty_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapFridgeItemRow(row: FridgeItemRow): FridgeItem {
  return {
    id: row.id,
    userId: row.user_id,
    ingredientKey: row.ingredient_key,
    rawName: row.raw_name,
    displayName: row.display_name,
    quantityKind: row.quantity_kind as FridgeQuantityKind,
    quantityText: row.quantity_text,
    quantityCount: row.quantity_count,
    source: row.source as FridgeItemSource,
    status: row.status as FridgeItemStatus,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeQuantity(
  quantityKind?: FridgeQuantityKind,
  quantityText?: string | null,
  quantityCount?: number | null
): NormalizedQuantity {
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
      quantityKind: normalizedKind,
      quantityText: normalizedText,
      quantityCount: null,
      wasDowngraded: false,
    }
  }

  if (normalizedKind === 'count') {
    return {
      quantityKind: normalizedKind,
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

function normalizeOptionalId(value?: string | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeOptionalIngredientKey(value?: string | null): string | null {
  return normalizeOptionalId(value)
}

async function ensureScanBelongsToUser(scanId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('fridge_scans')
    .select('id')
    .eq('id', scanId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to query fridge scan')
  }

  if (!data) {
    throw new Error('Fridge scan not found or not accessible.')
  }
}

async function ensurePhotoBelongsToUser(photoId: string, scanId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('fridge_scan_photos')
    .select('id')
    .eq('id', photoId)
    .eq('scan_id', scanId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to query fridge scan photo')
  }

  if (!data) {
    throw new Error('Fridge scan photo not found or not accessible.')
  }
}

async function saveActiveFridgeItem(input: SaveActiveFridgeItemInput): Promise<FridgeItem> {
  const lastSeenAt = input.lastSeenAt ?? new Date().toISOString()
  const ingredientKey = normalizeOptionalIngredientKey(input.ingredientKey)
  const payload = {
    user_id: input.userId,
    ingredient_key: ingredientKey,
    raw_name: input.rawName,
    display_name: input.displayName,
    quantity_kind: input.quantityKind,
    quantity_text: input.quantityText,
    quantity_count: input.quantityCount,
    source: input.source,
    status: 'active',
    last_seen_at: lastSeenAt,
  }

  if (ingredientKey) {
    const { data: existing, error: queryError } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('user_id', input.userId)
      .eq('ingredient_key', ingredientKey)
      .eq('status', 'active')
      .maybeSingle()

    if (queryError) {
      throw toServiceError(queryError, 'Failed to query active fridge item')
    }

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('fridge_items')
        .update(payload)
        .eq('id', (existing as FridgeItemRow).id)
        .eq('user_id', input.userId)
        .select()
        .single()

      if (updateError) {
        throw toServiceError(updateError, 'Failed to update active fridge item')
      }

      return mapFridgeItemRow(updated as FridgeItemRow)
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('fridge_items')
    .insert(payload)
    .select()
    .single()

  if (insertError) {
    throw toServiceError(insertError, 'Failed to insert fridge item')
  }

  return mapFridgeItemRow(inserted as FridgeItemRow)
}

export async function createGuidedFridgeScan(input?: CreateFridgeScanInput): Promise<FridgeScan> {
  const authUser = await ensureAuthUser()

  const { data, error } = await supabase
    .from('fridge_scans')
    .insert({
      user_id: authUser.userId,
      scan_mode: input?.scanMode ?? 'guided_multi_photo',
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw toServiceError(error, 'Failed to create fridge scan')
  }

  return mapFridgeScanRow(data as FridgeScanRow)
}

export async function addFridgeScanPhoto(input: AddFridgeScanPhotoInput): Promise<FridgeScanPhoto> {
  const authUser = await ensureAuthUser()

  await ensureScanBelongsToUser(input.scanId, authUser.userId)

  const { data, error } = await supabase
    .from('fridge_scan_photos')
    .insert({
      scan_id: input.scanId,
      user_id: authUser.userId,
      storage_bucket: input.storageBucket ?? 'fridge-photos',
      storage_path: input.storagePath,
      photo_order: input.photoOrder,
      zone_key: input.zoneKey,
      guide_prompt: input.guidePrompt,
      content_type: input.contentType ?? null,
      file_size: input.fileSize ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      recognition_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw toServiceError(error, 'Failed to add fridge scan photo')
  }

  return mapFridgeScanPhotoRow(data as FridgeScanPhotoRow)
}

export async function saveRecognizedScanItems(input: SaveRecognizedScanItemsInput): Promise<FridgeScanItem[]> {
  const authUser = await ensureAuthUser()

  await ensureScanBelongsToUser(input.scanId, authUser.userId)
  await ensurePhotoBelongsToUser(input.photoId, input.scanId, authUser.userId)

  const normalizedItems = await normalizeRecognizedIngredients(
    input.items.map((item) => ({
      name: item.rawName,
      quantityText: item.quantityText ?? null,
      confidence: item.confidence ?? null,
    }))
  )

  const rows = input.items.map((item, index) => {
    const normalized = normalizedItems[index]
    const quantity = normalizeQuantity(item.quantityKind, item.quantityText, item.quantityCount)
    const confidence = item.confidence ?? normalized?.confidence ?? null
    const needsReview = quantity.wasDowngraded
      ? true
      : item.needsReview ?? (
        normalized?.ingredientKey == null
        || confidence == null
        || confidence < 0.7
      )

    return {
      scan_id: input.scanId,
      photo_id: input.photoId,
      user_id: authUser.userId,
      ingredient_key: normalized?.ingredientKey ?? null,
      raw_name: item.rawName,
      display_name: item.displayName
        ?? normalized?.ingredient?.zhName
        ?? normalized?.ingredient?.enName
        ?? item.rawName,
      quantity_kind: quantity.quantityKind,
      quantity_text: quantity.quantityText,
      quantity_count: quantity.quantityCount,
      confidence,
      source: 'ai',
      status: 'detected',
      needs_review: needsReview,
      uncertainty_reason: item.uncertaintyReason ?? null,
    }
  })

  let scanItems: FridgeScanItem[] = []

  if (rows.length > 0) {
    const { data, error } = await supabase
      .from('fridge_scan_items')
      .insert(rows)
      .select()

    if (error) {
      throw toServiceError(error, 'Failed to save recognized fridge scan items')
    }

    scanItems = (data ?? []).map((row) => mapFridgeScanItemRow(row as FridgeScanItemRow))
  }

  const { data: updatedPhoto, error: photoUpdateError } = await supabase
    .from('fridge_scan_photos')
    .update({
      recognition_status: 'recognized',
      recognized_at: new Date().toISOString(),
    })
    .eq('id', input.photoId)
    .eq('scan_id', input.scanId)
    .eq('user_id', authUser.userId)
    .select('id')
    .maybeSingle()

  if (photoUpdateError) {
    throw toServiceError(photoUpdateError, 'Failed to mark fridge scan photo as recognized')
  }

  if (!updatedPhoto) {
    throw new Error('Fridge scan photo was not updated.')
  }

  return scanItems
}

export async function addManualScanItem(input: ManualFridgeScanItemInput): Promise<FridgeScanItem> {
  const authUser = await ensureAuthUser()
  const photoId = normalizeOptionalId(input.photoId)

  await ensureScanBelongsToUser(input.scanId, authUser.userId)
  if (photoId) {
    await ensurePhotoBelongsToUser(photoId, input.scanId, authUser.userId)
  }

  const normalized = await normalizeIngredientName(input.rawName)
  const quantity = normalizeQuantity(input.quantityKind, input.quantityText, input.quantityCount)

  const { data, error } = await supabase
    .from('fridge_scan_items')
    .insert({
      scan_id: input.scanId,
      photo_id: photoId,
      user_id: authUser.userId,
      ingredient_key: normalized?.ingredientKey ?? null,
      raw_name: input.rawName,
      display_name: input.displayName ?? normalized?.zhName ?? normalized?.enName ?? input.rawName,
      quantity_kind: quantity.quantityKind,
      quantity_text: quantity.quantityText,
      quantity_count: quantity.quantityCount,
      confidence: null,
      source: 'manual',
      status: 'confirmed',
      needs_review: normalized == null || quantity.wasDowngraded,
      uncertainty_reason: normalized == null ? '未匹配到标准食材字典' : null,
    })
    .select()
    .single()

  if (error) {
    throw toServiceError(error, 'Failed to add manual fridge scan item')
  }

  return mapFridgeScanItemRow(data as FridgeScanItemRow)
}

export async function getScanItems(scanId: string): Promise<FridgeScanItem[]> {
  const authUser = await ensureAuthUser()

  const { data, error } = await supabase
    .from('fridge_scan_items')
    .select('*')
    .eq('user_id', authUser.userId)
    .eq('scan_id', scanId)
    .order('created_at', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query fridge scan items')
  }

  return (data ?? []).map((row) => mapFridgeScanItemRow(row as FridgeScanItemRow))
}

export async function confirmFridgeScanItems(input: ConfirmFridgeScanItemsInput): Promise<FridgeItem[]> {
  const authUser = await ensureAuthUser()

  if (input.itemIds.length === 0) {
    return []
  }

  const { data: scanItems, error: queryError } = await supabase
    .from('fridge_scan_items')
    .select('*')
    .eq('user_id', authUser.userId)
    .eq('scan_id', input.scanId)
    .in('id', input.itemIds)
    .in('status', ['detected', 'confirmed', 'edited'])
    .order('created_at', { ascending: true })

  if (queryError) {
    throw toServiceError(queryError, 'Failed to query fridge scan items for confirmation')
  }

  const rows = (scanItems ?? []) as FridgeScanItemRow[]

  if (rows.length === 0) {
    return []
  }

  const { data: updatedScanItems, error: updateError } = await supabase
    .from('fridge_scan_items')
    .update({ status: 'confirmed' })
    .eq('user_id', authUser.userId)
    .eq('scan_id', input.scanId)
    .in('id', rows.map((row) => row.id))
    .select('id')

  if (updateError) {
    throw toServiceError(updateError, 'Failed to confirm fridge scan items')
  }

  if ((updatedScanItems ?? []).length !== rows.length) {
    throw new Error('Some fridge scan items were not confirmed.')
  }

  const savedItems: FridgeItem[] = []
  const lastSeenAt = new Date().toISOString()

  for (const scanItem of rows) {
    savedItems.push(await saveActiveFridgeItem({
      userId: authUser.userId,
      ingredientKey: scanItem.ingredient_key,
      rawName: scanItem.raw_name,
      displayName: scanItem.display_name,
      quantityKind: scanItem.quantity_kind as FridgeQuantityKind,
      quantityText: scanItem.quantity_text,
      quantityCount: scanItem.quantity_count,
      source: 'scan_confirmed',
      lastSeenAt,
    }))
  }

  return savedItems
}

export async function saveConfirmedFridgeItems(items: SaveConfirmedFridgeItemInput[]): Promise<FridgeItem[]> {
  const authUser = await ensureAuthUser()
  const savedItems: FridgeItem[] = []
  const lastSeenAt = new Date().toISOString()

  for (const item of items) {
    const inputIngredientKey = normalizeOptionalIngredientKey(item.ingredientKey)
    const normalized = inputIngredientKey == null
      ? await normalizeIngredientName(item.rawName)
      : null
    const quantity = normalizeQuantity(item.quantityKind, item.quantityText, item.quantityCount)

    savedItems.push(await saveActiveFridgeItem({
      userId: authUser.userId,
      ingredientKey: inputIngredientKey ?? normalized?.ingredientKey ?? null,
      rawName: item.rawName,
      displayName: item.displayName,
      quantityKind: quantity.quantityKind,
      quantityText: quantity.quantityText,
      quantityCount: quantity.quantityCount,
      source: item.source ?? 'manual',
      lastSeenAt,
    }))
  }

  return savedItems
}

export async function getCurrentFridgeItems(): Promise<FridgeItem[]> {
  const authUser = await ensureAuthUser()

  const { data, error } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('user_id', authUser.userId)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  if (error) {
    throw toServiceError(error, 'Failed to query current fridge items')
  }

  return (data ?? []).map((row) => mapFridgeItemRow(row as FridgeItemRow))
}

export async function removeFridgeItem(itemId: string): Promise<void> {
  const authUser = await ensureAuthUser()

  const { data, error } = await supabase
    .from('fridge_items')
    .update({ status: 'removed' })
    .eq('id', itemId)
    .eq('user_id', authUser.userId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to remove fridge item')
  }

  if (!data) {
    throw new Error('Fridge item not found or not accessible.')
  }
}
