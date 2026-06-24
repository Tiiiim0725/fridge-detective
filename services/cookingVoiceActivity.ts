export type CookingVoiceStopReason = 'manual' | 'silence' | 'noSpeech' | 'maxDuration' | 'error'

export const COOKING_VOICE_ACTIVITY_THRESHOLD = 0.18
export const COOKING_VOICE_SILENCE_TIMEOUT_MS = 4_000
export const COOKING_VOICE_NO_SPEECH_TIMEOUT_MS = 8_000
export const COOKING_VOICE_MAX_DURATION_MS = 30_000

export type CookingVoiceActivityTiming = {
  now: number
  startedAt: number
  speechDetected: boolean
  lastActivityAt: number | null
}

export function isAudibleCookingVoiceVolume(value: number): boolean {
  return Number.isFinite(value) && normalizeCookingVoiceVolume(value) >= COOKING_VOICE_ACTIVITY_THRESHOLD
}

export function normalizeCookingVoiceVolume(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, (value + 2) / 12))
}

export function getCookingVoiceStopReason(
  timing: CookingVoiceActivityTiming
): CookingVoiceStopReason | null {
  const elapsed = timing.now - timing.startedAt

  if (elapsed >= COOKING_VOICE_MAX_DURATION_MS) return 'maxDuration'
  if (!timing.speechDetected && elapsed >= COOKING_VOICE_NO_SPEECH_TIMEOUT_MS) return 'noSpeech'
  if (
    timing.speechDetected
    && timing.lastActivityAt !== null
    && timing.now - timing.lastActivityAt >= COOKING_VOICE_SILENCE_TIMEOUT_MS
  ) {
    return 'silence'
  }

  return null
}

export function chooseCookingVoiceTranscript(
  finalTranscript: string,
  interimTranscript: string
): string {
  return finalTranscript.trim() || interimTranscript.trim()
}
