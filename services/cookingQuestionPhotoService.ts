import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'

import { supabase } from '@/lib/supabase'
import { ensureAuthUser } from '@/services/authService'
import { askCookingHelper } from '@/services/cookingAiService'
import type {
  AskCookingHelperInput,
  AskCookingHelperResult,
} from '@/types/cookingAi'

export const COOKING_QUESTION_PHOTO_BUCKET = 'cooking-question-photos'

const SIGNED_URL_EXPIRES_IN_SECONDS = 10 * 60
const DEFAULT_PHOTO_QUESTION = '帮我看看这一步做得对不对，下一步该注意什么？'

export type CookingQuestionPhotoSource = 'camera' | 'library'

export type PickedCookingQuestionPhoto = ImagePicker.ImagePickerAsset

export type CookingQuestionPhoto = {
  id: string
  userId: string
  sessionId: string | null
  recipeId: string
  stepNumber: number
  storageBucket: typeof COOKING_QUESTION_PHOTO_BUCKET
  storagePath: string
  contentType: string | null
  fileSize: number | null
  width: number | null
  height: number | null
  createdAt: string
}

export type UploadCookingQuestionPhotoInput = {
  sessionId: string
  recipeId: string
  stepNumber: number
  photo: PickedCookingQuestionPhoto
}

export type UploadedCookingQuestionPhoto = {
  photo: CookingQuestionPhoto
  signedUrl: string
}

export type AskWithCookingQuestionPhotoInput = Omit<
  AskCookingHelperInput,
  'answerType' | 'questionImageUrl' | 'questionPhotoId' | 'questionText'
> & {
  photo: PickedCookingQuestionPhoto
  questionText?: string | null
}

export type AskWithCookingQuestionPhotoResult = {
  answer: AskCookingHelperResult
  upload: UploadedCookingQuestionPhoto
}

type CookingQuestionPhotoRow = {
  id: string
  user_id: string
  session_id: string | null
  recipe_id: string
  step_number: number
  storage_bucket: string
  storage_path: string
  content_type: string | null
  file_size: number | null
  width: number | null
  height: number | null
  created_at: string
}

function toServiceError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return new Error(error.message || fallbackMessage)
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    const message = typeof record.message === 'string' ? record.message : null
    const details = typeof record.details === 'string' ? record.details : null
    const hint = typeof record.hint === 'string' ? record.hint : null

    return new Error([message || fallbackMessage, details, hint].filter(Boolean).join(' '))
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  return new Error(fallbackMessage)
}

function mapCookingQuestionPhotoRow(row: CookingQuestionPhotoRow): CookingQuestionPhoto {
  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    recipeId: row.recipe_id,
    stepNumber: row.step_number,
    storageBucket: COOKING_QUESTION_PHOTO_BUCKET,
    storagePath: row.storage_path,
    contentType: row.content_type,
    fileSize: row.file_size,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  }
}

function normalizeContentType(photo: PickedCookingQuestionPhoto): string {
  if (photo.mimeType === 'image/png' || photo.mimeType === 'image/webp') {
    return photo.mimeType
  }

  return 'image/jpeg'
}

function extensionForContentType(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

function makeStoragePath(userId: string, sessionId: string, contentType: string): string {
  const extension = extensionForContentType(contentType)
  const suffix = Math.random().toString(36).slice(2, 10)

  return `${userId}/${sessionId}/${Date.now()}-${suffix}.${extension}`
}

async function readPhotoUploadBody(photo: PickedCookingQuestionPhoto): Promise<{
  body: ArrayBuffer | File
  fileSize: number | null
}> {
  const webFile = (photo as PickedCookingQuestionPhoto & { file?: File }).file

  if (Platform.OS === 'web' && webFile) {
    return {
      body: webFile,
      fileSize: webFile.size,
    }
  }

  try {
    const response = await fetch(photo.uri)
    if (!response.ok) {
      throw new Error(`Local image fetch failed with status ${response.status}.`)
    }

    const body = await response.arrayBuffer()
    return {
      body,
      fileSize: body.byteLength,
    }
  } catch (error) {
    throw toServiceError(error, 'Could not read the cooking question photo for upload.')
  }
}

async function ensureCookingSessionBelongsToUser(sessionId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('cooking_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Failed to verify cooking session ownership.')
  }

  if (!data) {
    throw new Error('Cooking session not found or not accessible.')
  }
}

export async function pickCookingQuestionPhoto(
  source: CookingQuestionPhotoSource = 'library'
): Promise<PickedCookingQuestionPhoto | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      throw new Error('需要相机权限，才能拍下当前步骤来问 AI。')
    }
  } else if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      throw new Error('需要照片权限，才能选择做饭照片来问 AI。')
    }
  }

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      })

  if (result.canceled || !result.assets[0]) return null
  return result.assets[0]
}

export async function createCookingQuestionPhotoSignedUrl(
  storagePath: string,
  expiresInSeconds = SIGNED_URL_EXPIRES_IN_SECONDS
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(COOKING_QUESTION_PHOTO_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error) {
    throw toServiceError(error, 'Photo uploaded, but a signed URL could not be created.')
  }

  if (!data?.signedUrl) {
    throw new Error('Photo uploaded, but Storage did not return a signed URL.')
  }

  return data.signedUrl
}

export async function uploadCookingQuestionPhoto(
  input: UploadCookingQuestionPhotoInput
): Promise<UploadedCookingQuestionPhoto> {
  const authUser = await ensureAuthUser()
  const sessionId = input.sessionId.trim()

  if (!sessionId) {
    throw new Error('A cooking session is required before uploading a question photo.')
  }

  await ensureCookingSessionBelongsToUser(sessionId, authUser.userId)

  const contentType = normalizeContentType(input.photo)
  const storagePath = makeStoragePath(authUser.userId, sessionId, contentType)
  const upload = await readPhotoUploadBody(input.photo)

  const { error: uploadError } = await supabase.storage
    .from(COOKING_QUESTION_PHOTO_BUCKET)
    .upload(storagePath, upload.body, {
      cacheControl: '3600',
      contentType,
      upsert: false,
    })

  if (uploadError) {
    throw toServiceError(uploadError, 'Could not upload the cooking question photo.')
  }

  const { data, error: insertError } = await supabase
    .from('cooking_question_photos')
    .insert({
      user_id: authUser.userId,
      session_id: sessionId,
      recipe_id: input.recipeId,
      step_number: input.stepNumber,
      storage_bucket: COOKING_QUESTION_PHOTO_BUCKET,
      storage_path: storagePath,
      content_type: contentType,
      file_size: upload.fileSize ?? input.photo.fileSize ?? null,
      width: input.photo.width ?? null,
      height: input.photo.height ?? null,
    })
    .select()
    .single()

  if (insertError) {
    throw toServiceError(insertError, 'Photo uploaded, but metadata could not be saved.')
  }

  const photo = mapCookingQuestionPhotoRow(data as CookingQuestionPhotoRow)

  return {
    photo,
    signedUrl: await createCookingQuestionPhotoSignedUrl(photo.storagePath),
  }
}

export async function askWithCookingQuestionPhoto(
  input: AskWithCookingQuestionPhotoInput
): Promise<AskWithCookingQuestionPhotoResult> {
  const { photo, ...helperInput } = input
  const upload = await uploadCookingQuestionPhoto({
    sessionId: input.sessionId ?? '',
    recipeId: input.recipeId,
    stepNumber: input.stepNumber,
    photo,
  })
  const answer = await askCookingHelper({
    ...helperInput,
    questionPhotoId: upload.photo.id,
    questionImageUrl: upload.signedUrl,
    answerType: 'photo',
    questionText: input.questionText || DEFAULT_PHOTO_QUESTION,
  })

  return { answer, upload }
}
