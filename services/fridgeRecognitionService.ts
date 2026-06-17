// services/fridgeRecognitionService.ts
// Fridge Recognition v0.3 - orchestration for the camera-to-confirmation prototype.

import { ensureAuthUser } from '@/services/authService'
import { recognizeFridgePhoto } from '@/services/aiService'
import {
  createFridgePhotoSignedUrl,
  FRIDGE_PHOTO_BUCKET,
  uploadFridgePhoto,
} from '@/services/fridgePhotoService'
import {
  addFridgeScanPhoto,
  createGuidedFridgeScan,
  saveRecognizedScanItems,
} from '@/services/fridgeService'
import type {
  FridgePhotoZoneKey,
  FridgeQuantityKind,
  FridgeScanItem,
  RecognizedFridgeItemInput,
} from '@/types/fridge'
import type { FridgeRecognitionItem } from '@/types/fridgeRecognition'

export type FridgeRecognitionPhotoRunStatus =
  | 'success'
  | 'error'

export type FridgeRecognitionPhotoProgressStatus =
  | 'uploading'
  | 'recognizing'
  | 'done'
  | 'error'

export type RunFridgeRecognitionPhotoInput = {
  clientPhotoId?: string
  localUri: string
  remoteImageUrl?: string | null
  zoneKey: FridgePhotoZoneKey
  guidePrompt: string
  photoOrder?: number
  contentType?: string | null
  fileSize?: number | null
  width?: number | null
  height?: number | null
}

export type RunFridgeRecognitionProgress = {
  clientPhotoId?: string
  localUri: string
  status: FridgeRecognitionPhotoProgressStatus
  scanPhotoId?: string
  storagePath?: string
  errorMessage?: string
}

export type RunFridgeRecognitionInput = {
  zoneKey?: FridgePhotoZoneKey
  guidePrompt?: string
  localPhotoUris?: string[]
  photos?: RunFridgeRecognitionPhotoInput[]
  onPhotoProgress?: (progress: RunFridgeRecognitionProgress) => void
}

export type RunFridgeRecognitionResult = {
  scanId: string
  photoResults: Array<{
    clientPhotoId?: string
    localUri: string
    scanPhotoId?: string
    storagePath?: string
    signedUrl?: string
    status: FridgeRecognitionPhotoRunStatus
    itemCount: number
    errorMessage?: string
  }>
  items: FridgeScanItem[]
}

function normalizePhotos(input: RunFridgeRecognitionInput): RunFridgeRecognitionPhotoInput[] {
  if (input.photos && input.photos.length > 0) {
    return input.photos
  }

  const zoneKey = input.zoneKey ?? 'fridge_extra'
  const guidePrompt = input.guidePrompt ?? '请拍清楚主要食材。'

  return (input.localPhotoUris ?? []).map((localUri, index) => ({
    localUri,
    zoneKey,
    guidePrompt,
    photoOrder: index + 1,
    contentType: 'image/jpeg',
  }))
}

function mapRecognizedItem(item: FridgeRecognitionItem): RecognizedFridgeItemInput {
  return {
    rawName: item.rawName,
    displayName: item.displayName,
    quantityKind: item.quantityKind as FridgeQuantityKind,
    quantityText: item.quantityText,
    quantityCount: item.quantityCount,
    confidence: item.confidence,
    needsReview: item.needsReview,
    uncertaintyReason: item.uncertaintyReason,
  }
}

function makeRemoteFallbackStoragePath(userId: string, scanId: string, index: number): string {
  return `dev-url/${userId}/${scanId}/${Date.now()}-${index + 1}.jpg`
}

export async function runFridgeRecognition(
  input: RunFridgeRecognitionInput
): Promise<RunFridgeRecognitionResult> {
  const photos = normalizePhotos(input).filter((photo) => photo.localUri.trim().length > 0)

  if (photos.length === 0) {
    throw new Error('Please take or add at least one fridge photo before recognition.')
  }

  const authUser = await ensureAuthUser()
  const scan = await createGuidedFridgeScan()
  const allItems: FridgeScanItem[] = []
  const photoResults: RunFridgeRecognitionResult['photoResults'] = []

  for (const [index, photo] of photos.entries()) {
    let storagePath: string | undefined
    let signedUrl: string | undefined
    let scanPhotoId: string | undefined

    try {
      input.onPhotoProgress?.({
        clientPhotoId: photo.clientPhotoId,
        localUri: photo.localUri,
        status: 'uploading',
      })

      if (photo.remoteImageUrl) {
        storagePath = makeRemoteFallbackStoragePath(authUser.userId, scan.id, index)
        signedUrl = photo.remoteImageUrl
      } else {
        const upload = await uploadFridgePhoto({
          userId: authUser.userId,
          scanId: scan.id,
          localUri: photo.localUri,
          contentType: photo.contentType,
        })

        storagePath = upload.storagePath
        signedUrl = await createFridgePhotoSignedUrl(upload.storagePath)
      }

      const scanPhoto = await addFridgeScanPhoto({
        scanId: scan.id,
        storageBucket: FRIDGE_PHOTO_BUCKET,
        storagePath,
        photoOrder: photo.photoOrder ?? index + 1,
        zoneKey: photo.zoneKey,
        guidePrompt: photo.guidePrompt,
        contentType: photo.contentType ?? 'image/jpeg',
        fileSize: photo.fileSize ?? null,
        width: photo.width ?? null,
        height: photo.height ?? null,
      })

      scanPhotoId = scanPhoto.id

      input.onPhotoProgress?.({
        clientPhotoId: photo.clientPhotoId,
        localUri: photo.localUri,
        status: 'recognizing',
        scanPhotoId,
        storagePath,
      })

      const recognition = await recognizeFridgePhoto({
        scanId: scan.id,
        photoId: scanPhoto.id,
        zoneKey: photo.zoneKey,
        guidePrompt: photo.guidePrompt,
        imageUrl: signedUrl,
      })

      const savedItems = await saveRecognizedScanItems({
        scanId: scan.id,
        photoId: scanPhoto.id,
        items: recognition.items.map(mapRecognizedItem),
      })

      allItems.push(...savedItems)
      photoResults.push({
        clientPhotoId: photo.clientPhotoId,
        localUri: photo.localUri,
        scanPhotoId,
        storagePath,
        signedUrl,
        status: 'success',
        itemCount: savedItems.length,
      })

      input.onPhotoProgress?.({
        clientPhotoId: photo.clientPhotoId,
        localUri: photo.localUri,
        status: 'done',
        scanPhotoId,
        storagePath,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      photoResults.push({
        clientPhotoId: photo.clientPhotoId,
        localUri: photo.localUri,
        scanPhotoId,
        storagePath,
        signedUrl,
        status: 'error',
        itemCount: 0,
        errorMessage,
      })

      input.onPhotoProgress?.({
        clientPhotoId: photo.clientPhotoId,
        localUri: photo.localUri,
        status: 'error',
        scanPhotoId,
        storagePath,
        errorMessage,
      })
    }
  }

  return {
    scanId: scan.id,
    photoResults,
    items: allItems,
  }
}
