import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  ensureAuthUser,
  type AuthUserContext,
} from '@/services/authService'
import { getProfile } from '@/services/profileService'
import type { Profile } from '@/types/profile'

type SessionSnapshot = {
  authUser: AuthUserContext
  profile: Profile | null
}

export type AppSessionContextValue = {
  authUser: AuthUserContext | null
  profile: Profile | null
  isBootstrapping: boolean
  onboardingComplete: boolean
  errorMessage: string | null
  refreshProfile: () => Promise<Profile | null>
  retryBootstrap: () => Promise<void>
}

const AppSessionContext = createContext<AppSessionContextValue | null>(null)

let initialSessionPromise: Promise<SessionSnapshot> | null = null

function loadInitialSession(): Promise<SessionSnapshot> {
  if (!initialSessionPromise) {
    initialSessionPromise = ensureAuthUser()
      .then(async (authUser) => ({
        authUser,
        profile: await getProfile(),
      }))
      .catch((error) => {
        initialSessionPromise = null
        throw error
      })
  }

  return initialSessionPromise
}

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUserContext | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runBootstrap = useCallback(async () => {
    setIsBootstrapping(true)
    setErrorMessage(null)

    try {
      const snapshot = await loadInitialSession()
      setAuthUser(snapshot.authUser)
      setProfile(snapshot.profile)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setIsBootstrapping(false)
    }
  }, [])

  useEffect(() => {
    void runBootstrap()
  }, [runBootstrap])

  const refreshProfile = useCallback(async () => {
    const nextProfile = await getProfile()
    setProfile(nextProfile)
    return nextProfile
  }, [])

  const retryBootstrap = useCallback(async () => {
    initialSessionPromise = null
    await runBootstrap()
  }, [runBootstrap])

  return (
    <AppSessionContext.Provider
      value={{
        authUser,
        profile,
        isBootstrapping,
        onboardingComplete: profile?.onboardingStatus === 'completed',
        errorMessage,
        refreshProfile,
        retryBootstrap,
      }}
    >
      {children}
    </AppSessionContext.Provider>
  )
}

export function useAppSession(): AppSessionContextValue {
  const context = useContext(AppSessionContext)

  if (!context) {
    throw new Error('useAppSession must be used inside AppSessionProvider.')
  }

  return context
}
