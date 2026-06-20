import type { KitchenEquipmentKey } from '@/types/profile'

export type CookingSessionStatus = 'active' | 'paused' | 'completed'

export type CookingActionAssetType =
  | 'placeholder'
  | 'image'
  | 'gif'
  | 'lottie'
  | 'svg'
  | 'video'

export type TutorialRecipeSummary = {
  id: string
  recipeKey: string
  zhName: string
  enName: string | null
  totalTimeMinutes: number
  coverImageUrl: string | null
}

export type RecipeTutorialStep = {
  id: string
  recipeId: string
  stepNumber: number
  title: string
  body: string
  actionKey: string
  ingredientKeys: string[]
  equipmentKeys: KitchenEquipmentKey[]
  estimatedMinutes: number | null
  timerSeconds: number | null
  assistantContext: string | null
  createdAt: Date
  updatedAt: Date
}

export type CookingActionAsset = {
  id: string
  actionKey: string
  zhName: string
  enName: string
  assetType: CookingActionAssetType
  assetUrl: string | null
  fallbackIcon: string | null
  shortHint: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type CookingSession = {
  id: string
  userId: string
  recipeId: string
  recipeKey: string
  currentStepNumber: number
  status: CookingSessionStatus
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TutorialBundle = {
  recipe: TutorialRecipeSummary
  steps: RecipeTutorialStep[]
  actionAssets: CookingActionAsset[]
}

export type TutorialOverview = {
  recipeId: string
  recipeKey: string
  stepCount: number
}
