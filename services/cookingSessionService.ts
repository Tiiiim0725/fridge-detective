import { supabase } from '@/lib/supabase'
import { ensureAuthUser } from '@/services/authService'
import type { CookingSession, CookingSessionStatus } from '@/types/tutorial'

type SessionRow = {
  id: string
  user_id: string
  recipe_id: string
  current_step_number: number
  status: CookingSessionStatus
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
  recipes?: {
    recipe_key?: string
    zh_name?: string | null
  } | null
}

export type LatestCookingSession = CookingSession & {
  recipeZhName: string | null
}

function toServiceError(error: unknown, fallbackMessage: string): Error {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : fallbackMessage
    const code = typeof record.code === 'string' ? ` [code: ${record.code}]` : ''
    const details = typeof record.details === 'string' ? ` [details: ${record.details}]` : ''
    const hint = typeof record.hint === 'string' ? ` [hint: ${record.hint}]` : ''
    return new Error(`${message}${code}${details}${hint}`)
  }

  return error instanceof Error ? error : new Error(fallbackMessage)
}

function mapSession(row: SessionRow, fallbackRecipeKey = ''): CookingSession {
  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    recipeKey: row.recipes?.recipe_key ?? fallbackRecipeKey,
    currentStepNumber: row.current_step_number,
    status: row.status,
    startedAt: new Date(row.started_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

async function getRecipeId(recipeKey: string): Promise<string> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id')
    .eq('recipe_key', recipeKey)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw toServiceError(error, 'Failed to query cooking session recipe')
  if (!data) throw new Error(`Recipe not found: ${recipeKey}`)
  return String(data.id)
}

export async function getOrCreateCookingSession(recipeKey: string): Promise<CookingSession> {
  const [authUser, recipeId] = await Promise.all([
    ensureAuthUser(),
    getRecipeId(recipeKey),
  ])

  const { data: existing, error: queryError } = await supabase
    .from('cooking_sessions')
    .select('*')
    .eq('user_id', authUser.userId)
    .eq('recipe_id', recipeId)
    .in('status', ['active', 'paused'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (queryError) throw toServiceError(queryError, 'Failed to query active cooking session')

  if (existing) {
    if (existing.status === 'paused') {
      return updateCookingSession(String(existing.id), { status: 'active' })
    }
    return mapSession(existing as SessionRow, recipeKey)
  }

  const { data, error } = await supabase
    .from('cooking_sessions')
    .insert({
      user_id: authUser.userId,
      recipe_id: recipeId,
      current_step_number: 1,
      status: 'active',
    })
    .select('*, recipes(recipe_key)')
    .single()

  if (error) throw toServiceError(error, 'Failed to create cooking session')
  return mapSession(data as SessionRow, recipeKey)
}

export async function getLatestOpenCookingSession(): Promise<LatestCookingSession | null> {
  const sessions = await getRecentOpenCookingSessions(1)
  return sessions[0] ?? null
}

export async function getRecentOpenCookingSessions(limit = 8): Promise<LatestCookingSession[]> {
  const authUser = await ensureAuthUser()

  const { data, error } = await supabase
    .from('cooking_sessions')
    .select('*, recipes(recipe_key, zh_name)')
    .eq('user_id', authUser.userId)
    .in('status', ['active', 'paused'])
    .order('updated_at', { ascending: false })
    .limit(Math.max(limit * 3, limit))

  if (error) throw toServiceError(error, 'Failed to query recent cooking sessions')

  const seenRecipeKeys = new Set<string>()
  const sessions: LatestCookingSession[] = []

  for (const row of (data ?? []) as SessionRow[]) {
    const mapped = mapSession(row)

    if (!mapped.recipeKey || seenRecipeKeys.has(mapped.recipeKey)) {
      continue
    }

    seenRecipeKeys.add(mapped.recipeKey)
    sessions.push({
      ...mapped,
      recipeZhName: row.recipes?.zh_name ?? null,
    })

    if (sessions.length >= limit) {
      break
    }
  }

  return sessions
}

export async function updateCookingSession(
  sessionId: string,
  input: {
    currentStepNumber?: number
    status?: CookingSessionStatus
  }
): Promise<CookingSession> {
  const authUser = await ensureAuthUser()

  if (input.currentStepNumber !== undefined && input.currentStepNumber < 1) {
    throw new Error('currentStepNumber must be at least 1.')
  }

  const payload: Record<string, unknown> = {}
  if (input.currentStepNumber !== undefined) {
    payload.current_step_number = input.currentStepNumber
  }
  if (input.status !== undefined) {
    payload.status = input.status
    payload.completed_at = input.status === 'completed' ? new Date().toISOString() : null
  }

  const { data, error } = await supabase
    .from('cooking_sessions')
    .update(payload)
    .eq('id', sessionId)
    .eq('user_id', authUser.userId)
    .select('*, recipes(recipe_key)')
    .maybeSingle()

  if (error) throw toServiceError(error, 'Failed to update cooking session')
  if (!data) throw new Error('Cooking session not found or not accessible.')
  return mapSession(data as SessionRow)
}

export async function pauseCookingSession(sessionId: string): Promise<CookingSession> {
  return updateCookingSession(sessionId, { status: 'paused' })
}
