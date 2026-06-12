// services/profileService.ts
// User Profile / Onboarding Foundation v0.1 - Profile Service
// 职责：User Profile / Onboarding 业务读写，不负责 UI 逻辑

import { supabase } from '@/lib/supabase'
import { ensureAuthUser, getCurrentUser } from '@/services/authService'
import type {
  Profile,
  UserPreferences,
  KitchenEquipmentItem,
  PantryItem,
  OnboardingContext,
  UpdateProfileInput,
  SaveUserPreferencesInput,
  SaveKitchenEquipmentInput,
  SavePantryItemsInput,
  CuisineKey,
  CuisinePreferenceKey,
  MealStyleKey,
  DietaryRuleKey,
  AvoidIngredientKey,
  AllergenKey,
  KitchenEquipmentKey,
  PantryItemKey,
  CookTimePreferenceKey,
  CookingSkillKey,
} from '@/types/profile'
import {
  PORTION_SIZE_KEYS,
  SPICE_LEVEL_KEYS,
  SALTINESS_KEYS,
  CUISINE_PREFERENCE_KEYS,
  MEAL_STYLE_KEYS,
  DIETARY_RULE_KEYS,
  ALLERGEN_KEYS,
  COOK_TIME_PREFERENCE_KEYS,
  DEFAULT_COOK_TIME_PREFERENCE_KEY,
  COOKING_SKILL_KEYS,
  DEFAULT_COOKING_SKILL_KEY,
  KITCHEN_EQUIPMENT_KEYS,
  PANTRY_ITEM_KEYS,
} from '@/types/profile'

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Convert error to standard Error with full Supabase error details preserved
 */
function toServiceError(error: unknown, fallbackMessage: string): Error {
  const parts: string[] = []

  // Extract message, code, details, hint from error
  let message: string | null = null
  let code: string | null = null
  let details: string | null = null
  let hint: string | null = null

  if (error instanceof Error) {
    message = error.message || null
    // Try to extract Supabase-specific fields from Error instance
    const errRecord = error as unknown as Record<string, unknown>
    if (typeof errRecord.code === 'string') code = errRecord.code
    if (typeof errRecord.details === 'string') details = errRecord.details
    if (typeof errRecord.hint === 'string') hint = errRecord.hint
  } else if (typeof error === 'object' && error !== null) {
    const errRecord = error as Record<string, unknown>
    if (typeof errRecord.message === 'string') message = errRecord.message
    if (typeof errRecord.code === 'string') code = errRecord.code
    if (typeof errRecord.details === 'string') details = errRecord.details
    if (typeof errRecord.hint === 'string') hint = errRecord.hint
  } else if (typeof error === 'string') {
    message = error
  }

  // Build primary message
  const primaryMessage = message || fallbackMessage
  parts.push(primaryMessage)

  // Append code if present
  if (code) {
    parts.push(`[code: ${code}]`)
  }

  // Append details if present
  if (details) {
    parts.push(`[details: ${details}]`)
  }

  // Append hint if present
  if (hint) {
    parts.push(`[hint: ${hint}]`)
  }

  return new Error(parts.join(' '))
}

/**
 * Normalize array: dedupe and keep input order
 */
function normalizeUniqueArray<T extends string>(values: T[]): T[] {
  if (!Array.isArray(values)) {
    return []
  }
  return Array.from(new Set(values))
}

/**
 * Validate array values against allowed set
 * @throws Error if any value is not in allowedSet
 */
function validateKeyArray<T extends string>(
  values: T[],
  allowedSet: ReadonlySet<T>,
  fieldName: string
): T[] {
  const normalized = normalizeUniqueArray(values)
  for (const value of normalized) {
    if (!allowedSet.has(value)) {
      throw new Error(`Invalid value "${value}" for ${fieldName}`)
    }
  }
  return normalized
}

/**
 * Normalize cuisine preferences with no_preference mutual exclusion
 */
function normalizeCuisinePreferenceKey(value: CuisineKey): CuisinePreferenceKey | null {
  if (value === 'chinese' || value === 'chinese_home') {
    return 'chinese_home'
  }

  if (
    value === 'western'
    || value === 'italian'
    || value === 'mexican'
    || value === 'western_simple'
  ) {
    return 'western_simple'
  }

  if (
    value === 'shandong'
    || value === 'sichuan'
    || value === 'cantonese'
    || value === 'huaiyang'
  ) {
    return value
  }

  return null
}

function normalizeCuisinePreferences(values: CuisineKey[]): CuisinePreferenceKey[] {
  const normalized = normalizeUniqueArray(values)
  const mapped = normalized
    .map(normalizeCuisinePreferenceKey)
    .filter((value): value is CuisinePreferenceKey => value !== null)
  const deduped = validateKeyArray(mapped, new Set(CUISINE_PREFERENCE_KEYS), 'cuisinePreferences')
  const traditionalCount = deduped.filter((value) => (
    value === 'shandong'
    || value === 'sichuan'
    || value === 'cantonese'
    || value === 'huaiyang'
  )).length

  if (traditionalCount > 2) {
    throw new Error('cuisinePreferences can include at most 2 traditional Chinese cuisines')
  }

  return deduped
}

function normalizeDietaryRules(values: DietaryRuleKey[]): DietaryRuleKey[] {
  const normalized = validateKeyArray(values, new Set(DIETARY_RULE_KEYS), 'dietaryRules')

  if (normalized.length === 0 || normalized.includes('none')) {
    return ['none']
  }

  return normalized
}

function normalizeAvoidIngredientKeys(values: AvoidIngredientKey[]): AvoidIngredientKey[] {
  const normalized = normalizeUniqueArray(values)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  for (const value of normalized) {
    if (!/^[a-z][a-z0-9_]*$/.test(value)) {
      throw new Error(`Invalid value "${value}" for avoidIngredientKeys`)
    }
  }

  return normalized
}

/**
 * Map database row (snake_case) to Profile (camelCase)
 */
function mapProfileRow(row: {
  id: string
  display_name: string | null
  avatar_url: string | null
  onboarding_status: string
  onboarding_completed_at: string | null
  is_anonymous_snapshot: boolean
  created_at: string
  updated_at: string
}): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    onboardingStatus: row.onboarding_status as Profile['onboardingStatus'],
    onboardingCompletedAt: row.onboarding_completed_at ? new Date(row.onboarding_completed_at) : null,
    isAnonymousSnapshot: row.is_anonymous_snapshot,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Map database row to UserPreferences
 */
function mapUserPreferencesRow(row: {
  id: string
  user_id: string
  portion_size: string | null
  spice_level: string | null
  saltiness: string | null
  cuisine_preferences: string[]
  meal_style_preferences: string[]
  diet_tags: string[]
  disliked_ingredient_keys: string[]
  allergen_keys: string[]
  cook_time_preference_key?: string | null
  cooking_skill?: string | null
  created_at: string
  updated_at: string
}): UserPreferences {
  const dietaryRules = row.diet_tags as DietaryRuleKey[]
  const avoidIngredientKeys = row.disliked_ingredient_keys as AvoidIngredientKey[]

  return {
    id: row.id,
    userId: row.user_id,
    portionSize: row.portion_size as UserPreferences['portionSize'],
    spiceLevel: row.spice_level as UserPreferences['spiceLevel'],
    saltiness: row.saltiness as UserPreferences['saltiness'],
    cuisinePreferences: row.cuisine_preferences as CuisinePreferenceKey[],
    mealStylePreferences: row.meal_style_preferences as MealStyleKey[],
    dietaryRules,
    avoidIngredientKeys,
    allergenKeys: row.allergen_keys as AllergenKey[],
    cookTimePreferenceKey: (row.cook_time_preference_key ?? DEFAULT_COOK_TIME_PREFERENCE_KEY) as CookTimePreferenceKey,
    cookingSkill: (row.cooking_skill ?? DEFAULT_COOKING_SKILL_KEY) as CookingSkillKey,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    dietTags: dietaryRules,
    dislikedIngredientKeys: avoidIngredientKeys,
  }
}

/**
 * Map database row to KitchenEquipmentItem
 */
function mapKitchenEquipmentRow(row: {
  id: string
  user_id: string
  equipment_key: string
  created_at: string
  updated_at: string
}): KitchenEquipmentItem {
  return {
    id: row.id,
    userId: row.user_id,
    equipmentKey: row.equipment_key as KitchenEquipmentKey,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Map database row to PantryItem
 */
function mapPantryItemRow(row: {
  id: string
  user_id: string
  pantry_item_key: string
  created_at: string
  updated_at: string
}): PantryItem {
  return {
    id: row.id,
    userId: row.user_id,
    pantryItemKey: row.pantry_item_key as PantryItemKey,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// ============================================================================
// Profile Methods
// ============================================================================

/**
 * Ensure profile exists, create if not
 */
export async function ensureProfile(): Promise<Profile> {
  const authUser = await ensureAuthUser()

  // Query existing profile
  const { data: profile, error: queryError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.userId)
    .maybeSingle()

  if (queryError) {
    throw toServiceError(queryError, 'Failed to query profile')
  }

  if (profile) {
    return mapProfileRow(profile)
  }

  // Profile not exists - create new
  try {
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.userId,
        display_name: null,
        avatar_url: null,
        onboarding_status: 'not_started',
        onboarding_completed_at: null,
        is_anonymous_snapshot: authUser.isAnonymous,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return mapProfileRow(inserted)
  } catch (error) {
    // Check for duplicate key error (23505) - race condition
    if ((error as { code?: string }).code === '23505') {
      const { data: retryProfile, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.userId)
        .maybeSingle()

      if (retryError) {
        throw toServiceError(retryError, 'Failed to query profile after duplicate key')
      }

      if (retryProfile) {
        return mapProfileRow(retryProfile)
      }

      throw new Error('Profile still not found after handling duplicate key error')
    }
    throw toServiceError(error, 'Failed to create profile')
  }
}

/**
 * Get current user profile, null if not exists
 * Does NOT trigger anonymous sign-in
 */
export async function getProfile(): Promise<Profile | null> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.userId)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to query profile')
  }

  if (!profile) {
    return null
  }

  return mapProfileRow(profile)
}

/**
 * Update current user profile
 */
export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const profile = await ensureProfile()

  // Build snake_case payload
  const payload: Record<string, unknown> = {}

  if (input.displayName !== undefined) {
    payload.display_name = input.displayName
  }
  if (input.avatarUrl !== undefined) {
    payload.avatar_url = input.avatarUrl
  }
  if (input.onboardingStatus !== undefined) {
    payload.onboarding_status = input.onboardingStatus
  }

  // Auto-set onboarding_completed_at when status becomes 'completed'
  if (input.onboardingStatus === 'completed' && input.onboardingCompletedAt === undefined) {
    payload.onboarding_completed_at = new Date().toISOString()
  } else if (input.onboardingCompletedAt !== undefined) {
    payload.onboarding_completed_at = input.onboardingCompletedAt?.toISOString() ?? null
  }

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profile.id)
    .select()
    .single()

  if (updateError) {
    throw toServiceError(updateError, 'Failed to update profile')
  }

  return mapProfileRow(updated)
}

// ============================================================================
// User Preferences Methods
// ============================================================================

/**
 * Get current user preferences, null if not exists
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  const authUser = await ensureAuthUser()

  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', authUser.userId)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to query user preferences')
  }

  if (!preferences) {
    return null
  }

  return mapUserPreferencesRow(preferences)
}

/**
 * Save user preferences (upsert on user_id)
 */
export async function saveUserPreferences(input: SaveUserPreferencesInput): Promise<UserPreferences> {
  const authUser = await ensureAuthUser()

  // Validate single-value fields
  if (input.portionSize !== undefined && input.portionSize !== null) {
    if (!PORTION_SIZE_KEYS.includes(input.portionSize)) {
      throw new Error(`Invalid portionSize: ${input.portionSize}`)
    }
  }
  if (input.spiceLevel !== undefined && input.spiceLevel !== null) {
    if (!SPICE_LEVEL_KEYS.includes(input.spiceLevel)) {
      throw new Error(`Invalid spiceLevel: ${input.spiceLevel}`)
    }
  }
  if (input.saltiness !== undefined && input.saltiness !== null) {
    if (!SALTINESS_KEYS.includes(input.saltiness)) {
      throw new Error(`Invalid saltiness: ${input.saltiness}`)
    }
  }
  if (input.cookTimePreferenceKey !== undefined && input.cookTimePreferenceKey !== null) {
    if (!COOK_TIME_PREFERENCE_KEYS.includes(input.cookTimePreferenceKey)) {
      throw new Error(`Invalid cookTimePreferenceKey: ${input.cookTimePreferenceKey}`)
    }
  }
  if (input.cookingSkill !== undefined && input.cookingSkill !== null) {
    if (!COOKING_SKILL_KEYS.includes(input.cookingSkill)) {
      throw new Error(`Invalid cookingSkill: ${input.cookingSkill}`)
    }
  }

  // Validate and normalize array fields
  const normalizedCuisinePreferences = normalizeCuisinePreferences(input.cuisinePreferences ?? [])
  const normalizedMealStylePreferences = validateKeyArray(
    input.mealStylePreferences ?? [],
    new Set(MEAL_STYLE_KEYS),
    'mealStylePreferences'
  )
  const normalizedDietaryRules = normalizeDietaryRules(
    input.dietaryRules ?? input.dietTags ?? []
  )
  const normalizedAvoidIngredientKeys = normalizeAvoidIngredientKeys(
    input.avoidIngredientKeys ?? input.dislikedIngredientKeys ?? []
  )
  const normalizedAllergenKeys = validateKeyArray(
    input.allergenKeys ?? [],
    new Set(ALLERGEN_KEYS),
    'allergenKeys'
  )
  const cookTimePreferenceKey = input.cookTimePreferenceKey ?? DEFAULT_COOK_TIME_PREFERENCE_KEY
  const cookingSkill = input.cookingSkill ?? DEFAULT_COOKING_SKILL_KEY

  // Build snake_case payload
  const payload = {
    user_id: authUser.userId,
    portion_size: input.portionSize ?? null,
    spice_level: input.spiceLevel ?? null,
    saltiness: input.saltiness ?? null,
    cuisine_preferences: normalizedCuisinePreferences,
    meal_style_preferences: normalizedMealStylePreferences,
    diet_tags: normalizedDietaryRules,
    disliked_ingredient_keys: normalizedAvoidIngredientKeys,
    allergen_keys: normalizedAllergenKeys,
    cook_time_preference_key: cookTimePreferenceKey,
    cooking_skill: cookingSkill,
  }

  const { data: updated, error: upsertError } = await supabase
    .from('user_preferences')
    .upsert(payload, {
      onConflict: 'user_id',
    })
    .select()
    .single()

  if (upsertError) {
    throw toServiceError(upsertError, 'Failed to save user preferences')
  }

  return mapUserPreferencesRow(updated)
}

// ============================================================================
// Kitchen Equipment Methods
// ============================================================================

/**
 * Get current user's kitchen equipment
 */
export async function getKitchenEquipment(): Promise<KitchenEquipmentItem[]> {
  const authUser = await ensureAuthUser()

  const { data: equipment, error } = await supabase
    .from('kitchen_equipment')
    .select('*')
    .eq('user_id', authUser.userId)
    .order('equipment_key', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query kitchen equipment')
  }

  return equipment.map(mapKitchenEquipmentRow)
}

/**
 * Save kitchen equipment (delete + insert full replacement)
 */
export async function saveKitchenEquipment(input: SaveKitchenEquipmentInput): Promise<KitchenEquipmentItem[]> {
  const authUser = await ensureAuthUser()

  // Validate and dedupe
  const normalizedKeys = validateKeyArray(
    input.equipmentKeys ?? [],
    new Set(KITCHEN_EQUIPMENT_KEYS),
    'equipmentKeys'
  )

  // Delete existing
  const { error: deleteError } = await supabase
    .from('kitchen_equipment')
    .delete()
    .eq('user_id', authUser.userId)

  if (deleteError) {
    throw toServiceError(deleteError, 'Failed to delete kitchen equipment')
  }

  // Return empty if no keys
  if (normalizedKeys.length === 0) {
    return []
  }

  // Insert new rows
  const rows = normalizedKeys.map((key) => ({
    user_id: authUser.userId,
    equipment_key: key,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('kitchen_equipment')
    .insert(rows)
    .select()
    .order('equipment_key', { ascending: true })

  if (insertError) {
    throw toServiceError(insertError, 'Failed to insert kitchen equipment')
  }

  return inserted.map(mapKitchenEquipmentRow)
}

// ============================================================================
// Pantry Items Methods
// ============================================================================

/**
 * Get current user's pantry items
 */
export async function getPantryItems(): Promise<PantryItem[]> {
  const authUser = await ensureAuthUser()

  const { data: items, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', authUser.userId)
    .order('pantry_item_key', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Failed to query pantry items')
  }

  return items.map(mapPantryItemRow)
}

/**
 * Save pantry items (delete + insert full replacement)
 */
export async function savePantryItems(input: SavePantryItemsInput): Promise<PantryItem[]> {
  const authUser = await ensureAuthUser()

  // Validate and dedupe
  const normalizedKeys = validateKeyArray(
    input.pantryItemKeys ?? [],
    new Set(PANTRY_ITEM_KEYS),
    'pantryItemKeys'
  )

  // Delete existing
  const { error: deleteError } = await supabase
    .from('pantry_items')
    .delete()
    .eq('user_id', authUser.userId)

  if (deleteError) {
    throw toServiceError(deleteError, 'Failed to delete pantry items')
  }

  // Return empty if no keys
  if (normalizedKeys.length === 0) {
    return []
  }

  // Insert new rows
  const rows = normalizedKeys.map((key) => ({
    user_id: authUser.userId,
    pantry_item_key: key,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('pantry_items')
    .insert(rows)
    .select()
    .order('pantry_item_key', { ascending: true })

  if (insertError) {
    throw toServiceError(insertError, 'Failed to insert pantry items')
  }

  return inserted.map(mapPantryItemRow)
}

// ============================================================================
// Onboarding Context Method
// ============================================================================

/**
 * Get complete onboarding context
 */
export async function getOnboardingContext(): Promise<OnboardingContext> {
  const profile = await ensureProfile()

  const [preferences, equipment, pantryItems] = await Promise.all([
    getUserPreferences(),
    getKitchenEquipment(),
    getPantryItems(),
  ])

  return {
    profile,
    preferences,
    equipmentKeys: equipment.map((item) => item.equipmentKey),
    pantryItemKeys: pantryItems.map((item) => item.pantryItemKey),
  }
}
