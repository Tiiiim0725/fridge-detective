import { type Href, useRouter } from 'expo-router'

import { FridgeRecognitionFlow } from '@/app/dev-fridge-recognition-check'

export default function FridgeScanScreen() {
  const router = useRouter()

  return (
    <FridgeRecognitionFlow
      mode="formal"
      onBack={() => router.back()}
      onContinue={() => router.replace('/?fridgeUpdated=1' as Href)}
    />
  )
}
