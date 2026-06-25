import { Ionicons } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { getConversationalRecipeRecommendations } from '@/services/conversationalRecommendationService'
import { FloatingTopButton } from '@/components/ui/floating-top-button'
import { runFridgeRecognition } from '@/services/fridgeRecognitionService'
import {
  confirmFridgeScanItems,
  getCurrentFridgeItems,
} from '@/services/fridgeService'
import {
  addManualFridgeItem,
  confirmManualFridgeItems,
  confirmManualPantryItems,
  type ManualFridgeLocalCandidate,
  type ManualPantryLocalCandidate,
} from '@/services/manualFridgeService'
import { splitIngredientsByPantryTarget } from '@/services/pantryItemService'
import { addPantryItems } from '@/services/profileService'
import {
  FRIDGE_PHOTO_GUIDE_STEPS,
  type FridgeItem,
  type FridgeInventoryTimingMode,
  type FridgePhotoGuideStep,
  type FridgePhotoZoneKey,
  type FridgeQuantityKind,
  type FridgeScanItem,
} from '@/types/fridge'
import type { ConversationalRecipeRecommendationResult } from '@/types/conversationalRecommendation'
import type { PantryItemKey } from '@/types/profile'

type LocalPhotoStatus = 'local' | 'uploading' | 'recognizing' | 'done' | 'error'
type FlowStatus = 'idle' | 'recognizing' | 'ready' | 'confirming' | 'success' | 'error'
type PhotoSource = 'camera' | 'url'
type IoniconName = keyof typeof Ionicons.glyphMap
type ConversationalRecommendStatus = 'idle' | 'loading' | 'success' | 'fallback' | 'empty' | 'error'
type InventoryTimingModeByItemId = Record<string, FridgeInventoryTimingMode>

export type FridgeRecognitionFlowMode = 'formal' | 'dev'

export type FridgeRecognitionFlowProps = {
  mode: FridgeRecognitionFlowMode
  autoOpenCamera?: boolean
  autoOpenCameraKey?: string | null
  onBack?: () => void
  onContinue?: () => void
  showDebug?: boolean
}

type LocalPhoto = {
  id: string
  localUri: string
  remoteImageUrl?: string | null
  selected: boolean
  source: PhotoSource
  zoneKey: FridgePhotoZoneKey
  zoneTitle: string
  guidePrompt: string
  photoOrder: number
  status: LocalPhotoStatus
  storagePath?: string
  errorMessage?: string
  width?: number | null
  height?: number | null
  fileSize?: number | null
  contentType?: string | null
}

type PreviewIngredient = {
  id: string
  displayName: string
  quantityLabel: string
  icon: string
  source: 'preview' | 'scan' | 'manual'
}

const fallbackGuideStep: FridgePhotoGuideStep = {
  zoneKey: 'fridge_extra',
  title: '额外补拍',
  guidePrompt: '如果还有遗漏，请补拍其他区域',
  photoOrder: 6,
  isOptional: true,
}

const mockIngredientsForPreview: PreviewIngredient[] = [
  {
    id: 'preview-tomato',
    displayName: '传家宝番茄',
    quantityLabel: '示例识别',
    icon: '🍅',
    source: 'preview',
  },
  {
    id: 'preview-egg',
    displayName: '农场鸡蛋',
    quantityLabel: '半打',
    icon: '🥚',
    source: 'preview',
  },
  {
    id: 'preview-pepper',
    displayName: '甜椒',
    quantityLabel: '拍照后替换',
    icon: '🫑',
    source: 'preview',
  },
]

const scannerPreviewImageUrl =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85'

const bottomNavItems: Array<{
  key: string
  label: string
  icon: IoniconName
  active?: boolean
}> = [
  { key: 'pantry', label: '储藏室', icon: 'grid-outline', active: true },
  { key: 'chef', label: 'AI 厨师', icon: 'bar-chart-outline' },
  { key: 'recipes', label: '食谱书', icon: 'book-outline' },
  { key: 'summary', label: '总结', icon: 'heart-outline' },
]

function makePhotoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getGuideStep(index: number): FridgePhotoGuideStep {
  return FRIDGE_PHOTO_GUIDE_STEPS[Math.min(index, FRIDGE_PHOTO_GUIDE_STEPS.length - 1)]
    ?? fallbackGuideStep
}

function formatQuantity(item: FridgeScanItem): string {
  if (item.quantityKind === 'count' && typeof item.quantityCount === 'number') {
    return `${item.quantityCount} 个`
  }

  if (item.quantityKind === 'text' && item.quantityText) {
    return item.quantityText
  }

  return '数量待确认'
}

function formatManualQuantity(item: ManualFridgeLocalCandidate): string {
  if (item.quantityKind === 'count' && typeof item.quantityCount === 'number') {
    return `${item.quantityCount} 个`
  }

  if (item.quantityKind === 'text' && item.quantityText) {
    return item.quantityText
  }

  return '数量待确认'
}

function confidenceLabel(confidence: number | null): string {
  if (typeof confidence !== 'number') {
    return '待确认'
  }

  return `${Math.round(confidence * 100)}%`
}

function iconForStatus(status: LocalPhotoStatus): IoniconName {
  if (status === 'uploading') return 'cloud-upload-outline'
  if (status === 'recognizing') return 'sparkles-outline'
  if (status === 'done') return 'checkmark-circle-outline'
  if (status === 'error') return 'alert-circle-outline'
  return 'image-outline'
}

function labelForStatus(status: LocalPhotoStatus): string {
  if (status === 'uploading') return '上传中'
  if (status === 'recognizing') return '识别中'
  if (status === 'done') return '已识别'
  if (status === 'error') return '失败'
  return '待识别'
}

function iconForItemName(name: string): string {
  const normalized = name.toLowerCase()

  if (normalized.includes('番茄') || normalized.includes('西红柿') || normalized.includes('tomato')) return '🍅'
  if (normalized.includes('黄瓜') || normalized.includes('cucumber')) return '🥒'
  if (normalized.includes('欧芹') || normalized.includes('香菜') || normalized.includes('parsley') || normalized.includes('cilantro')) return '🌿'
  if (normalized.includes('卷心菜') || normalized.includes('圆白菜') || normalized.includes('包菜') || normalized.includes('cabbage')) return '🥬'
  if (normalized.includes('橙') || normalized.includes('橘') || normalized.includes('柑') || normalized.includes('orange') || normalized.includes('citrus')) return '🍊'
  if (normalized.includes('鸡蛋') || normalized.includes('蛋') || normalized.includes('egg')) return '🥚'
  if (normalized.includes('牛奶') || normalized.includes('奶') || normalized.includes('milk')) return '🥛'
  if (normalized.includes('牛肉') || normalized.includes('牛排') || normalized.includes('beef') || normalized.includes('steak')) return '🥩'
  if (normalized.includes('猪肉') || normalized.includes('pork')) return '🥓'
  if (normalized.includes('鸡肉') || normalized.includes('chicken')) return '🍗'
  if (normalized.includes('鱼') || normalized.includes('三文鱼') || normalized.includes('salmon') || normalized.includes('fish')) return '🐟'
  if (normalized.includes('虾') || normalized.includes('shrimp')) return '🦐'
  if (normalized.includes('蘑菇') || normalized.includes('菌') || normalized.includes('mushroom')) return '🍄'
  if (normalized.includes('胡萝卜') || normalized.includes('carrot')) return '🥕'
  if (normalized.includes('土豆') || normalized.includes('马铃薯') || normalized.includes('potato')) return '🥔'
  if (normalized.includes('洋葱') || normalized.includes('onion')) return '🧅'
  if (normalized.includes('辣椒') || normalized.includes('甜椒') || normalized.includes('椒') || normalized.includes('pepper')) return '🫑'
  if (normalized.includes('生菜') || normalized.includes('lettuce')) return '🥬'
  if (normalized.includes('苹果') || normalized.includes('apple')) return '🍎'
  if (normalized.includes('香蕉') || normalized.includes('banana')) return '🍌'
  if (normalized.includes('柠檬') || normalized.includes('lemon')) return '🍋'
  if (normalized.includes('米饭') || normalized.includes('饭') || normalized.includes('rice')) return '🍚'
  if (normalized.includes('豆腐') || normalized.includes('tofu')) return '◻️'

  return '🥡'
}

function inventoryTimingModeLabel(mode: FridgeInventoryTimingMode): string {
  return mode === 'newly_stored' ? '新放入' : '已在冰箱'
}

function inventoryTimingModeHint(mode: FridgeInventoryTimingMode): string {
  return mode === 'newly_stored' ? '从今天开始计算' : '不重置存放时间'
}

function dedupeScanItemsByIngredientKey(items: FridgeScanItem[]): FridgeScanItem[] {
  const itemsByIngredientKey = new Map<string, FridgeScanItem>()

  for (const item of items) {
    if (!item.ingredientKey) continue

    const existing = itemsByIngredientKey.get(item.ingredientKey)
    if (!existing) {
      itemsByIngredientKey.set(item.ingredientKey, item)
      continue
    }

    const existingScore = (existing.needsReview ? 0 : 2) + (existing.confidence ?? 0)
    const nextScore = (item.needsReview ? 0 : 2) + (item.confidence ?? 0)
    if (nextScore > existingScore) {
      itemsByIngredientKey.set(item.ingredientKey, item)
    }
  }

  return Array.from(itemsByIngredientKey.values())
}

export function FridgeRecognitionFlow({
  autoOpenCamera = false,
  autoOpenCameraKey = null,
  mode,
  onBack,
  onContinue,
  showDebug = false,
}: FridgeRecognitionFlowProps) {
  const router = useRouter()
  const lastAutoOpenCameraKeyRef = useRef<string | null>(null)
  const requestedAutoOpenCameraKey = autoOpenCameraKey ?? (autoOpenCamera ? 'default' : null)
  const [photos, setPhotos] = useState<LocalPhoto[]>([])
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle')
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [photoResults, setPhotoResults] = useState<unknown[]>([])
  const [recognizedItems, setRecognizedItems] = useState<FridgeScanItem[]>([])
  const [pantryScanItems, setPantryScanItems] = useState<FridgeScanItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [selectedPantryItemIds, setSelectedPantryItemIds] = useState<string[]>([])
  const [inventoryTimingModes, setInventoryTimingModes] = useState<InventoryTimingModeByItemId>({})
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null)
  const [confirmedPantryCount, setConfirmedPantryCount] = useState<number | null>(null)
  const [currentFridgeItems, setCurrentFridgeItems] = useState<FridgeItem[]>([])
  const [debugOpen, setDebugOpen] = useState(false)
  const [urlFallback, setUrlFallback] = useState('')
  const [localManualItems, setLocalManualItems] = useState<ManualFridgeLocalCandidate[]>([])
  const [localManualPantryItems, setLocalManualPantryItems] = useState<ManualPantryLocalCandidate[]>([])
  const [manualName, setManualName] = useState('')
  const [manualQuantityText, setManualQuantityText] = useState('')
  const [manualAdding, setManualAdding] = useState(false)
  const [recommendPrompt, setRecommendPrompt] = useState('')
  const [recommendStatus, setRecommendStatus] = useState<ConversationalRecommendStatus>('idle')
  const [recommendResult, setRecommendResult] = useState<ConversationalRecipeRecommendationResult | null>(null)
  const [recommendErrorMessage, setRecommendErrorMessage] = useState<string | null>(null)

  const selectedPhotos = useMemo(
    () => photos.filter((photo) => photo.selected),
    [photos]
  )
  const pantryScanItemIds = useMemo(
    () => new Set(pantryScanItems.map((item) => item.id)),
    [pantryScanItems]
  )
  const confirmableItems = useMemo(
    () => dedupeScanItemsByIngredientKey(
      recognizedItems.filter((item) => item.ingredientKey !== null && !pantryScanItemIds.has(item.id))
    ),
    [recognizedItems, pantryScanItemIds]
  )
  const dedupedPantryScanItems = useMemo(
    () => dedupeScanItemsByIngredientKey(pantryScanItems),
    [pantryScanItems]
  )
  const pantryCandidateItems = useMemo(
    () => [...dedupedPantryScanItems, ...localManualPantryItems],
    [dedupedPantryScanItems, localManualPantryItems]
  )
  const selectableItemIds = useMemo(
    () => [
      ...confirmableItems.map((item) => item.id),
      ...localManualItems.map((item) => item.id),
    ],
    [confirmableItems, localManualItems]
  )
  const selectablePantryItemIds = useMemo(
    () => pantryCandidateItems.map((item) => item.id),
    [pantryCandidateItems]
  )
  const primaryPreviewUri = selectedPhotos[0]?.localUri ?? photos[0]?.localUri ?? null
  const scannerImageUri = primaryPreviewUri ?? scannerPreviewImageUrl
  const selectedFridgeItemCount = selectedItemIds.filter((id) => selectableItemIds.includes(id)).length
  const selectedPantryItemCount = selectedPantryItemIds.filter((id) => selectablePantryItemIds.includes(id)).length
  const selectedItemCount = selectedFridgeItemCount + selectedPantryItemCount
  const confirmableItemCount = selectableItemIds.length
  const pantryCandidateCount = selectablePantryItemIds.length
  const totalConfirmableCount = confirmableItemCount + pantryCandidateCount
  const unmatchedItemCount = recognizedItems.filter((item) => item.ingredientKey === null).length
  const currentGuideStep = getGuideStep(photos.length)
  const isBusy = flowStatus === 'recognizing' || flowStatus === 'confirming' || manualAdding
  const scannerLabel = flowStatus === 'recognizing'
    ? 'AI 正在分析'
    : confirmableItemCount > 0
      ? `发现 ${confirmableItemCount} 个食材`
      : recognizedItems.length > 0
        ? '未匹配到标准食材'
        : '准备扫描'
  const resultItemsForPreview = confirmableItemCount > 0 || recognizedItems.length > 0
    ? [
      ...confirmableItems.map((item) => ({
        id: item.id,
        displayName: item.displayName,
        quantityLabel: formatQuantity(item),
        icon: iconForItemName(`${item.rawName} ${item.displayName}`),
        source: 'scan' as const,
      })),
      ...localManualItems.map((item) => ({
        id: item.id,
        displayName: item.displayName,
        quantityLabel: formatManualQuantity(item),
        icon: iconForItemName(`${item.rawName} ${item.displayName}`),
        source: 'manual' as const,
      })),
    ]
    : mode === 'dev'
      ? mockIngredientsForPreview
      : []

  async function takePhoto() {
    setPermissionMessage(null)
    setErrorMessage(null)

    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()

      if (!permission.granted) {
        setPermissionMessage('需要相机权限才能拍冰箱照片。你可以在系统设置里打开权限后再试。')
        return
      }
    }

    const result = Platform.OS === 'web'
      ? await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.82,
          allowsEditing: false,
          base64: false,
          exif: false,
        })
      : await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.82,
          allowsEditing: false,
          base64: false,
          exif: false,
          cameraType: ImagePicker.CameraType.back,
        })

    if (result.canceled || !result.assets?.[0]) {
      return
    }

    const asset = result.assets[0]
    const guideStep = getGuideStep(photos.length)

    setPhotos((current) => [
      ...current,
      {
        id: makePhotoId(),
        localUri: asset.uri,
        selected: true,
        source: 'camera',
        zoneKey: guideStep.zoneKey,
        zoneTitle: guideStep.title,
        guidePrompt: guideStep.guidePrompt,
        photoOrder: current.length + 1,
        status: 'local',
        width: asset.width || null,
        height: asset.height || null,
        fileSize: asset.fileSize ?? null,
        contentType: asset.mimeType ?? 'image/jpeg',
      },
    ])
  }

  useEffect(() => {
    if (
      !requestedAutoOpenCameraKey ||
      lastAutoOpenCameraKeyRef.current === requestedAutoOpenCameraKey
    ) {
      return
    }

    lastAutoOpenCameraKeyRef.current = requestedAutoOpenCameraKey
    void takePhoto()
  }, [requestedAutoOpenCameraKey])

  function addUrlFallbackPhoto() {
    const trimmedUrl = urlFallback.trim()

    if (!trimmedUrl) {
      setErrorMessage('请输入一张公网可访问的 jpg/png 图片 URL。')
      return
    }

    const guideStep = getGuideStep(photos.length)

    setPhotos((current) => [
      ...current,
      {
        id: makePhotoId(),
        localUri: trimmedUrl,
        remoteImageUrl: trimmedUrl,
        selected: true,
        source: 'url',
        zoneKey: guideStep.zoneKey,
        zoneTitle: `${guideStep.title} URL`,
        guidePrompt: guideStep.guidePrompt,
        photoOrder: current.length + 1,
        status: 'local',
        contentType: 'image/jpeg',
      },
    ])
    setUrlFallback('')
    setErrorMessage(null)
  }

  function removePhoto(photoId: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId))
  }

  function togglePhoto(photoId: string) {
    setPhotos((current) => current.map((photo) => (
      photo.id === photoId
        ? { ...photo, selected: !photo.selected }
        : photo
    )))
  }

  function toggleItem(itemId: string) {
    setSelectedItemIds((current) => (
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    ))
  }

  function togglePantryCandidate(itemId: string) {
    setSelectedPantryItemIds((current) => (
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    ))
  }

  function timingModeForItem(itemId: string): FridgeInventoryTimingMode {
    return inventoryTimingModes[itemId] ?? 'newly_stored'
  }

  function setInventoryTimingMode(itemId: string, mode: FridgeInventoryTimingMode) {
    setInventoryTimingModes((current) => ({
      ...current,
      [itemId]: mode,
    }))
  }

  function resetFlow() {
    setPhotos([])
    setFlowStatus('idle')
    setPermissionMessage(null)
    setErrorMessage(null)
    setScanId(null)
    setPhotoResults([])
    setRecognizedItems([])
    setPantryScanItems([])
    setLocalManualItems([])
    setLocalManualPantryItems([])
    setSelectedItemIds([])
    setSelectedPantryItemIds([])
    setInventoryTimingModes({})
    setConfirmedCount(null)
    setConfirmedPantryCount(null)
    setCurrentFridgeItems([])
    setManualName('')
    setManualQuantityText('')
  }

  async function startRecognition() {
    if (selectedPhotos.length === 0) {
      setErrorMessage('请先拍一张照片，或选中至少一张照片再开始识别。')
      return
    }

    setFlowStatus('recognizing')
    setErrorMessage(null)
    setScanId(null)
    setPhotoResults([])
    setRecognizedItems([])
    setPantryScanItems([])
    setLocalManualItems([])
    setLocalManualPantryItems([])
    setSelectedItemIds([])
    setSelectedPantryItemIds([])
    setInventoryTimingModes({})
    setConfirmedCount(null)
    setConfirmedPantryCount(null)
    setCurrentFridgeItems([])

    try {
      const result = await runFridgeRecognition({
        photos: selectedPhotos.map((photo, index) => ({
          clientPhotoId: photo.id,
          localUri: photo.localUri,
          remoteImageUrl: photo.remoteImageUrl,
          zoneKey: photo.zoneKey,
          guidePrompt: photo.guidePrompt,
          photoOrder: index + 1,
          contentType: photo.contentType,
          fileSize: photo.fileSize,
          width: photo.width,
          height: photo.height,
        })),
        onPhotoProgress: (progress) => {
          setPhotos((current) => current.map((photo) => (
            photo.id === progress.clientPhotoId
              ? {
                  ...photo,
                  status: progress.status,
                  storagePath: progress.storagePath ?? photo.storagePath,
                  errorMessage: progress.errorMessage,
                }
              : photo
          )))
        },
      })

      setScanId(result.scanId)
      setPhotoResults(result.photoResults)
      const splitItems = await splitIngredientsByPantryTarget(result.items)
      setRecognizedItems(result.items)
      setPantryScanItems(splitItems.pantryItems)
      setSelectedItemIds(
        dedupeScanItemsByIngredientKey(splitItems.fridgeItems)
          .map((item) => item.id)
      )
      setSelectedPantryItemIds([])
      setInventoryTimingModes({})
      setFlowStatus('ready')

      if (result.items.length === 0) {
        setErrorMessage('AI 没有发现可确认的食材。可以换一张更清楚的照片再试。')
      } else if (result.items.every((item) => item.ingredientKey === null)) {
        setErrorMessage('AI 识别到了一些内容，但没有匹配到标准食材字典，请换一张更清楚的照片再试。')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setFlowStatus('error')
    }
  }

  async function addManualCandidate() {
    const rawName = manualName.trim()
    const quantityText = manualQuantityText.trim()
    const quantityKind: FridgeQuantityKind = quantityText.length > 0 ? 'text' : 'unknown'

    if (!rawName) {
      setErrorMessage('请输入一个食材名称。')
      return
    }

    setManualAdding(true)
    setErrorMessage(null)

    try {
      const result = await addManualFridgeItem({
        scanId,
        rawName,
        quantityKind,
        quantityText: quantityText || null,
        quantityCount: null,
      })

      if (result.kind === 'unmatched') {
        setErrorMessage(result.message)
        return
      }

      if (result.kind === 'pantry_candidate') {
        setLocalManualPantryItems((current) => [...current, result.item])
        setSelectedPantryItemIds((current) => Array.from(new Set([...current, result.item.id])))
      } else if (result.kind === 'scan_item') {
        setRecognizedItems((current) => [...current, result.item])
        setSelectedItemIds((current) => Array.from(new Set([...current, result.item.id])))
      } else {
        setLocalManualItems((current) => [...current, result.item])
        setSelectedItemIds((current) => Array.from(new Set([...current, result.item.id])))
      }

      setManualName('')
      setManualQuantityText('')
      setFlowStatus((current) => (current === 'idle' || current === 'error' ? 'ready' : current))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setManualAdding(false)
    }
  }

  async function confirmSelectedItems() {
    const selectedScanItemIds = selectedItemIds.filter((id) => (
      confirmableItems.some((item) => item.id === id)
    ))
    const selectedLocalManualItems = localManualItems.filter((item) => selectedItemIds.includes(item.id))
    const selectedPantryScanItems = dedupedPantryScanItems.filter((item) => selectedPantryItemIds.includes(item.id))
    const selectedLocalManualPantryItems = localManualPantryItems.filter((item) => selectedPantryItemIds.includes(item.id))

    if (
      selectedScanItemIds.length === 0
      && selectedLocalManualItems.length === 0
      && selectedPantryScanItems.length === 0
      && selectedLocalManualPantryItems.length === 0
    ) {
      setErrorMessage('请至少保留一个食材，再更新冰箱。')
      return
    }

    setFlowStatus('confirming')
    setErrorMessage(null)

    try {
      const savedScanItems = scanId && selectedScanItemIds.length > 0
        ? await confirmFridgeScanItems({
            scanId,
            items: selectedScanItemIds.map((scanItemId) => ({
              scanItemId,
              inventoryTimingMode: timingModeForItem(scanItemId),
            })),
          })
        : []
      const savedManualItems = selectedLocalManualItems.length > 0
        ? await confirmManualFridgeItems(selectedLocalManualItems)
        : []
      if (selectedPantryScanItems.length > 0) {
        await addPantryItems({
            pantryItemKeys: selectedPantryScanItems
              .map((item) => item.ingredientKey)
              .filter((key): key is string => key !== null)
              .map((key) => key as PantryItemKey),
          })
      }
      if (selectedLocalManualPantryItems.length > 0) {
        await confirmManualPantryItems(selectedLocalManualPantryItems)
      }
      const savedItems = [...savedScanItems, ...savedManualItems]
      const activeItems = await getCurrentFridgeItems()
      const updatedPantryKeyCount = new Set([
        ...selectedPantryScanItems
          .map((item) => item.ingredientKey)
          .filter((key): key is string => key !== null),
        ...selectedLocalManualPantryItems.map((item) => item.ingredientKey),
      ]).size

      setConfirmedCount(savedItems.length)
      setConfirmedPantryCount(updatedPantryKeyCount)
      setCurrentFridgeItems(activeItems)
      setLocalManualItems((current) => current.filter((item) => !selectedItemIds.includes(item.id)))
      setLocalManualPantryItems((current) => current.filter((item) => !selectedPantryItemIds.includes(item.id)))
      setPantryScanItems((current) => current.filter((item) => !selectedPantryItemIds.includes(item.id)))
      setFlowStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setFlowStatus('ready')
    }
  }

  async function runConversationalRecommendations() {
    const message = recommendPrompt.trim()

    if (!message) {
      setRecommendStatus('empty')
      setRecommendResult(null)
      setRecommendErrorMessage('先告诉我你现在想吃什么，比如“想吃清淡一点，半小时内能做”。')
      return
    }

    setRecommendStatus('loading')
    setRecommendResult(null)
    setRecommendErrorMessage(null)

    try {
      const result = await getConversationalRecipeRecommendations({
        message,
        conversationId: scanId ? `fridge-scan-${scanId}` : 'fridge-scan',
        limit: 5,
      })

      setRecommendResult(result)
      setRecommendErrorMessage(result.warningMessage)

      if (result.recommendations.length === 0) {
        setRecommendStatus('empty')
      } else if (result.fallbackUsed) {
        setRecommendStatus('fallback')
      } else {
        setRecommendStatus('success')
      }
    } catch (error) {
      setRecommendStatus('error')
      setRecommendErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <FloatingTopButton
            accessibilityLabel={mode === 'formal' ? '返回' : '打开菜单'}
            disabled={!onBack}
            iconName={mode === 'formal' ? 'arrow-back-outline' : 'menu-outline'}
            onPress={onBack}
          />
          <Text style={styles.brand}>{mode === 'formal' ? '冰箱侦探' : '储藏室'}</Text>
          <View style={styles.topButtonSlot} />
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.title}>拍一下冰箱</Text>
          <Text style={styles.subtitle}>
            将摄像头对准你的食材。识别结果会先给你确认，再更新冰箱库存。
          </Text>
        </View>

        <View style={styles.scannerCard}>
          <View style={styles.scannerImageFrame}>
            <Image source={{ uri: scannerImageUri }} style={styles.scannerImage} />

            <View style={styles.scannerShade} />

            <View style={styles.analysisPill}>
              <View style={styles.liveDot} />
              <Text style={styles.analysisPillText}>{scannerLabel}</Text>
            </View>

            <View style={styles.guideBubble}>
              <Text style={styles.guideBubbleTitle}>{currentGuideStep.title}</Text>
              <Text style={styles.guideBubbleText}>{currentGuideStep.guidePrompt}</Text>
            </View>

            <View style={styles.cameraControls}>
              <Pressable
                disabled={isBusy || photos.length === 0}
                onPress={resetFlow}
                style={({ pressed }) => [
                  styles.roundToolButton,
                  pressed && !isBusy && styles.roundToolButtonPressed,
                  (isBusy || photos.length === 0) && styles.disabledButton,
                ]}
              >
                <Ionicons name="refresh-outline" size={24} color="#5b5149" />
              </Pressable>

              <Pressable
                disabled={isBusy}
                onPress={takePhoto}
                style={({ pressed }) => [
                  styles.cameraButton,
                  pressed && !isBusy && styles.cameraButtonPressed,
                  isBusy && styles.disabledButton,
                ]}
              >
                <Ionicons name="camera-outline" size={42} color="#ffffff" />
              </Pressable>

              <Pressable
                disabled={isBusy || selectedPhotos.length === 0}
                onPress={startRecognition}
                style={({ pressed }) => [
                  styles.roundToolButton,
                  styles.scanButton,
                  pressed && !isBusy && styles.roundToolButtonPressed,
                  (isBusy || selectedPhotos.length === 0) && styles.disabledButton,
                ]}
              >
                <Ionicons name="scan-outline" size={24} color="#5b5149" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.photoPanel}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>已拍照片</Text>
              <Text style={styles.sectionTitle}>拍摄清单</Text>
            </View>
            <Text style={styles.sectionMeta}>{selectedPhotos.length} 张参与识别</Text>
          </View>

          {photos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="images-outline" size={26} color="#8f8177" />
              <Text style={styles.emptyTitle}>先拍一张冰箱照片</Text>
              <Text style={styles.emptyText}>
                每张照片会变成缩略图，你可以删除或取消参与识别。
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              contentContainerStyle={styles.photoStrip}
              showsHorizontalScrollIndicator={false}
            >
              {photos.map((photo) => (
                <View
                  key={photo.id}
                  style={[
                    styles.photoCard,
                    photo.selected && styles.photoCardSelected,
                    photo.status === 'error' && styles.photoCardError,
                  ]}
                >
                  <Pressable onPress={() => togglePhoto(photo.id)} style={styles.photoPressable}>
                    <Image source={{ uri: photo.localUri }} style={styles.thumbnail} />
                    <View style={styles.photoStatusPill}>
                      <Ionicons
                        name={iconForStatus(photo.status)}
                        size={13}
                        color={photo.status === 'error' ? '#a33a2d' : '#4c4037'}
                      />
                      <Text style={styles.photoStatusText}>{labelForStatus(photo.status)}</Text>
                    </View>
                    {!photo.selected ? <View style={styles.photoDim} /> : null}
                  </Pressable>
                  <View style={styles.photoControls}>
                    <Text style={styles.photoZoneText} numberOfLines={1}>
                      {photo.zoneTitle}
                    </Text>
                    <Pressable onPress={() => removePhoto(photo.id)} style={styles.smallIconButton}>
                      <Ionicons name="close-outline" size={18} color="#9b3d33" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {showDebug ? (
            <View style={styles.urlFallbackPanel}>
              <View style={styles.urlFallbackCopy}>
                <Text style={styles.urlFallbackTitle}>公网图片测试</Text>
                <Text style={styles.urlFallbackText}>真机拍照不可用时，可以临时用图片 URL。</Text>
              </View>
              <TextInput
                value={urlFallback}
                onChangeText={setUrlFallback}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://example.com/fridge.jpg"
                placeholderTextColor="#9c9087"
                style={styles.urlInput}
              />
              <Pressable
                disabled={isBusy}
                onPress={addUrlFallbackPhoto}
                style={({ pressed }) => [
                  styles.urlButton,
                  pressed && !isBusy && styles.urlButtonPressed,
                  isBusy && styles.disabledButton,
                ]}
              >
                <Ionicons name="link-outline" size={17} color="#1f5945" />
                <Text style={styles.urlButtonText}>加入</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {permissionMessage ? (
          <View style={styles.noticePanel}>
            <Ionicons name="lock-closed-outline" size={18} color="#8a5b00" />
            <Text style={styles.noticeText}>{permissionMessage}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorPanel}>
            <Ionicons name="alert-circle-outline" size={18} color="#a33a2d" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.resultsPanel}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.resultsTitle}>
                {confirmableItems.length > 0
                  ? 'AI 发现了这些食材'
                  : localManualItems.length > 0
                    ? '待确认的食材'
                    : recognizedItems.length > 0
                      ? '未匹配到标准食材'
                      : '在储藏室中检测到'}
              </Text>
              <Text style={styles.resultsSubtitle}>
                {confirmableItems.length > 0
                  ? '默认全选；点卡片决定是否加入冰箱，保留后再选择新放入或已在冰箱。'
                  : localManualItems.length > 0
                    ? '手动添加的食材会在你确认后进入库存。'
                    : recognizedItems.length > 0
                      ? `${unmatchedItemCount} 个内容没有匹配到标准食材，不会进入正式库存。`
                      : '拍照识别后，这里会出现一份可以确认的食材清单。'}
              </Text>
            </View>
            <Text style={styles.itemCountPill}>
              {totalConfirmableCount > 0 || recognizedItems.length > 0
                ? `${selectedItemCount}/${totalConfirmableCount}`
                : '预览'}
            </Text>
          </View>

          <View style={styles.detectedGrid}>
            {resultItemsForPreview.map((item) => {
              const selected = item.source === 'preview' || selectedItemIds.includes(item.id)
              const scanItem = recognizedItems.find((candidate) => candidate.id === item.id)
              const localManualItem = localManualItems.find((candidate) => candidate.id === item.id)
              const timingMode = timingModeForItem(item.id)
              const canShowTimingControl = selected && (scanItem !== undefined || item.source === 'preview')
              const canShowCollapsedTiming = !selected && (scanItem !== undefined || item.source === 'preview')
              const canShowMeta = scanItem !== undefined || localManualItem !== undefined || item.source === 'preview'
              const weak = scanItem
                ? scanItem.needsReview || (scanItem.confidence ?? 0) < 0.7
                : localManualItem?.needsReview ?? false

              return (
                <Pressable
                  key={item.id}
                  disabled={totalConfirmableCount === 0}
                  onPress={() => toggleItem(item.id)}
                  style={({ pressed }) => [
                    styles.detectedCard,
                    selected && totalConfirmableCount > 0 && styles.detectedCardSelected,
                    !selected && totalConfirmableCount > 0 && styles.detectedCardExcluded,
                    weak && styles.detectedCardWeak,
                    pressed && styles.detectedCardPressed,
                  ]}
                >
                  <View style={styles.detectedCardTop}>
                    <View style={[
                      styles.detectedIcon,
                      selected && totalConfirmableCount > 0 && styles.detectedIconSelected,
                    ]}>
                      <Text style={styles.detectedIconText}>{item.icon}</Text>
                    </View>
                    {totalConfirmableCount > 0 ? (
                      <View style={[
                        styles.detectedSelectionBadge,
                        selected ? styles.detectedSelectionBadgeSelected : styles.detectedSelectionBadgeOff,
                      ]}>
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'remove-circle-outline'}
                          size={16}
                          color={selected ? '#1f5945' : '#9c9087'}
                        />
                        <Text style={[
                          styles.detectedSelectionText,
                          selected ? styles.detectedSelectionTextSelected : styles.detectedSelectionTextOff,
                        ]}>
                          {selected ? '已保留' : '不加入'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.detectedName} numberOfLines={2}>{item.displayName}</Text>
                  <Text style={styles.detectedQuantity} numberOfLines={1}>{item.quantityLabel}</Text>
                  {canShowMeta ? (
                    <>
                      {canShowTimingControl ? (
                        <View style={styles.inventoryTimingPanel}>
                          <Text style={styles.inventoryTimingPanelTitle}>食材放入时间</Text>
                          <View style={styles.inventoryTimingOptions}>
                            {(['newly_stored', 'already_in_fridge'] as FridgeInventoryTimingMode[]).map((modeOption) => {
                              const active = timingMode === modeOption
                              const isNew = modeOption === 'newly_stored'
                              return (
                                <Pressable
                                  key={modeOption}
                                  onPress={(event) => {
                                    event.stopPropagation()
                                    setInventoryTimingMode(item.id, modeOption)
                                  }}
                                  style={[
                                    styles.inventoryTimingOption,
                                    active && (isNew
                                      ? styles.inventoryTimingOptionNewActive
                                      : styles.inventoryTimingOptionExistingActive),
                                  ]}
                                >
                                  <View style={[
                                    styles.inventoryTimingDot,
                                    isNew ? styles.inventoryTimingDotNew : styles.inventoryTimingDotExisting,
                                  ]} />
                                  <View style={styles.inventoryTimingCopy}>
                                    <Text style={[
                                      styles.inventoryTimingLabel,
                                      active && (isNew
                                        ? styles.inventoryTimingLabelNew
                                        : styles.inventoryTimingLabelExisting),
                                    ]}>
                                      {inventoryTimingModeLabel(modeOption)}
                                    </Text>
                                    <Text style={styles.inventoryTimingHint}>
                                      {inventoryTimingModeHint(modeOption)}
                                    </Text>
                                  </View>
                                </Pressable>
                              )
                            })}
                          </View>
                        </View>
                      ) : canShowCollapsedTiming ? (
                        <View style={styles.inventoryTimingCollapsed}>
                          <Text style={styles.inventoryTimingCollapsedText}>选中后可设置新放入 / 已在冰箱</Text>
                        </View>
                      ) : null}

                      <View style={styles.detectedMetaRow}>
                        <View style={styles.confidenceGroup}>
                          <Text style={styles.confidenceLabel}>
                            {scanItem || item.source === 'preview' ? '识别可信度' : '来源'}
                          </Text>
                          <Text style={styles.confidenceText}>
                            {scanItem
                              ? confidenceLabel(scanItem.confidence)
                              : item.source === 'preview'
                                ? '示例'
                                : '手动添加'}
                          </Text>
                        </View>
                        {weak ? <Text style={styles.reviewBadge}>待确认</Text> : null}
                      </View>
                    </>
                  ) : null}
                </Pressable>
              )
            })}

            <View style={[styles.detectedCard, styles.manualCard]}>
              <View style={styles.manualIcon}>
                <Ionicons name="add-outline" size={28} color="#4f4741" />
              </View>
              <Text style={styles.manualTitle}>手动添加</Text>
              <TextInput
                value={manualName}
                onChangeText={setManualName}
                editable={!isBusy}
                placeholder="例如：土豆"
                placeholderTextColor="#9c9087"
                style={styles.manualInput}
              />
              <TextInput
                value={manualQuantityText}
                onChangeText={setManualQuantityText}
                editable={!isBusy}
                placeholder="数量可选"
                placeholderTextColor="#9c9087"
                style={styles.manualInput}
              />
              <Pressable
                disabled={isBusy}
                onPress={addManualCandidate}
                style={({ pressed }) => [
                  styles.manualAddButton,
                  pressed && !isBusy && styles.manualAddButtonPressed,
                  isBusy && styles.disabledButton,
                ]}
              >
                {manualAdding ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons name="add-outline" size={17} color="#ffffff" />
                )}
                <Text style={styles.manualAddButtonText}>加入候选</Text>
              </Pressable>
            </View>
          </View>

          {pantryCandidateItems.length > 0 ? (
            <View style={styles.pantryCandidatePanel}>
              <View style={styles.pantryCandidateHeader}>
                <View style={styles.pantryCandidateCopy}>
                  <Text style={styles.pantryCandidateTitle}>识别到调料 / 常备项</Text>
                  <Text style={styles.pantryCandidateText}>
                    这些更像常备调料，不会进入冰箱库存。选中后会加入你的常备项。
                  </Text>
                </View>
                <Text style={styles.itemCountPill}>
                  {selectedPantryItemCount}/{pantryCandidateCount}
                </Text>
              </View>

              <View style={styles.detectedGrid}>
                {pantryCandidateItems.map((item) => {
                  const selected = selectedPantryItemIds.includes(item.id)

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => togglePantryCandidate(item.id)}
                      style={({ pressed }) => [
                        styles.detectedCard,
                        styles.pantryCandidateCard,
                        selected && styles.detectedCardSelected,
                        pressed && styles.detectedCardPressed,
                      ]}
                    >
                      <View style={styles.detectedIcon}>
                        <Ionicons name="basket-outline" size={24} color="#ffffff" />
                      </View>
                      <Text style={styles.detectedName} numberOfLines={2}>{item.displayName}</Text>
                      <Text style={styles.detectedQuantity} numberOfLines={1}>常备 pantry</Text>
                      <View style={styles.detectedMetaRow}>
                        <Text style={styles.confidenceText}>不计入冰箱库存</Text>
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={18}
                          color={selected ? '#1f5945' : '#9c9087'}
                        />
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ) : null}

          <Pressable
            disabled={
              flowStatus === 'confirming'
              || totalConfirmableCount === 0
              || selectedItemCount === 0
            }
            onPress={confirmSelectedItems}
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && flowStatus !== 'confirming' && styles.confirmButtonPressed,
              (
                flowStatus === 'confirming'
                || totalConfirmableCount === 0
                || selectedItemCount === 0
              ) && styles.disabledButton,
            ]}
          >
            {flowStatus === 'confirming' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Ionicons name="sparkles-outline" size={20} color="#ffffff" />
            )}
            <Text style={styles.confirmButtonText}>更新冰箱并推荐菜谱</Text>
          </Pressable>
        </View>

        {flowStatus === 'success' ? (
          <View style={styles.successPanel}>
            <Ionicons name="checkmark-circle-outline" size={30} color="#1f5945" />
            <View style={styles.successCopy}>
              <Text style={styles.successTitle}>
                {(confirmedCount ?? 0) > 0
                  ? (confirmedPantryCount ?? 0) > 0
                    ? '厨房库存已更新'
                    : '冰箱已更新'
                  : '常备项已更新'}
              </Text>
              <Text style={styles.successText}>
                {(confirmedCount ?? 0) > 0
                  ? `${confirmedCount} 个食材已进入库存，推荐可以刷新了。`
                  : `${confirmedPantryCount ?? 0} 个常备项已更新，推荐可以刷新了。`}
              </Text>
              {(confirmedCount ?? 0) > 0 && currentFridgeItems.length > 0 ? (
                <Text style={styles.inventoryText} numberOfLines={2}>
                  当前库存：{currentFridgeItems.slice(0, 5).map((item) => item.displayName).join('、')}
                </Text>
              ) : null}
              {(confirmedCount ?? 0) > 0
              && typeof confirmedPantryCount === 'number'
              && confirmedPantryCount > 0 ? (
                <Text style={styles.inventoryText}>
                  另外有 {confirmedPantryCount} 个常备项已更新。
                </Text>
              ) : null}
              {mode === 'formal' && onContinue ? (
                <Pressable style={styles.continueButton} onPress={onContinue}>
                  <Text style={styles.continueButtonText}>查看最新推荐</Text>
                  <Ionicons name="arrow-forward-outline" size={18} color="#ffffff" />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.conversationPanel}>
          <View style={styles.conversationHeader}>
            <View style={styles.conversationIcon}>
              <Ionicons name="sparkles-outline" size={21} color="#fff8f1" />
            </View>
            <View style={styles.conversationCopy}>
              <Text style={styles.conversationTitle}>想吃什么</Text>
              <Text style={styles.conversationText}>
                说一句现在的胃口，我会结合你的冰箱、偏好和菜品库重新挑几道。
              </Text>
            </View>
          </View>

          <TextInput
            value={recommendPrompt}
            onChangeText={setRecommendPrompt}
            editable={recommendStatus !== 'loading'}
            multiline
            placeholder="比如：想吃清淡一点，半小时内能做，不要鸡蛋"
            placeholderTextColor="#9c9087"
            style={styles.conversationInput}
          />

          <Pressable
            disabled={recommendStatus === 'loading'}
            onPress={runConversationalRecommendations}
            style={({ pressed }) => [
              styles.conversationButton,
              pressed && recommendStatus !== 'loading' && styles.conversationButtonPressed,
              recommendStatus === 'loading' && styles.disabledButton,
            ]}
          >
            {recommendStatus === 'loading' ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons name="restaurant-outline" size={18} color="#ffffff" />
            )}
            <Text style={styles.conversationButtonText}>
              {recommendStatus === 'loading' ? '正在重新推荐' : '按这句话推荐'}
            </Text>
          </Pressable>

          {recommendErrorMessage ? (
            <View style={styles.conversationNotice}>
              <Ionicons
                name={recommendStatus === 'error' ? 'alert-circle-outline' : 'information-circle-outline'}
                size={17}
                color={recommendStatus === 'error' ? '#a33a2d' : '#8f4b25'}
              />
              <Text style={[
                styles.conversationNoticeText,
                recommendStatus === 'error' && styles.conversationNoticeErrorText,
              ]}>
                {recommendErrorMessage}
              </Text>
            </View>
          ) : null}

          {recommendResult?.intentSummary ? (
            <Text style={styles.intentSummary}>
              我理解的是：{recommendResult.intentSummary}
            </Text>
          ) : null}

          {recommendResult && recommendResult.recommendations.length > 0 ? (
            <View style={styles.conversationRecipeList}>
              {recommendResult.recommendations.map((item) => (
                <Pressable
                  key={item.recipe.recipeKey}
                  onPress={() => router.push(`/recipe/${item.recipe.recipeKey}` as Href)}
                  style={({ pressed }) => [
                    styles.conversationRecipeCard,
                    pressed && styles.conversationRecipeCardPressed,
                  ]}
                >
                  <View style={styles.conversationRecipeMain}>
                    <Text style={styles.conversationRecipeName}>{item.recipe.zhName}</Text>
                    <Text style={styles.conversationRecipeMeta}>
                      约 {item.recipe.totalTimeMinutes} 分钟 · {Math.round(item.score)} 分
                    </Text>
                    <Text style={styles.conversationRecipeReason} numberOfLines={2}>
                      {item.aiReason ?? item.reasons[0] ?? '根据你的冰箱和偏好推荐。'}
                    </Text>
                  </View>
                  <View style={styles.conversationRecipeArrow}>
                    <Ionicons name="chevron-forward" size={18} color="#8f4b25" />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}

          {recommendStatus === 'fallback' ? (
            <Text style={styles.fallbackText}>AI 暂时没有接管排序，已先用常规推荐结果兜底。</Text>
          ) : null}
        </View>

        {showDebug ? (
          <View style={styles.debugPanel}>
            <Pressable onPress={() => setDebugOpen((open) => !open)} style={styles.debugHeader}>
              <Text style={styles.debugTitle}>调试信息</Text>
              <Ionicons
                name={debugOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={18}
                color="#6b625b"
              />
            </Pressable>
            {debugOpen ? (
              <Text style={styles.debugText}>
                {JSON.stringify({
                  scanId,
                  flowStatus,
                  photoStatus: photos.map((photo) => ({
                    id: photo.id,
                    source: photo.source,
                    zoneKey: photo.zoneKey,
                    selected: photo.selected,
                    status: photo.status,
                    storagePath: photo.storagePath,
                    errorMessage: photo.errorMessage,
                  })),
                  photoResults,
                  selectedItemIds,
                  inventoryTimingModes,
                  localManualItems,
                  confirmedCount,
                  currentFridgeItems: currentFridgeItems.map((item) => ({
                    id: item.id,
                    ingredientKey: item.ingredientKey,
                    displayName: item.displayName,
                    quantityKind: item.quantityKind,
                  })),
                }, null, 2)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {mode === 'dev' ? (
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item) => (
            <View
              key={item.key}
              style={[
                styles.bottomNavItem,
                item.active && styles.bottomNavItemActive,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={24}
                color={item.active ? '#c2652a' : '#7d746c'}
              />
              <Text
                style={[
                  styles.bottomNavLabel,
                  item.active && styles.bottomNavLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {flowStatus === 'recognizing' ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingTitle}>正在识别你的冰箱...</Text>
            <Text style={styles.loadingText}>照片正在上传和分析，马上给你一份可确认清单。</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}

export default function DevFridgeRecognitionCheck() {
  return <FridgeRecognitionFlow mode="dev" showDebug />
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#faf5ee',
  },
  container: {
    gap: 18,
    paddingBottom: 118,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#e5ddd4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: 22,
    paddingTop: 28,
    backgroundColor: '#fff8f1',
  },
  topButtonSlot: {
    height: 48,
    width: 48,
  },
  brand: {
    color: '#b55f28',
    flex: 1,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
    paddingLeft: 10,
  },
  avatar: {
    alignItems: 'center',
    borderColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
    backgroundColor: '#17251f',
  },
  avatarPressed: {
    opacity: 0.74,
  },
  heroCopy: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingTop: 22,
  },
  title: {
    color: '#2d2a26',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    color: '#70665d',
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 390,
    textAlign: 'center',
  },
  scannerCard: {
    paddingHorizontal: 22,
  },
  scannerImageFrame: {
    borderColor: '#e1d7ce',
    borderRadius: 8,
    borderWidth: 1,
    height: 430,
    overflow: 'hidden',
    backgroundColor: '#ded7c8',
    shadowColor: '#2d2119',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 4,
  },
  scannerImage: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ded7c8',
  },
  scannerPlaceholder: {
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#d6d0bf',
  },
  placeholderShelf: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 138,
  },
  placeholderCrate: {
    borderColor: 'rgba(255,255,255,0.26)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  placeholderLeaf: {
    backgroundColor: '#6f8f52',
  },
  placeholderTomato: {
    backgroundColor: '#b54333',
  },
  placeholderCitrus: {
    backgroundColor: '#d89f43',
  },
  placeholderRice: {
    backgroundColor: '#b48f64',
  },
  placeholderGreen: {
    backgroundColor: '#527b53',
  },
  placeholderMilk: {
    backgroundColor: '#e7e4d8',
  },
  scannerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(35, 28, 22, 0.16)',
  },
  analysisPill: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 18,
    position: 'absolute',
    right: 18,
    top: 18,
    backgroundColor: 'rgba(255, 248, 241, 0.94)',
  },
  liveDot: {
    borderRadius: 6,
    height: 11,
    width: 11,
    backgroundColor: '#c2652a',
  },
  analysisPillText: {
    color: '#b55f28',
    fontSize: 15,
    fontWeight: '900',
  },
  guideBubble: {
    borderColor: 'rgba(194, 101, 42, 0.58)',
    borderRadius: 8,
    borderWidth: 1,
    left: 24,
    maxWidth: 240,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'absolute',
    top: 118,
    backgroundColor: 'rgba(255, 248, 241, 0.94)',
  },
  guideBubbleTitle: {
    color: '#3a302a',
    fontSize: 16,
    fontWeight: '900',
  },
  guideBubbleText: {
    color: '#685e55',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  cameraControls: {
    alignItems: 'center',
    bottom: 26,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 28,
    position: 'absolute',
    right: 28,
  },
  roundToolButton: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.88)',
    borderRadius: 999,
    borderWidth: 1,
    height: 70,
    justifyContent: 'center',
    width: 70,
    backgroundColor: 'rgba(250, 245, 238, 0.92)',
  },
  roundToolButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  scanButton: {
    backgroundColor: 'rgba(255, 251, 245, 0.94)',
  },
  cameraButton: {
    alignItems: 'center',
    borderColor: '#fff8f1',
    borderRadius: 999,
    borderWidth: 7,
    height: 112,
    justifyContent: 'center',
    width: 112,
    backgroundColor: '#c2652a',
  },
  cameraButtonPressed: {
    backgroundColor: '#a94f1e',
    transform: [{ scale: 0.98 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
  photoPanel: {
    gap: 14,
    marginHorizontal: 22,
    marginTop: 2,
    padding: 16,
    borderColor: '#e3dad0',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff9f3',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionKicker: {
    color: '#c2652a',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#332e29',
    fontSize: 22,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#746b63',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyPhotos: {
    alignItems: 'center',
    borderColor: '#ded5cc',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 7,
    padding: 22,
    backgroundColor: '#fffdf9',
  },
  emptyTitle: {
    color: '#3d352f',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: '#766d65',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  photoStrip: {
    gap: 12,
    paddingRight: 18,
  },
  photoCard: {
    borderColor: '#ded5cc',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    width: 142,
    backgroundColor: '#ffffff',
  },
  photoCardSelected: {
    borderColor: '#1f5945',
    borderWidth: 2,
  },
  photoCardError: {
    borderColor: '#c94b3e',
  },
  photoPressable: {
    height: 116,
  },
  thumbnail: {
    height: '100%',
    width: '100%',
    backgroundColor: '#e3ded8',
  },
  photoStatusPill: {
    alignItems: 'center',
    borderRadius: 999,
    bottom: 8,
    flexDirection: 'row',
    gap: 4,
    left: 8,
    minHeight: 25,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 8,
    backgroundColor: 'rgba(255, 248, 241, 0.92)',
  },
  photoStatusText: {
    color: '#4c4037',
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
  },
  photoDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(48, 40, 33, 0.48)',
  },
  photoControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    minHeight: 38,
    paddingHorizontal: 8,
  },
  photoZoneText: {
    color: '#4d453e',
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  smallIconButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  urlFallbackPanel: {
    alignItems: 'center',
    borderColor: '#e4dbd2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    padding: 12,
    backgroundColor: '#fffdf9',
  },
  urlFallbackCopy: {
    flexBasis: '100%',
    gap: 2,
  },
  urlFallbackTitle: {
    color: '#3a302a',
    fontSize: 14,
    fontWeight: '900',
  },
  urlFallbackText: {
    color: '#746b63',
    fontSize: 13,
  },
  urlInput: {
    borderColor: '#d5cbc2',
    borderRadius: 8,
    borderWidth: 1,
    color: '#302a25',
    flex: 1,
    fontSize: 14,
    minHeight: 42,
    minWidth: 200,
    paddingHorizontal: 11,
    backgroundColor: '#ffffff',
  },
  urlButton: {
    alignItems: 'center',
    borderColor: '#bdd4c8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 13,
    backgroundColor: '#eef7f1',
  },
  urlButtonPressed: {
    backgroundColor: '#dceee5',
  },
  urlButtonText: {
    color: '#1f5945',
    fontSize: 14,
    fontWeight: '900',
  },
  noticePanel: {
    alignItems: 'center',
    borderColor: '#edd49a',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 22,
    padding: 12,
    backgroundColor: '#fff8e4',
  },
  noticeText: {
    color: '#795813',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorPanel: {
    alignItems: 'center',
    borderColor: '#efc5bd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 22,
    padding: 12,
    backgroundColor: '#fff1ee',
  },
  errorText: {
    color: '#a33a2d',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  resultsPanel: {
    borderColor: '#e1d7ce',
    borderRadius: 8,
    borderWidth: 1,
    gap: 18,
    marginHorizontal: 22,
    padding: 20,
    backgroundColor: '#fff8f1',
    shadowColor: '#33251d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  resultsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  resultsTitle: {
    color: '#332e29',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  resultsSubtitle: {
    color: '#746b63',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  itemCountPill: {
    borderColor: '#ead5c4',
    borderRadius: 999,
    borderWidth: 1,
    color: '#b55f28',
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff1e6',
  },
  detectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detectedCard: {
    borderColor: '#ddd4cb',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minHeight: 196,
    padding: 14,
    width: '47%',
    backgroundColor: '#ffffff',
  },
  detectedCardSelected: {
    borderColor: '#1f5945',
    backgroundColor: '#f1f8f4',
  },
  detectedCardExcluded: {
    opacity: 0.62,
  },
  detectedCardWeak: {
    borderColor: '#e2b67a',
  },
  detectedCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  pantryCandidatePanel: {
    borderColor: '#ead2b8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 14,
    backgroundColor: '#fff4e8',
  },
  pantryCandidateHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  pantryCandidateCopy: {
    flex: 1,
    gap: 4,
  },
  pantryCandidateTitle: {
    color: '#3a3029',
    fontSize: 17,
    fontWeight: '900',
  },
  pantryCandidateText: {
    color: '#75685f',
    fontSize: 13,
    lineHeight: 19,
  },
  pantryCandidateCard: {
    backgroundColor: '#fffaf4',
  },
  detectedCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detectedIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    width: 54,
    backgroundColor: '#fffaf3',
    borderColor: '#ead9ca',
    borderWidth: 1,
  },
  detectedIconSelected: {
    backgroundColor: '#ecf8f1',
    borderColor: '#b7dec8',
  },
  detectedIconText: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  detectedSelectionBadge: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  detectedSelectionBadgeSelected: {
    backgroundColor: '#e6f4ec',
    borderColor: '#b8dcc8',
  },
  detectedSelectionBadgeOff: {
    backgroundColor: '#f5eee8',
    borderColor: '#e1d7ce',
  },
  detectedSelectionText: {
    fontSize: 11,
    fontWeight: '900',
  },
  detectedSelectionTextSelected: {
    color: '#1f5945',
  },
  detectedSelectionTextOff: {
    color: '#7d746c',
  },
  detectedName: {
    color: '#2f2a25',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  detectedQuantity: {
    color: '#746b63',
    fontSize: 15,
    fontWeight: '800',
  },
  inventoryTimingPanel: {
    borderColor: '#d8eadf',
    borderRadius: 8,
    borderWidth: 1,
    gap: 7,
    marginTop: 2,
    padding: 8,
    backgroundColor: 'rgba(247, 252, 249, 0.92)',
  },
  inventoryTimingPanelTitle: {
    color: '#4d6257',
    fontSize: 11,
    fontWeight: '900',
  },
  inventoryTimingOptions: {
    gap: 7,
  },
  inventoryTimingOption: {
    alignItems: 'center',
    borderColor: '#e6ded5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 2,
    minHeight: 42,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
  },
  inventoryTimingOptionNewActive: {
    backgroundColor: 'rgba(231, 244, 236, 0.9)',
    borderColor: '#79c79c',
  },
  inventoryTimingOptionExistingActive: {
    backgroundColor: 'rgba(255, 239, 236, 0.9)',
    borderColor: '#df8d81',
  },
  inventoryTimingCollapsed: {
    borderColor: '#e4dad1',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 9,
    paddingVertical: 9,
    backgroundColor: '#f9f3ed',
  },
  inventoryTimingCollapsedText: {
    color: '#82776f',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  inventoryTimingDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  inventoryTimingDotNew: { backgroundColor: '#2f8c5c' },
  inventoryTimingDotExisting: { backgroundColor: '#c24f3f' },
  inventoryTimingCopy: { flex: 1, minWidth: 0 },
  inventoryTimingLabel: { color: '#4f4741', fontSize: 13, fontWeight: '900' },
  inventoryTimingLabelNew: { color: '#225f40' },
  inventoryTimingLabelExisting: { color: '#8d3e35' },
  inventoryTimingHint: { color: '#746b63', fontSize: 11, fontWeight: '800', marginTop: 1 },
  detectedMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 'auto',
  },
  confidenceGroup: {
    alignItems: 'center',
    backgroundColor: '#fffaf4',
    borderColor: '#e8ded4',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  confidenceLabel: {
    color: '#9b6a46',
    fontSize: 10,
    fontWeight: '900',
  },
  confidenceText: {
    color: '#746b63',
    fontSize: 13,
    fontWeight: '900',
  },
  reviewBadge: {
    borderRadius: 999,
    color: '#7b5218',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: '#fff0ce',
  },
  manualCard: {
    alignItems: 'center',
    borderStyle: 'dashed',
    justifyContent: 'center',
    backgroundColor: '#fffaf5',
  },
  manualIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    width: 54,
    backgroundColor: '#f4eee8',
  },
  manualTitle: {
    color: '#332e29',
    fontSize: 18,
    fontWeight: '900',
  },
  manualText: {
    color: '#81776e',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  manualInput: {
    borderColor: '#ded5cc',
    borderRadius: 8,
    borderWidth: 1,
    color: '#302a25',
    fontSize: 13,
    minHeight: 38,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: '#ffffff',
  },
  manualAddButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: '#1f5945',
  },
  manualAddButtonPressed: {
    backgroundColor: '#184635',
    transform: [{ scale: 0.99 }],
  },
  manualAddButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  confirmButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 18,
    backgroundColor: '#c2652a',
    shadowColor: '#9d481d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 2,
  },
  confirmButtonPressed: {
    backgroundColor: '#a94f1e',
    transform: [{ scale: 0.99 }],
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
  },
  successPanel: {
    alignItems: 'center',
    borderColor: '#bdd8c8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    marginHorizontal: 22,
    padding: 16,
    backgroundColor: '#edf8f1',
  },
  successCopy: {
    flex: 1,
    gap: 4,
  },
  successTitle: {
    color: '#1f5945',
    fontSize: 18,
    fontWeight: '900',
  },
  successText: {
    color: '#53675d',
    fontSize: 14,
    lineHeight: 20,
  },
  continueButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#c2652a',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 46,
    paddingHorizontal: 20,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  inventoryText: {
    color: '#3e5349',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  conversationPanel: {
    borderColor: '#e1d7ce',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    marginHorizontal: 22,
    padding: 18,
    backgroundColor: '#fffdf8',
    shadowColor: '#33251d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2,
  },
  conversationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  conversationIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
    backgroundColor: '#c2652a',
  },
  conversationCopy: {
    flex: 1,
    gap: 4,
  },
  conversationTitle: {
    color: '#332e29',
    fontSize: 21,
    fontWeight: '900',
  },
  conversationText: {
    color: '#746b63',
    fontSize: 14,
    lineHeight: 20,
  },
  conversationInput: {
    borderColor: '#ded5cc',
    borderRadius: 8,
    borderWidth: 1,
    color: '#302a25',
    fontSize: 15,
    lineHeight: 21,
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 11,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
  },
  conversationButton: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    backgroundColor: '#1f5945',
  },
  conversationButtonPressed: {
    backgroundColor: '#184635',
    transform: [{ scale: 0.99 }],
  },
  conversationButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  conversationNotice: {
    alignItems: 'center',
    borderColor: '#efd9c4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: '#fff5ea',
  },
  conversationNoticeText: {
    color: '#8f4b25',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  conversationNoticeErrorText: {
    color: '#a33a2d',
  },
  intentSummary: {
    color: '#4f4741',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  conversationRecipeList: {
    gap: 10,
  },
  conversationRecipeCard: {
    alignItems: 'center',
    borderColor: '#e5dbd0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
    backgroundColor: '#ffffff',
  },
  conversationRecipeCardPressed: {
    backgroundColor: '#fff6ed',
    transform: [{ scale: 0.99 }],
  },
  conversationRecipeMain: {
    flex: 1,
    gap: 4,
  },
  conversationRecipeName: {
    color: '#2f2a25',
    fontSize: 17,
    fontWeight: '900',
  },
  conversationRecipeMeta: {
    color: '#8b7b6c',
    fontSize: 12,
    fontWeight: '800',
  },
  conversationRecipeReason: {
    color: '#5f564f',
    fontSize: 13,
    lineHeight: 18,
  },
  conversationRecipeArrow: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
    backgroundColor: '#fff1e6',
  },
  fallbackText: {
    color: '#7a6658',
    fontSize: 12,
    lineHeight: 17,
  },
  debugPanel: {
    borderColor: '#e1d8cf',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 22,
    backgroundColor: '#fffdf9',
  },
  debugHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  debugTitle: {
    color: '#6b625b',
    fontSize: 13,
    fontWeight: '900',
  },
  debugText: {
    borderTopColor: '#eee7df',
    borderTopWidth: 1,
    color: '#314039',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    padding: 12,
  },
  bottomNav: {
    alignItems: 'center',
    borderTopColor: '#e4dcd3',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    minHeight: 92,
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
    backgroundColor: 'rgba(255, 250, 245, 0.98)',
  },
  bottomNavItem: {
    alignItems: 'center',
    borderRadius: 8,
    gap: 4,
    minHeight: 66,
    minWidth: 74,
    justifyContent: 'center',
  },
  bottomNavItemActive: {
    backgroundColor: '#fbecdf',
  },
  bottomNavLabel: {
    color: '#7d746c',
    fontSize: 13,
    fontWeight: '900',
  },
  bottomNavLabelActive: {
    color: '#c2652a',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(39, 31, 25, 0.58)',
  },
  loadingBox: {
    alignItems: 'center',
    borderRadius: 8,
    gap: 10,
    maxWidth: 320,
    padding: 24,
    backgroundColor: '#1f5945',
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
  },
  loadingText: {
    color: '#e8f5ee',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
})
