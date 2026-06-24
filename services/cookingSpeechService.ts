import * as Speech from 'expo-speech'

let selectedChineseVoice: string | null | undefined

async function getChineseVoice(): Promise<string | undefined> {
  if (selectedChineseVoice !== undefined) return selectedChineseVoice || undefined

  try {
    const voices = await Speech.getAvailableVoicesAsync()
    const chineseVoices = voices.filter((voice) => (
      voice.language.toLowerCase().startsWith('zh')
    ))
    const preferredVoice = chineseVoices.find((voice) => (
      voice.quality === Speech.VoiceQuality.Enhanced
    )) ?? chineseVoices[0]

    selectedChineseVoice = preferredVoice?.identifier ?? null
  } catch {
    selectedChineseVoice = null
  }

  return selectedChineseVoice || undefined
}

export async function speakCookingText(text: string): Promise<void> {
  const trimmedText = text.trim()
  if (!trimmedText) return

  await Speech.stop()
  const voice = await getChineseVoice()

  await new Promise<void>((resolve, reject) => {
    Speech.speak(trimmedText, {
      language: 'zh-CN',
      pitch: 1,
      rate: 0.92,
      voice,
      onDone: resolve,
      onStopped: resolve,
      onError: (error) => reject(error),
    })
  })
}

export async function stopCookingSpeech(): Promise<void> {
  await Speech.stop()
}

export async function isCookingSpeechSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync()
}
