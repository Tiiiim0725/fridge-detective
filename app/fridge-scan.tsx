import { type Href, useLocalSearchParams, useRouter } from 'expo-router'

import { FridgeRecognitionFlow } from '@/app/dev-fridge-recognition-check'

export default function FridgeScanScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ capture?: string | string[] }>()
  const capture = Array.isArray(params.capture) ? params.capture[0] : params.capture

  return (
    <FridgeRecognitionFlow
      autoOpenCamera={Boolean(capture)}
      autoOpenCameraKey={capture ?? null}
      mode="formal"
      onBack={() => router.back()}
      onContinue={() => router.replace('/?fridgeUpdated=1' as Href)}
    />
  )
}
