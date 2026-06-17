// Supabase Edge Function: recognize-fridge
// Fridge Recognition v0.2 - calls OpenRouter and returns normalized draft recognition JSON.

declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

type FridgeRecognitionQuantityKind = 'unknown' | 'text' | 'count'
type FridgeRecognitionPhotoQuality = 'good' | 'usable' | 'poor'
type FridgeRecognitionSuggestedAction = 'continue' | 'retake_same_zone' | 'take_extra_photo'

interface RecognitionRequestBody {
  scanId?: string
  photoId?: string
  zoneKey?: string
  guidePrompt?: string | null
  imageUrl?: string
  imageDataUrl?: string
}

interface ModelPhotoAssessment {
  quality?: unknown
  needs_retake?: unknown
  retake_reason?: unknown
  suggested_action?: unknown
}

interface ModelItem {
  raw_name?: unknown
  display_name?: unknown
  quantity_kind?: unknown
  quantity_text?: unknown
  quantity_count?: unknown
  confidence?: unknown
  needs_review?: unknown
  uncertainty_reason?: unknown
}

interface ModelResponse {
  photo_assessment?: ModelPhotoAssessment
  items?: ModelItem[]
}

type OpenRouterResponseFormat = 'json_schema' | 'json_object_fallback'
type FridgeImageSource = 'imageUrl' | 'imageDataUrl'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const openRouterErrorSnippetLength = 2000

const systemPrompt = `
You are Fridge Detective's fridge photo recognition model.

Return strict JSON only. Do not return markdown, code fences, explanation text, or extra keys.
`.trim()

const userPromptTemplate = `
Task:
Recognize visible food ingredients in exactly one fridge photo.


Known app context:
- scanId, photoId, zoneKey, and guidePrompt are known by the system.
- Do not output scan_id, photo_id, zone_key, bbox, coordinates, or regions.

Rules:
- Only identify clearly visible food ingredients.
- Do not guess contents of opaque bags, boxes, covered containers, or heavily blocked packaging.
- Do not judge expiration, food safety, health, or nutrition.
- Do not recommend recipes.
- Return JSON only. Do not return markdown or explanation text.
- If uncertain about an item, set needs_review to true.
- If photo quality is poor, use photo_assessment to suggest a retake.

Quantity rules:
- unknown: quantity_text must be null and quantity_count must be null.
- text: quantity_text is a short natural language phrase and quantity_count must be null.
- count: quantity_count is a number and quantity_text must be null.
`.trim()

const fridgeRecognitionJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['photo_assessment', 'items'],
  properties: {
    photo_assessment: {
      type: 'object',
      additionalProperties: false,
      required: ['quality', 'needs_retake', 'retake_reason', 'suggested_action'],
      properties: {
        quality: {
          type: 'string',
          enum: ['good', 'usable', 'poor'],
        },
        needs_retake: {
          type: 'boolean',
        },
        retake_reason: {
          type: ['string', 'null'],
        },
        suggested_action: {
          type: 'string',
          enum: ['continue', 'retake_same_zone', 'take_extra_photo'],
        },
      },
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'raw_name',
          'display_name',
          'quantity_kind',
          'quantity_text',
          'quantity_count',
          'confidence',
          'needs_review',
          'uncertainty_reason',
        ],
        properties: {
          raw_name: {
            type: 'string',
          },
          display_name: {
            type: 'string',
          },
          quantity_kind: {
            type: 'string',
            enum: ['unknown', 'text', 'count'],
          },
          quantity_text: {
            type: ['string', 'null'],
          },
          quantity_count: {
            type: ['number', 'null'],
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
          },
          needs_review: {
            type: 'boolean',
          },
          uncertainty_reason: {
            type: ['string', 'null'],
          },
        },
      },
    },
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

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function clampConfidence(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(1, Math.max(0, value))
}

function normalizeQuantity(
  quantityKind: unknown,
  quantityText: unknown,
  quantityCount: unknown
): {
  quantityKind: FridgeRecognitionQuantityKind
  quantityText: string | null
  quantityCount: number | null
} {
  if (quantityKind === 'text') {
    return {
      quantityKind: 'text',
      quantityText: stringOrNull(quantityText),
      quantityCount: null,
    }
  }

  if (quantityKind === 'count' && typeof quantityCount === 'number' && Number.isFinite(quantityCount)) {
    return {
      quantityKind: 'count',
      quantityText: null,
      quantityCount,
    }
  }

  return {
    quantityKind: 'unknown',
    quantityText: null,
    quantityCount: null,
  }
}

function normalizePhotoQuality(value: unknown): FridgeRecognitionPhotoQuality {
  return value === 'good' || value === 'usable' || value === 'poor' ? value : 'poor'
}

function normalizeSuggestedAction(value: unknown): FridgeRecognitionSuggestedAction {
  return value === 'continue' || value === 'retake_same_zone' || value === 'take_extra_photo'
    ? value
    : 'retake_same_zone'
}

function getSnippet(value: string): string {
  return value.slice(0, openRouterErrorSnippetLength)
}

function buildResponseFormat(responseFormat: OpenRouterResponseFormat) {
  if (responseFormat === 'json_object_fallback') {
    return {
      type: 'json_object',
    }
  }

  return {
    type: 'json_schema',
    json_schema: {
      name: 'fridge_recognition_result',
      strict: true,
      schema: fridgeRecognitionJsonSchema,
    },
  }
}

function buildOpenRouterPayload(
  openRouterModel: string,
  userPrompt: string,
  imageUrl: string,
  responseFormat: OpenRouterResponseFormat
) {
  return {
    model: openRouterModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    response_format: buildResponseFormat(responseFormat),
  }
}

async function sendOpenRouterRequest(
  openRouterApiKey: string,
  payload: ReturnType<typeof buildOpenRouterPayload>
): Promise<{
  ok: boolean
  status: number
  statusText: string
  body: string
}> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: await response.text(),
  }
}

function isResponseFormatCompatibilityError(status: number, body: string): boolean {
  if (status !== 400) {
    return false
  }

  const normalizedBody = body.toLowerCase()

  return (
    normalizedBody.includes('response_format') ||
    normalizedBody.includes('json_schema') ||
    normalizedBody.includes('json schema') ||
    normalizedBody.includes('schema')
  )
}

function logOpenRouterError(details: {
  status: number
  statusText: string
  body: string
  model: string
  imageSource: FridgeImageSource
  responseFormat: OpenRouterResponseFormat
}): void {
  console.error('OpenRouter request failed', {
    status: details.status,
    statusText: details.statusText,
    body: getSnippet(details.body),
    model: details.model,
    imageSource: details.imageSource,
    responseFormat: details.responseFormat,
  })
}

function extractMessageContent(response: unknown): string {
  const record = response as {
    choices?: Array<{
      message?: {
        content?: unknown
      }
    }>
  }
  const content = record.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }

        if (typeof part === 'object' && part !== null && 'text' in part) {
          const maybeText = (part as { text?: unknown }).text
          return typeof maybeText === 'string' ? maybeText : ''
        }

        return ''
      })
      .join('')
  }

  throw new Error('OpenRouter response did not include text content.')
}

function stripJsonCodeFence(content: string): string {
  const trimmed = content.trim()

  if (!trimmed.startsWith('```')) {
    return trimmed
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function normalizeModelResponse(parsed: ModelResponse) {
  const assessment = parsed.photo_assessment ?? {}
  const items = Array.isArray(parsed.items) ? parsed.items : []

  return {
    photoAssessment: {
      quality: normalizePhotoQuality(assessment.quality),
      needsRetake: typeof assessment.needs_retake === 'boolean' ? assessment.needs_retake : true,
      retakeReason: stringOrNull(assessment.retake_reason),
      suggestedAction: normalizeSuggestedAction(assessment.suggested_action),
    },
    items: items.map((item) => {
      const quantity = normalizeQuantity(item.quantity_kind, item.quantity_text, item.quantity_count)
      const confidence = clampConfidence(item.confidence)
      const modelNeedsReview = typeof item.needs_review === 'boolean' ? item.needs_review : true

      return {
        rawName: stringOrNull(item.raw_name) ?? 'unknown',
        displayName: stringOrNull(item.display_name) ?? stringOrNull(item.raw_name) ?? 'unknown',
        quantityKind: quantity.quantityKind,
        quantityText: quantity.quantityText,
        quantityCount: quantity.quantityCount,
        confidence,
        needsReview: modelNeedsReview || confidence < 0.7,
        uncertaintyReason: stringOrNull(item.uncertainty_reason),
      }
    }),
    rawResponse: parsed,
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405)
  }

  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
  const openRouterModel = Deno.env.get('OPENROUTER_MODEL')

  if (!openRouterApiKey || !openRouterModel) {
    return jsonResponse({
      error: 'Missing OpenRouter configuration. Set OPENROUTER_API_KEY and OPENROUTER_MODEL as Supabase secrets.',
    }, 500)
  }

  let body: RecognitionRequestBody

  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400)
  }

  if (typeof body.zoneKey !== 'string' || body.zoneKey.trim().length === 0) {
    return jsonResponse({ error: 'zoneKey is required.' }, 400)
  }

  const imageDataUrl = stringOrNull(body.imageDataUrl)
  const imageHttpUrl = stringOrNull(body.imageUrl)
  const imageUrl = imageDataUrl ?? imageHttpUrl
  const imageSource: FridgeImageSource = imageDataUrl ? 'imageDataUrl' : 'imageUrl'

  if (!imageUrl) {
    return jsonResponse({ error: 'imageUrl or imageDataUrl is required.' }, 400)
  }

  const userPrompt = [
    userPromptTemplate,
    '',
    `Fridge zone: ${body.zoneKey}`,
    body.guidePrompt ? `Guide prompt: ${body.guidePrompt}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    let responseFormat: OpenRouterResponseFormat = 'json_schema'
    let openRouterResult = await sendOpenRouterRequest(
      openRouterApiKey,
      buildOpenRouterPayload(openRouterModel, userPrompt, imageUrl, responseFormat)
    )

    if (!openRouterResult.ok) {
      logOpenRouterError({
        status: openRouterResult.status,
        statusText: openRouterResult.statusText,
        body: openRouterResult.body,
        model: openRouterModel,
        imageSource,
        responseFormat,
      })

      if (!isResponseFormatCompatibilityError(openRouterResult.status, openRouterResult.body)) {
        return jsonResponse({
          error: 'OpenRouter request failed',
          status: openRouterResult.status,
          statusText: openRouterResult.statusText,
          body: getSnippet(openRouterResult.body),
        }, 502)
      }

      responseFormat = 'json_object_fallback'
      console.error('Retrying OpenRouter request with json_object response_format', {
        model: openRouterModel,
        imageSource,
        responseFormat,
      })

      openRouterResult = await sendOpenRouterRequest(
        openRouterApiKey,
        buildOpenRouterPayload(openRouterModel, userPrompt, imageUrl, responseFormat)
      )
    }

    if (!openRouterResult.ok) {
      logOpenRouterError({
        status: openRouterResult.status,
        statusText: openRouterResult.statusText,
        body: openRouterResult.body,
        model: openRouterModel,
        imageSource,
        responseFormat,
      })

      return jsonResponse({
        error: 'OpenRouter request failed',
        status: openRouterResult.status,
        statusText: openRouterResult.statusText,
        body: getSnippet(openRouterResult.body),
      }, 502)
    }

    let openRouterJson: unknown

    try {
      openRouterJson = JSON.parse(openRouterResult.body)
    } catch {
      return jsonResponse({
        error: 'Failed to parse OpenRouter response JSON',
        body: getSnippet(openRouterResult.body),
      }, 502)
    }

    let content: string

    try {
      content = stripJsonCodeFence(extractMessageContent(openRouterJson))
    } catch (error) {
      return jsonResponse({
        error: error instanceof Error ? error.message : String(error),
        body: getSnippet(openRouterResult.body),
      }, 502)
    }

    let parsed: ModelResponse

    try {
      parsed = JSON.parse(content) as ModelResponse
    } catch {
      return jsonResponse({
        error: 'Failed to parse OpenRouter JSON response',
        body: getSnippet(content),
      }, 502)
    }

    return jsonResponse(normalizeModelResponse(parsed))
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : String(error),
    }, 500)
  }
})
