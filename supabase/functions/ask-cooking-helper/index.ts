declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

type AnswerType = 'text' | 'photo' | 'voice'
type SuggestedAction = 'continue_current_step' | 'adjust_then_continue' | 'stop_and_check'
type RiskLevel = 'low' | 'medium' | 'high'

type AskCookingHelperBody = {
  sessionId?: string | null
  recipeKey?: string
  recipeTitle?: string
  stepNumber?: number
  stepTitle?: string
  stepBody?: string
  assistantContext?: string | null
  ingredientKeys?: string[]
  equipmentKeys?: string[]
  questionText?: string | null
  questionImageUrl?: string | null
  answerType?: AnswerType
}

type ModelAnswer = {
  answer_text?: unknown
  suggested_action?: unknown
  risk_level?: unknown
  needs_user_check?: unknown
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const cookingAnswerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer_text', 'suggested_action', 'risk_level', 'needs_user_check'],
  properties: {
    answer_text: { type: 'string' },
    suggested_action: {
      type: 'string',
      enum: ['continue_current_step', 'adjust_then_continue', 'stop_and_check'],
    },
    risk_level: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
    needs_user_check: { type: 'boolean' },
  },
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function cleanText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function cleanStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((key): key is string => typeof key === 'string' && key.trim().length > 0)
    : []
}

function stripJsonCodeFence(content: string): string {
  const trimmed = content.trim()
  if (!trimmed.startsWith('```')) return trimmed

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function extractMessageContent(response: unknown): string {
  const content = (response as {
    choices?: Array<{ message?: { content?: unknown } }>
  }).choices?.[0]?.message?.content

  if (typeof content === 'string' && content.trim()) return content.trim()
  throw new Error('OpenRouter response did not contain text content.')
}

function normalizeSuggestedAction(value: unknown): SuggestedAction {
  return value === 'continue_current_step'
    || value === 'adjust_then_continue'
    || value === 'stop_and_check'
    ? value
    : 'adjust_then_continue'
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  return value === 'low' || value === 'medium' || value === 'high' ? value : 'medium'
}

function normalizeModelAnswer(value: ModelAnswer) {
  const answerText = cleanText(value.answer_text)
  if (!answerText) {
    throw new Error('OpenRouter response did not include answer_text.')
  }

  const riskLevel = normalizeRiskLevel(value.risk_level)

  return {
    answerText,
    suggestedAction: normalizeSuggestedAction(value.suggested_action),
    riskLevel,
    needsUserCheck: typeof value.needs_user_check === 'boolean'
      ? value.needs_user_check
      : riskLevel !== 'low',
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405)
  }

  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  const model = Deno.env.get('OPENROUTER_MODEL')

  if (!apiKey || !model) {
    return jsonResponse({
      error: 'Missing OPENROUTER_API_KEY or OPENROUTER_MODEL Edge Function secret.',
    }, 500)
  }

  let body: AskCookingHelperBody
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400)
  }

  const recipeKey = cleanText(body.recipeKey)
  const recipeTitle = cleanText(body.recipeTitle)
  const questionText = cleanText(body.questionText)
  const questionImageUrl = cleanText(body.questionImageUrl)
  const stepTitle = cleanText(body.stepTitle)
  const stepBody = cleanText(body.stepBody)
  const assistantContext = cleanText(body.assistantContext)
  const ingredientKeys = cleanStringArray(body.ingredientKeys)
  const equipmentKeys = cleanStringArray(body.equipmentKeys)
  const stepNumber = body.stepNumber
  const answerType = body.answerType ?? 'text'

  if (
    !recipeKey
    || !recipeTitle
    || !stepTitle
    || !stepBody
    || !Number.isInteger(stepNumber)
    || Number(stepNumber) < 1
  ) {
    return jsonResponse({
      error: 'recipeKey, recipeTitle, a positive stepNumber, stepTitle, and stepBody are required.',
    }, 400)
  }

  if (!questionText && !questionImageUrl) {
    return jsonResponse({ error: 'questionText or questionImageUrl is required.' }, 400)
  }

  if (!['text', 'photo', 'voice'].includes(answerType)) {
    return jsonResponse({ error: 'answerType must be text, photo, or voice.' }, 400)
  }

  const prompt = [
    'You are a concise, calm cooking-step assistant for a beginner.',
    'Answer in Simplified Chinese.',
    'Focus only on the current cooking step and the recipe context.',
    'Do not recommend unrelated recipes.',
    'Do not invent food-safety certainty from an image. If uncertain, say what visual cue the user should check.',
    'Return JSON only. Do not use markdown or add extra keys.',
    'suggested_action must be continue_current_step, adjust_then_continue, or stop_and_check.',
    'risk_level must be low, medium, or high.',
    'Set needs_user_check to true when the user must inspect texture, doneness, heat, smoke, or another condition you cannot verify.',
    `Recipe key: ${recipeKey}`,
    `Recipe title: ${recipeTitle}`,
    `Current step: ${stepNumber}`,
    `Step title: ${stepTitle}`,
    `Step instruction: ${stepBody}`,
    assistantContext ? `Assistant context: ${assistantContext}` : null,
    `Ingredient keys: ${ingredientKeys.join(', ') || 'none'}`,
    `Equipment keys: ${equipmentKeys.join(', ') || 'none'}`,
    `Input type: ${answerType}`,
    questionText ? `User question: ${questionText}` : 'User asks whether the photographed step looks correct.',
  ].filter(Boolean).join('\n')

  const userContent = questionImageUrl
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: questionImageUrl } },
      ]
    : prompt

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You help a beginner complete one structured recipe step at a time.',
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'cooking_helper_answer',
            strict: true,
            schema: cookingAnswerSchema,
          },
        },
      }),
    })

    const responseText = await response.text()
    if (!response.ok) {
      console.error('OpenRouter cooking helper request failed', {
        status: response.status,
        statusText: response.statusText,
        model,
        body: responseText.slice(0, 1200),
      })
      return jsonResponse({
        error: 'OpenRouter request failed.',
        status: response.status,
        body: responseText.slice(0, 1200),
      }, 502)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(responseText)
    } catch {
      return jsonResponse({ error: 'OpenRouter returned invalid JSON.' }, 502)
    }

    let modelAnswer: ModelAnswer
    try {
      modelAnswer = JSON.parse(stripJsonCodeFence(extractMessageContent(parsed))) as ModelAnswer
    } catch (error) {
      return jsonResponse({
        error: error instanceof Error ? error.message : 'OpenRouter returned an invalid structured answer.',
      }, 502)
    }

    return jsonResponse({
      ...normalizeModelAnswer(modelAnswer),
      answerType,
      model,
    })
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : String(error),
    }, 500)
  }
})
