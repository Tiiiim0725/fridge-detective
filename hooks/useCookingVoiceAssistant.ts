import { useCallback, useRef, useState } from 'react'
import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition'

import {
  chooseCookingVoiceTranscript,
  getCookingVoiceStopReason,
  isAudibleCookingVoiceVolume,
  normalizeCookingVoiceVolume,
  type CookingVoiceStopReason,
} from '@/services/cookingVoiceActivity'
import {
  requestCookingSpeechPermissions,
  startCookingSpeechRecognition,
  type CookingSpeechRecognitionSession,
} from '@/services/speechRecognitionService'

export type CookingVoiceAssistantStatus =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'simulated'
  | 'error'

type UseCookingVoiceAssistantInput = {
  contextualStrings: string[]
  disabled?: boolean
  onAutoSubmit?: (transcript: string, reason: CookingVoiceStopReason) => void
  onTranscriptChange: (transcript: string) => void
}

export function useCookingVoiceAssistant({
  contextualStrings,
  disabled,
  onAutoSubmit,
  onTranscriptChange,
}: UseCookingVoiceAssistantInput) {
  const [status, setStatus] = useState<CookingVoiceAssistantStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [volume, setVolume] = useState(0)
  const [stopReason, setStopReason] = useState<CookingVoiceStopReason | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const sessionRef = useRef<CookingSpeechRecognitionSession | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef(0)
  const speechDetectedRef = useRef(false)
  const lastActivityAtRef = useRef<number | null>(null)
  const finalTranscriptRef = useRef('')
  const interimTranscriptRef = useRef('')

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resetRunState = useCallback(() => {
    clearIntervalRef()
    sessionRef.current?.dispose()
    sessionRef.current = null
    startedAtRef.current = 0
    speechDetectedRef.current = false
    lastActivityAtRef.current = null
    finalTranscriptRef.current = ''
    interimTranscriptRef.current = ''
    setInterimTranscript('')
    setVolume(0)
    setStopReason(null)
  }, [clearIntervalRef])

  const finalizeNativeRun = useCallback((reason: CookingVoiceStopReason) => {
    const transcript = chooseCookingVoiceTranscript(
      finalTranscriptRef.current,
      interimTranscriptRef.current
    )

    clearIntervalRef()
    if (reason !== 'manual') {
      sessionRef.current?.stop()
    }
    sessionRef.current?.dispose()
    sessionRef.current = null

    setStopReason(reason)
    setStatus('idle')
    setVolume(0)

    if (transcript) {
      onTranscriptChange(transcript)
      if (reason === 'silence') {
        setMessage('检测到停顿，正在把这句话发给 AI。')
        onAutoSubmit?.(transcript, reason)
      } else {
        setMessage(null)
      }
    } else if (reason === 'noSpeech') {
      setMessage('这次没有听到清楚的话，可以直接打字模拟。')
      setStatus('simulated')
    }
  }, [clearIntervalRef, onAutoSubmit, onTranscriptChange])

  const startWatchdog = useCallback(() => {
    clearIntervalRef()
    intervalRef.current = setInterval(() => {
      const reason = getCookingVoiceStopReason({
        now: Date.now(),
        startedAt: startedAtRef.current,
        speechDetected: speechDetectedRef.current,
        lastActivityAt: lastActivityAtRef.current,
      })

      if (reason) finalizeNativeRun(reason)
    }, 300)
  }, [clearIntervalRef, finalizeNativeRun])

  const handleResult = useCallback((event: ExpoSpeechRecognitionResultEvent) => {
    const transcript = event.results[0]?.transcript?.trim() ?? ''
    if (!transcript) return

    speechDetectedRef.current = true
    lastActivityAtRef.current = Date.now()

    if (event.isFinal) {
      finalTranscriptRef.current = transcript
    } else {
      interimTranscriptRef.current = transcript
      setInterimTranscript(transcript)
    }

    onTranscriptChange(chooseCookingVoiceTranscript(
      finalTranscriptRef.current,
      interimTranscriptRef.current
    ))
  }, [onTranscriptChange])

  const handleError = useCallback((event: ExpoSpeechRecognitionErrorEvent) => {
    setMessage(event.message || '语音识别暂时不可用，已切换到模拟转写。')
    setStopReason('error')
    setStatus('simulated')
    clearIntervalRef()
    sessionRef.current?.dispose()
    sessionRef.current = null
  }, [clearIntervalRef])

  const handleVolume = useCallback((value: number) => {
    setVolume(normalizeCookingVoiceVolume(value))
    if (isAudibleCookingVoiceVolume(value)) {
      speechDetectedRef.current = true
      lastActivityAtRef.current = Date.now()
    }
  }, [])

  const startListening = useCallback(async () => {
    if (disabled) return

    resetRunState()
    setMessage(null)
    setStatus('starting')

    try {
      const permission = await requestCookingSpeechPermissions()
      if (!permission.granted) {
        setMessage(permission.unavailableReason)
        setStatus('simulated')
        return
      }

      startedAtRef.current = Date.now()
      sessionRef.current = await startCookingSpeechRecognition({
        contextualStrings,
        requiresOnDeviceRecognition: permission.requiresOnDeviceRecognition,
        handlers: {
          onEnd: () => finalizeNativeRun('manual'),
          onError: handleError,
          onResult: handleResult,
          onVolume: handleVolume,
        },
      })
      setStatus('listening')
      startWatchdog()
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : String(caught))
      setStatus('simulated')
    }
  }, [
    contextualStrings,
    disabled,
    finalizeNativeRun,
    handleError,
    handleResult,
    handleVolume,
    resetRunState,
    startWatchdog,
  ])

  const stopListening = useCallback(() => {
    if (status !== 'listening') return
    finalizeNativeRun('manual')
  }, [finalizeNativeRun, status])

  const openSimulatedInput = useCallback(() => {
    resetRunState()
    setStatus('simulated')
    setMessage('当前先用模拟转写。输入一句话后，仍会按 voice 类型问真实 AI。')
  }, [resetRunState])

  const resetVoiceAssistant = useCallback(() => {
    resetRunState()
    setStatus('idle')
    setMessage(null)
  }, [resetRunState])

  return {
    interimTranscript,
    message,
    openSimulatedInput,
    resetVoiceAssistant,
    startListening,
    status,
    stopListening,
    stopReason,
    volume,
  }
}
