// services/authService.ts
// User Profile / Onboarding Foundation v0.1 - Auth Service
// 职责：封装 Supabase Auth 身份初始化，不负责 profile 业务逻辑

import { supabase } from '@/lib/supabase'

/**
 * Auth user context
 */
export interface AuthUserContext {
  userId: string
  email: string | null
  isAnonymous: boolean
}

/**
 * Map Supabase user to AuthUserContext
 * Internal helper - handles is_anonymous field safely
 */
function mapAuthUser(user: unknown): AuthUserContext {
  const userRecord = user as {
    id: string
    email?: string | null
    is_anonymous?: boolean
  }

  // Safely read is_anonymous field (not always in TypeScript SDK types)
  const maybeAnonymous = userRecord.is_anonymous

  // Fallback: if no email, consider anonymous
  const isAnonymous = typeof maybeAnonymous === 'boolean'
    ? maybeAnonymous
    : !userRecord.email

  return {
    userId: userRecord.id,
    email: userRecord.email ?? null,
    isAnonymous,
  }
}

/**
 * Ensure authenticated user, sign in anonymously if not exists
 * @throws Error if auth operations fail
 */
export async function ensureAuthUser(): Promise<AuthUserContext> {
  // 1. Get current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  // 2. Handle getSession error
  if (sessionError) {
    throw new Error(`Failed to get auth session: ${sessionError.message}`)
  }

  // 3. Return existing user if signed in
  if (sessionData.session?.user) {
    return mapAuthUser(sessionData.session.user)
  }

  // 4. No session - sign in anonymously
  const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        is_anonymous: true,
      },
    },
  })

  // 5. Handle signInAnonymously error
  if (signInError) {
    throw new Error(`Failed to sign in anonymously: ${signInError.message}`)
  }

  // 6. Handle case where signIn succeeded but no user returned
  if (!signInData.user) {
    throw new Error('Anonymous sign-in succeeded but no user was returned.')
  }

  // 7. Return AuthUserContext
  return mapAuthUser(signInData.user)
}

/**
 * Get current user without triggering anonymous sign-in
 * @returns AuthUserContext if authenticated, null otherwise
 * @throws Error if getSession fails
 */
export async function getCurrentUser(): Promise<AuthUserContext | null> {
  // 1. Get current session
  const { data, error } = await supabase.auth.getSession()

  // 2. Handle error
  if (error) {
    throw new Error(`Failed to get auth session: ${error.message}`)
  }

  // 3. Return null if no user
  if (!data.session?.user) {
    return null
  }

  // 4. Return mapped user
  return mapAuthUser(data.session.user)
}

/**
 * Sign out current user
 * @throws Error if signOut fails
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`)
  }
}
