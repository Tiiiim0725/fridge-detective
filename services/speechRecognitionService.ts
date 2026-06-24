import { Platform } from 'react-native'
import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition'

type SpeechRecognitionApi = typeof import('expo-speech-recognition')

type SpeechRecognitionHandlers = {
  onEnd: () => void
  onError: (event: ExpoSpeechRecognitionErrorEvent) => void
  onResult: (event: ExpoSpeechRecognitionResultEvent) => void
  onVolume: (value: number) => void
}

type StartSpeechRecognitionInput = {
  contextualStrings: string[]
  handlers: SpeechRecognitionHandlers
  requiresOnDeviceRecognition: boolean
}

export type CookingSpeechPermissionResult = {
  granted: boolean
  requiresOnDeviceRecognition: boolean
  unavailableReason: string | null
}

export type CookingSpeechRecognitionSession = {
  abort: () => void
  dispose: () => void
  stop: () => void
}

let speechRecognitionApi: SpeechRecognitionApi | null | undefined

async function loadSpeechRecognitionApi(): Promise<SpeechRecognitionApi | null> {
  if (Platform.OS === 'web') return null
  if (speechRecognitionApi !== undefined) return speechRecognitionApi

  try {
    speechRecognitionApi = await import('expo-speech-recognition')
  } catch {
    speechRecognitionApi = null
  }

  return speechRecognitionApi
}

function localeMatchesChinese(locale: string): boolean {
  const normalized = locale.toLowerCase()
  return normalized === 'zh-cn' || normalized.startsWith('zh-hans')
}

export async function requestCookingSpeechPermissions(): Promise<CookingSpeechPermissionResult> {
  const api = await loadSpeechRecognitionApi()

  if (!api) {
    return {
      granted: false,
      requiresOnDeviceRecognition: false,
      unavailableReason: '当前环境暂不支持真实语音识别，先用模拟转写测试这条链路。',
    }
  }

  if (!api.ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
    return {
      granted: false,
      requiresOnDeviceRecognition: false,
      unavailableReason: '当前设备没有可用的语音识别服务，先用模拟转写测试这条链路。',
    }
  }

  let canUseChineseOnDevice = false
  if (Platform.OS === 'ios' && api.ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
    try {
      const locales = await api.ExpoSpeechRecognitionModule.getSupportedLocales({})
      canUseChineseOnDevice = locales.installedLocales.some(localeMatchesChinese)
    } catch {
      canUseChineseOnDevice = false
    }
  }

  const permission = canUseChineseOnDevice
    ? await api.ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync()
    : await api.ExpoSpeechRecognitionModule.requestPermissionsAsync()

  return {
    granted: permission.granted,
    requiresOnDeviceRecognition: canUseChineseOnDevice,
    unavailableReason: permission.granted ? null : '需要麦克风和语音识别权限，才能直接说一句问 AI。',
  }
}

export async function startCookingSpeechRecognition({
  contextualStrings,
  handlers,
  requiresOnDeviceRecognition,
}: StartSpeechRecognitionInput): Promise<CookingSpeechRecognitionSession> {
  const api = await loadSpeechRecognitionApi()

  if (!api) {
    throw new Error('当前环境暂不支持真实语音识别。')
  }

  const subscriptions = [
    api.addSpeechRecognitionListener('result', handlers.onResult),
    api.addSpeechRecognitionListener('volumechange', ({ value }) => handlers.onVolume(value)),
    api.addSpeechRecognitionListener('error', handlers.onError),
    api.addSpeechRecognitionListener('end', handlers.onEnd),
  ]

  api.ExpoSpeechRecognitionModule.start({
    lang: 'zh-CN',
    interimResults: true,
    maxAlternatives: 1,
    contextualStrings: Array.from(new Set(contextualStrings.filter(Boolean))).slice(0, 80),
    continuous: true,
    requiresOnDeviceRecognition,
    addsPunctuation: true,
    iosTaskHint: 'dictation',
    iosVoiceProcessingEnabled: true,
    iosCategory: {
      category: 'playAndRecord',
      categoryOptions: ['defaultToSpeaker', 'allowBluetooth'],
      mode: 'voiceChat',
    },
    recordingOptions: { persist: false },
    volumeChangeEventOptions: {
      enabled: true,
      intervalMillis: 120,
    },
  })

  return {
    stop: () => api.ExpoSpeechRecognitionModule.stop(),
    abort: () => api.ExpoSpeechRecognitionModule.abort(),
    dispose: () => subscriptions.forEach((subscription) => subscription.remove()),
  }
}
