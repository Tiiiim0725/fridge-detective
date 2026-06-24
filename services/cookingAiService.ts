import { supabase } from '@/lib/supabase'
import { ensureAuthUser } from '@/services/authService'
import type {
  AskCookingHelperInput,
  AskCookingHelperResult,
} from '@/types/cookingAi'

type FunctionErrorContext = {
  context?: unknown
}

function getTrimmedText(value?: string | null): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

async function getFunctionErrorMessage(error: unknown): Promise<string> {
  const fallback = error instanceof Error ? error.message : String(error)
  const context = typeof error === 'object' && error !== null && 'context' in error
    ? (error as FunctionErrorContext).context
    : null

  if (context instanceof Response) {
    try {
      const body = await context.json() as { error?: unknown; body?: unknown; status?: unknown }
      if (typeof body.error === 'string' && body.error.trim()) {
        return body.error.trim()
      }
      if (typeof body.body === 'string' && body.body.trim()) {
        return body.body.trim()
      }
    } catch {
      return fallback
    }
  }

  return fallback
}

function assertCookingAiResult(value: unknown): AskCookingHelperResult {
  const record = value as Partial<AskCookingHelperResult> | null

  if (
    !record
    || typeof record.answerText !== 'string'
    || !['text', 'photo', 'voice'].includes(String(record.answerType))
    || !['continue_current_step', 'adjust_then_continue', 'stop_and_check'].includes(String(record.suggestedAction))
    || !['low', 'medium', 'high'].includes(String(record.riskLevel))
    || typeof record.needsUserCheck !== 'boolean'
  ) {
    throw new Error('Cooking helper returned an invalid response.')
  }

  return {
    answerText: record.answerText,
    answerType: record.answerType as AskCookingHelperResult['answerType'],
    suggestedAction: record.suggestedAction as AskCookingHelperResult['suggestedAction'],
    riskLevel: record.riskLevel as AskCookingHelperResult['riskLevel'],
    needsUserCheck: record.needsUserCheck,
    model: typeof record.model === 'string' ? record.model : null,
  }
}

export async function askCookingHelper(
  input: AskCookingHelperInput
): Promise<AskCookingHelperResult> {
  const questionText = getTrimmedText(input.questionText)
  const questionImageUrl = getTrimmedText(input.questionImageUrl)

  if (!questionText && !questionImageUrl) {
    throw new Error('请先输入问题，或提供一张可以查看的图片。')
  }

  const { data, error } = await supabase.functions.invoke('ask-cooking-helper', {
    body: {
      sessionId: input.sessionId ?? null,
      recipeKey: input.recipeKey,
      recipeTitle: input.recipeTitle,
      stepNumber: input.stepNumber,
      stepTitle: input.stepTitle,
      stepBody: input.stepBody,
      assistantContext: input.assistantContext ?? null,
      ingredientKeys: input.ingredientKeys,
      equipmentKeys: input.equipmentKeys,
      questionText,
      questionImageUrl,
      answerType: input.answerType,
    },
  })

  if (error) throw new Error(await getFunctionErrorMessage(error))

  const result = assertCookingAiResult(data)
  const authUser = await ensureAuthUser()

  const { error: logError } = await supabase
    .from('cooking_ai_questions')
    .insert({
      user_id: authUser.userId,
      session_id: input.sessionId ?? null,
      recipe_id: input.recipeId,
      step_number: input.stepNumber,
      question_text: questionText,
      question_image_url: questionImageUrl,
      answer_text: result.answerText,
      answer_type: result.answerType,
      suggested_action: result.suggestedAction,
      risk_level: result.riskLevel,
      needs_user_check: result.needsUserCheck,
      model: result.model,
    })

  if (logError) {
    throw new Error(`AI 已回答，但问答记录保存失败：${logError.message}`)
  }

  return result
}
