import { type Href, useRouter } from 'expo-router'

import { UserProfileFlow } from '@/app/dev-user-profile-check'
import { useAppSession } from '@/providers/AppSessionProvider'

export default function ProfileScreen() {
  const router = useRouter()
  const { refreshProfile } = useAppSession()

  return (
    <UserProfileFlow
      mode="settings"
      onBack={() => router.back()}
      onSaved={async () => {
        await refreshProfile()
        router.replace('/me' as Href)
      }}
    />
  )
}
