// services/aiService.ts
// Fridge Recognition v0.2 - Supabase Edge Function client.

import { supabase } from '@/lib/supabase'
import type {
  FridgeRecognitionInput,
  FridgeRecognitionResult,
} from '@/types/fridgeRecognition'

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

export async function recognizeFridgePhoto(
  input: FridgeRecognitionInput
): Promise<FridgeRecognitionResult> {
  const { data, error } = await supabase.functions.invoke('recognize-fridge', {
    body: input,
  })

  if (error) {
    throw toServiceError(error, 'Failed to recognize fridge photo')
  }

  if (!data) {
    throw new Error('Fridge recognition returned no data.')
  }

  return data as FridgeRecognitionResult
}
