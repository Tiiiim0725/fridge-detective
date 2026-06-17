// types/fridgeRecognition.ts
// Fridge Recognition v0.2 - AI recognition request and result types.

export type FridgeRecognitionPhotoQuality = 'good' | 'usable' | 'poor'

export type FridgeRecognitionSuggestedAction =
  | 'continue'
  | 'retake_same_zone'
  | 'take_extra_photo'

export type FridgeRecognitionQuantityKind = 'unknown' | 'text' | 'count'

export type FridgeRecognitionInput = {
  scanId?: string
  photoId?: string
  zoneKey: string
  guidePrompt?: string | null
  imageUrl?: string
  imageDataUrl?: string
}

export type FridgeRecognitionPhotoAssessment = {
  quality: FridgeRecognitionPhotoQuality
  needsRetake: boolean
  retakeReason: string | null
  suggestedAction: FridgeRecognitionSuggestedAction
}

export type FridgeRecognitionItem = {
  rawName: string
  displayName: string
  quantityKind: FridgeRecognitionQuantityKind
  quantityText: string | null
  quantityCount: number | null
  confidence: number
  needsReview: boolean
  uncertaintyReason: string | null
}

export type FridgeRecognitionResult = {
  photoAssessment: FridgeRecognitionPhotoAssessment
  items: FridgeRecognitionItem[]
  rawResponse?: unknown
}
