export type CookingAiAnswerType = 'text' | 'photo' | 'voice'

export type CookingAiSuggestedAction =
  | 'continue_current_step'
  | 'adjust_then_continue'
  | 'stop_and_check'

export type CookingAiRiskLevel = 'low' | 'medium' | 'high'

export type AskCookingHelperInput = {
  sessionId?: string | null
  recipeId: string
  recipeKey: string
  recipeTitle: string
  stepNumber: number
  stepTitle: string
  stepBody: string
  assistantContext?: string | null
  ingredientKeys: string[]
  equipmentKeys: string[]
  questionText?: string | null
  questionImageUrl?: string | null
  answerType: CookingAiAnswerType
}

export type AskCookingHelperResult = {
  answerText: string
  answerType: CookingAiAnswerType
  suggestedAction: CookingAiSuggestedAction
  riskLevel: CookingAiRiskLevel
  needsUserCheck: boolean
  model: string | null
}
