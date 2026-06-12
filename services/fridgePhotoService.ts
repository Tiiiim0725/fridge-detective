// services/fridgePhotoService.ts
// Fridge Recognition v0.3 - photo upload and Storage URL helpers.

import { supabase } from '@/lib/supabase'

export const FRIDGE_PHOTO_BUCKET = 'fridge-photos'

export type FridgePhotoUploadInput = {
  userId: string
  scanId: string
  localUri: string
  contentType?: string | null
}

export type FridgePhotoUploadResult = {
  storagePath: string
  contentType: string
  fileSize?: number | null
}

function toServiceError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return new Error(error.message || fallbackMessage)
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : null
    const details = typeof record.details === 'string' ? record.details : null

    return new Error([message || fallbackMessage, details].filter(Boolean).join(' '))
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  return new Error(fallbackMessage)
}

function normalizeContentType(contentType?: string | null): string {
  if (typeof contentType === 'string' && contentType.trim().length > 0) {
    return contentType.trim()
  }

  return 'image/jpeg'
}

function extensionForContentType(contentType: string): string {
  if (contentType.includes('png')) {
    return 'png'
  }

  if (contentType.includes('webp')) {
    return 'webp'
  }

  return 'jpg'
}

function makeStoragePath(userId: string, scanId: string, contentType: string): string {
  const extension = extensionForContentType(contentType)
  const suffix = Math.random().toString(36).slice(2, 10)

  return `${userId}/${scanId}/${Date.now()}-${suffix}.${extension}`
}

export async function uploadFridgePhoto(
  input: FridgePhotoUploadInput
): Promise<FridgePhotoUploadResult> {
  const contentType = normalizeContentType(input.contentType)
  const storagePath = makeStoragePath(input.userId, input.scanId, contentType)

  let fileBuffer: ArrayBuffer

  try {
    const response = await fetch(input.localUri)

    if (!response.ok) {
      throw new Error(`Local image fetch failed with status ${response.status}.`)
    }

    fileBuffer = await response.arrayBuffer()
  } catch (error) {
    throw toServiceError(
      error,
      'Could not read the camera photo for upload. Try retaking the photo or use the dev image URL fallback.'
    )
  }

  const { error } = await supabase.storage
    .from(FRIDGE_PHOTO_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    throw toServiceError(
      error,
      'Could not upload the fridge photo. Check the fridge-photos Storage bucket and policies.'
    )
  }

  return {
    storagePath,
    contentType,
    fileSize: fileBuffer.byteLength,
  }
}

export async function createFridgePhotoSignedUrl(
  storagePath: string,
  expiresInSeconds = 60 * 10
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(FRIDGE_PHOTO_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error) {
    throw toServiceError(error, 'Could not create a signed URL for the fridge photo.')
  }

  if (!data?.signedUrl) {
    throw new Error('Storage did not return a signed URL for the fridge photo.')
  }

  return data.signedUrl
}
