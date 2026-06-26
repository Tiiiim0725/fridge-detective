import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  type GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  type PanResponderGestureState,
  View,
} from 'react-native'

import {
  UI_CARD_RADIUS,
  UI_PAGE_MAX_WIDTH,
  UI_PAGE_SIDE_PADDING_COMPACT,
  UI_TOP_BUTTON_SIZE,
} from '@/components/ui/design-tokens'
import { FloatingTopButton } from '@/components/ui/floating-top-button'
import { getIngredientDictionary } from '@/services/ingredientService'
import { getPersonalizedRecipeRecommendations } from '@/services/recommendationService'
import type {
  RecipeRecommendationResult,
  RecipeRecommendationRunResult,
} from '@/types/recommendation'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'
type SwipeLikeEvent = {
  nativeEvent?: unknown
  pageY?: number
  clientY?: number
  touches?: ArrayLike<{ pageY?: number; clientY?: number }>
  changedTouches?: ArrayLike<{ pageY?: number; clientY?: number }>
}

type OrbitDish = {
  item: RecipeRecommendationResult
  slot: -1 | 0 | 1
}

const PHONE_CANVAS_WIDTH = UI_PAGE_MAX_WIDTH
const PHONE_CANVAS_MIN_HEIGHT = 900
const ORBIT_DRAG_DISTANCE = 210
const ORBIT_SIDE_X = 238
const ORBIT_SIDE_Y = 104
const ORBIT_SIDE_ROTATION = 15
const ORBIT_RELEASE_THRESHOLD = 0.34
const RECIPE_SHEET_TOUCH_RELEASE_DISTANCE = 30
const RECIPE_SHEET_OPEN_DURATION_MS = 560
const RECIPE_SHEET_OPEN_START_Y = PHONE_CANVAS_MIN_HEIGHT - 230
const recipeSheetWebTouchStyle = Platform.OS === 'web'
  ? ({
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    } as const)
  : null

const difficultyLabels: Record<string, string> = {
  beginner: '新手',
  normal: '普通',
  confident: '熟练',
  easy: '简单',
  medium: '适中',
  hard: '进阶',
}

const cuisineLabels: Record<string, string> = {
  chinese_home: '家常中餐',
  western_simple: '西式简餐',
  shandong: '鲁菜',
  sichuan: '川菜',
  cantonese: '粤菜',
  huaiyang: '淮扬菜',
  chinese: '中餐',
  western: '西餐',
  korean: '韩式',
  japanese: '日式',
  fusion: '融合',
}

function formatIngredientNames(keys: string[], ingredientNameByKey: Map<string, string>, emptyText: string) {
  if (keys.length === 0) {
    return emptyText
  }

  const labels = keys
    .map((key) => ingredientNameByKey.get(key))
    .filter((label): label is string => typeof label === 'string' && label.length > 0)

  return labels.length > 0 ? labels.join('、') : emptyText
}

function formatRecommendationReason(reason: string, ingredientNameByKey: Map<string, string>) {
  const firstSpaceIndex = reason.indexOf(' ')

  if (firstSpaceIndex < 0) {
    return reason
  }

  const prefix = reason.slice(0, firstSpaceIndex)
  const keyText = reason.slice(firstSpaceIndex + 1)
  const names = keyText
    .split(',')
    .map((key) => {
      const trimmedKey = key.trim()
      return ingredientNameByKey.get(trimmedKey) ?? cuisineLabels[trimmedKey]
    })
    .filter((label): label is string => typeof label === 'string' && label.length > 0)

  return names.length > 0 ? `${prefix} ${names.join('、')}` : prefix
}

function recipeImageUrl(item: RecipeRecommendationResult | null) {
  return item?.recipe.cardImageUrl ?? item?.recipe.coverImageUrl ?? null
}

function loopIndex(index: number, length: number) {
  if (length === 0) {
    return 0
  }

  return ((index % length) + length) % length
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function readSwipeEventY(event: unknown): number | null {
  const maybeEvent = event as SwipeLikeEvent | null
  const nativeEvent = (maybeEvent?.nativeEvent ?? maybeEvent) as SwipeLikeEvent | null
  const firstTouch = nativeEvent?.touches?.[0] ?? nativeEvent?.changedTouches?.[0]
  const value = firstTouch?.pageY
    ?? firstTouch?.clientY
    ?? nativeEvent?.pageY
    ?? nativeEvent?.clientY
    ?? maybeEvent?.pageY
    ?? maybeEvent?.clientY

  return typeof value === 'number' ? value : null
}

function getOrbitPlateTransform(slot: -1 | 0 | 1, dragProgress: number) {
  const position = slot + dragProgress
  const clampedPosition = clamp(position, -1.45, 1.45)
  const absPosition = Math.abs(clampedPosition)
  const sideWeight = Math.min(absPosition, 1)
  const edgeFade = Math.max(0, absPosition - 1)

  return {
    opacity: clamp(1 - edgeFade * 1.7, 0.1, 1),
    zIndex: Math.round(20 - absPosition * 8),
    transform: [
      { translateX: clampedPosition * ORBIT_SIDE_X },
      { translateY: sideWeight * ORBIT_SIDE_Y + edgeFade * 56 },
      { rotate: `${clampedPosition * ORBIT_SIDE_ROTATION}deg` },
      { scale: 1 - sideWeight * 0.36 - edgeFade * 0.1 },
    ],
  }
}

function DishImage({
  imageUrl,
  size,
  iconSize,
}: {
  imageUrl: string | null
  size: number
  iconSize: number
}) {
  if (!imageUrl) {
    return (
      <View style={[styles.dishPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="restaurant-outline" size={iconSize} color="#fff8f1" />
      </View>
    )
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: size, height: size }}
      contentFit="contain"
      pointerEvents="none"
      transition={180}
    />
  )
}

function CornerMetric({
  iconName,
  label,
  value,
}: {
  iconName: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) {
  return (
    <View style={styles.cornerMetric}>
      <View style={styles.cornerIcon}>
        <Ionicons name={iconName} size={16} color="#8c4b25" />
      </View>
      <View style={styles.cornerMetricCopy}>
        <Text style={styles.cornerMetricLabel}>{label}</Text>
        <Text style={styles.cornerMetricValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const { fridgeUpdated } = useLocalSearchParams<{ fridgeUpdated?: string }>()
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [runResult, setRunResult] = useState<RecipeRecommendationRunResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [ingredientNameByKey, setIngredientNameByKey] = useState<Map<string, string>>(new Map())
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragProgress, setDragProgress] = useState(0)
  const [openingRecipe, setOpeningRecipe] = useState<RecipeRecommendationResult | null>(null)
  const hasLoadedOnceRef = useRef(false)
  const recipeSheetTouchStartYRef = useRef<number | null>(null)
  const recipeOpenProgressRef = useRef(new Animated.Value(0))
  const isRecipeOpeningRef = useRef(false)

  const loadRecommendations = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') {
      setRefreshing(true)
    } else {
      setStatus('loading')
    }
    setErrorMessage(null)

    try {
      const [result, ingredients] = await Promise.all([
        getPersonalizedRecipeRecommendations(8),
        getIngredientDictionary(),
      ])
      setIngredientNameByKey(new Map(ingredients.map((ingredient) => [
        ingredient.ingredientKey,
        ingredient.zhName,
      ])))
      setRunResult(result)
      setActiveIndex(0)
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadRecommendations(hasLoadedOnceRef.current ? 'refresh' : 'initial')
      hasLoadedOnceRef.current = true
    }, [loadRecommendations])
  )

  const recommendations = runResult?.recommendations ?? []
  const currentIndex = loopIndex(activeIndex, recommendations.length)
  const currentItem = recommendations[currentIndex] ?? null
  const orbitDishes = useMemo<OrbitDish[]>(() => {
    if (recommendations.length === 0) {
      return []
    }

    const slots: Array<-1 | 0 | 1> = recommendations.length === 1 ? [0] : [-1, 0, 1]
    const seenRecipeKeys = new Set<string>()

    return slots
      .map((slot) => ({
        slot,
        item: recommendations[loopIndex(currentIndex + slot, recommendations.length)],
      }))
      .filter((dish) => {
        if (seenRecipeKeys.has(dish.item.recipe.recipeKey)) {
          return false
        }
        seenRecipeKeys.add(dish.item.recipe.recipeKey)
        return true
      })
  }, [currentIndex, recommendations])
  const currentReason = currentItem?.reasons[0]
    ? formatRecommendationReason(currentItem.reasons[0], ingredientNameByKey)
    : '根据你的冰箱和偏好排序'

  const goPrevious = useCallback(() => {
    setDragProgress(0)
    setActiveIndex((index) => loopIndex(index - 1, recommendations.length))
  }, [recommendations.length])

  const goNext = useCallback(() => {
    setDragProgress(0)
    setActiveIndex((index) => loopIndex(index + 1, recommendations.length))
  }, [recommendations.length])

  const openCurrentRecipe = useCallback(() => {
    if (!currentItem) {
      return
    }

    if (isRecipeOpeningRef.current) {
      return
    }

    isRecipeOpeningRef.current = true
    setOpeningRecipe(currentItem)
    recipeOpenProgressRef.current.setValue(0)

    Animated.timing(recipeOpenProgressRef.current, {
      toValue: 1,
      duration: RECIPE_SHEET_OPEN_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      router.push({
        pathname: '/recipe/[recipeKey]',
        params: { recipeKey: currentItem.recipe.recipeKey },
      })

      setTimeout(() => {
        setOpeningRecipe(null)
        recipeOpenProgressRef.current.setValue(0)
        isRecipeOpeningRef.current = false
      }, 180)
    })
  }, [currentItem, router])

  const handleRecipeSheetRelease = useCallback((gestureState: PanResponderGestureState) => {
    const shouldOpenRecipe = gestureState.dy < -42 || gestureState.vy < -0.5

    if (shouldOpenRecipe) {
      openCurrentRecipe()
    }
  }, [openCurrentRecipe])

  const handleRecipeSheetTouchStart = useCallback((event: GestureResponderEvent) => {
    recipeSheetTouchStartYRef.current = readSwipeEventY(event)
  }, [])

  const handleRecipeSheetSwipeEnd = useCallback((event: unknown) => {
    const startY = recipeSheetTouchStartYRef.current
    recipeSheetTouchStartYRef.current = null

    if (startY === null) {
      return
    }

    const endY = readSwipeEventY(event)

    if (endY === null) {
      return
    }

    const deltaY = endY - startY

    if (deltaY < -RECIPE_SHEET_TOUCH_RELEASE_DISTANCE) {
      openCurrentRecipe()
    }
  }, [openCurrentRecipe])

  const handleRecipeSheetTouchEnd = useCallback((event: GestureResponderEvent) => {
    handleRecipeSheetSwipeEnd(event)
  }, [handleRecipeSheetSwipeEnd])

  const recipeSheetWebSwipeHandlers = useMemo(() => {
    if (Platform.OS !== 'web') {
      return null
    }

    return {
      onPointerDown: (event: unknown) => {
        recipeSheetTouchStartYRef.current = readSwipeEventY(event)
      },
      onPointerCancel: () => {
        recipeSheetTouchStartYRef.current = null
      },
      onPointerUp: handleRecipeSheetSwipeEnd,
      onMouseDown: (event: unknown) => {
        recipeSheetTouchStartYRef.current = readSwipeEventY(event)
      },
      onMouseLeave: () => {
        recipeSheetTouchStartYRef.current = null
      },
      onMouseUp: handleRecipeSheetSwipeEnd,
    } as Record<string, unknown>
  }, [handleRecipeSheetSwipeEnd])

  const recipeSheetPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: (_event, gestureState) => (
      Math.abs(gestureState.dy) > 8
      && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.05
    ),
    onMoveShouldSetPanResponderCapture: (_event, gestureState) => (
      Math.abs(gestureState.dy) > 8
      && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.05
    ),
    onPanResponderRelease: (_event, gestureState) => {
      handleRecipeSheetRelease(gestureState)
    },
    onPanResponderTerminate: (_event, gestureState) => {
      handleRecipeSheetRelease(gestureState)
    },
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  }), [handleRecipeSheetRelease])

  const panResponder = useMemo(() => PanResponder.create({
    onPanResponderGrant: () => {
      setDragProgress(0)
    },
    onMoveShouldSetPanResponder: (_event, gestureState) => (
      recommendations.length > 1
      && Math.abs(gestureState.dx) > 18
      && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
    ),
    onPanResponderMove: (_event, gestureState) => {
      if (recommendations.length <= 1) {
        return
      }

      setDragProgress(clamp(gestureState.dx / ORBIT_DRAG_DISTANCE, -1, 1))
    },
    onPanResponderRelease: (_event, gestureState) => {
      const releaseProgress = clamp(gestureState.dx / ORBIT_DRAG_DISTANCE, -1, 1)
      const shouldGoNext = releaseProgress < -ORBIT_RELEASE_THRESHOLD || gestureState.vx < -0.55
      const shouldGoPrevious = releaseProgress > ORBIT_RELEASE_THRESHOLD || gestureState.vx > 0.55

      if (shouldGoNext) {
        goNext()
      } else if (shouldGoPrevious) {
        goPrevious()
      } else {
        setDragProgress(0)
      }
    },
    onPanResponderTerminate: () => {
      setDragProgress(0)
    },
  }), [goNext, goPrevious, recommendations.length])

  const openingRecipeSheetStyle = {
    borderTopLeftRadius: recipeOpenProgressRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [360, 0],
    }),
    borderTopRightRadius: recipeOpenProgressRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [360, 0],
    }),
    transform: [
      {
        translateY: recipeOpenProgressRef.current.interpolate({
          inputRange: [0, 1],
          outputRange: [RECIPE_SHEET_OPEN_START_Y, 0],
        }),
      },
    ],
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadRecommendations('refresh')}
          tintColor="#b76432"
        />
      }
    >
      <View style={styles.topBar}>
        <FloatingTopButton
          accessibilityLabel="刷新推荐"
          iconName="refresh-outline"
          onPress={() => loadRecommendations('refresh')}
        />
        <Text style={styles.topKicker}>冰箱侦探</Text>
        <View style={styles.topButtonSlot} />
      </View>

      {fridgeUpdated === '1' ? (
        <View style={styles.updateNotice}>
          <Ionicons name="checkmark-circle" size={19} color="#34785c" />
          <Text style={styles.updateNoticeText}>冰箱已更新，推荐已根据最新库存刷新。</Text>
        </View>
      ) : null}

      {status === 'loading' ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#b76432" />
          <Text style={styles.stateTitle}>正在准备今晚的候选</Text>
          <Text style={styles.stateText}>我在结合你的口味、常备调料和冰箱库存。</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={[styles.statePanel, styles.errorPanel]}>
          <Ionicons name="warning-outline" size={24} color="#a33a2d" />
          <Text style={styles.stateTitle}>推荐暂时不可用</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Pressable
            onPress={() => loadRecommendations()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'success' && recommendations.length === 0 ? (
        <View style={styles.statePanel}>
          <Ionicons name="basket-outline" size={24} color="#6c6259" />
          <Text style={styles.stateTitle}>暂时没有推荐</Text>
          <Text style={styles.stateText}>可以先补充冰箱食材或放宽偏好，再刷新推荐。</Text>
        </View>
      ) : null}

      {currentItem ? (
        <View style={styles.showcase} {...panResponder.panHandlers}>
          <View style={styles.cornerTopLeft}>
            <Text style={styles.kicker}>今晚可以做</Text>
            <Text style={styles.currentRecipeName} numberOfLines={2}>
              {currentItem.recipe.zhName}
            </Text>
          </View>

          <View style={styles.cornerTopRight}>
            <CornerMetric
              iconName="time-outline"
              label="预计"
              value={`${currentItem.recipe.totalTimeMinutes} 分钟`}
            />
          </View>

          <View style={styles.orbitStage}>
            <View style={styles.placemat} />
            {orbitDishes.map((dish) => {
              const isCenterSlot = dish.slot === 0
              const imageSize = isCenterSlot ? 286 : 274

              return (
                <Pressable
                  key={`${dish.slot}-${dish.item.recipe.recipeKey}`}
                  accessibilityLabel={isCenterSlot ? '打开当前菜谱详情' : '拖动或点击切换推荐'}
                  onPress={() => {
                    if (dish.slot === -1) {
                      goPrevious()
                      return
                    }

                    if (dish.slot === 1) {
                      goNext()
                      return
                    }

                    openCurrentRecipe()
                  }}
                  style={({ pressed }) => [
                    styles.orbitPlate,
                    getOrbitPlateTransform(dish.slot, dragProgress),
                    pressed && styles.orbitPlatePressed,
                  ]}
                >
                  <DishImage imageUrl={recipeImageUrl(dish.item)} size={imageSize} iconSize={isCenterSlot ? 42 : 34} />
                </Pressable>
              )
            })}

            <View style={styles.orbitInfoTray}>
              <Text style={styles.orbitInfoReason} numberOfLines={2}>{currentReason}</Text>
              <View style={styles.orbitInfoMetaRow}>
                <View style={styles.orbitInfoPill}>
                  <Ionicons name="checkmark-circle-outline" size={15} color="#8c4b25" />
                  <Text style={styles.orbitInfoLabel}>已有</Text>
                  <Text style={styles.orbitInfoValue} numberOfLines={1}>
                    {formatIngredientNames(
                      currentItem.matchedCoreIngredients.slice(0, 2),
                      ingredientNameByKey,
                      '待补齐'
                    )}
                  </Text>
                </View>
                <View style={styles.orbitInfoPill}>
                  <Ionicons name="sparkles-outline" size={15} color="#8c4b25" />
                  <Text style={styles.orbitInfoLabel}>匹配</Text>
                  <Text style={styles.orbitInfoValue}>{Math.round(currentItem.score)} 分</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.dots}>
            {recommendations.map((item, index) => (
              <Pressable
                key={item.recipe.recipeKey}
                accessibilityLabel={`切换到第 ${index + 1} 道推荐`}
                onPress={() => setActiveIndex(index)}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="查看当前菜谱完整做法"
            onPress={openCurrentRecipe}
            onTouchStart={handleRecipeSheetTouchStart}
            onTouchEnd={handleRecipeSheetTouchEnd}
            style={[styles.recipeSheetFrame, recipeSheetWebTouchStyle]}
            {...recipeSheetPanResponder.panHandlers}
            {...recipeSheetWebSwipeHandlers}
          >
            <View style={styles.recipeSheetCircle} />
            <View style={styles.recipeSheetContent}>
              <View style={styles.recipeSheetHandle} />
              <Text style={styles.recipeSheetKicker} selectable={false}>上滑查看完整做法</Text>
              <Text style={styles.recipeSheetTitle} numberOfLines={1} selectable={false}>
                {currentItem.recipe.zhName}
              </Text>
              <Text style={styles.recipeSheetBody} numberOfLines={2} selectable={false}>
                {currentItem.recipe.description ?? currentReason}
              </Text>
              <View style={styles.recipeSheetMetaRow}>
                <View style={styles.recipeSheetMetaPill}>
                  <Ionicons name="time-outline" size={14} color="#5f645f" />
                  <Text style={styles.recipeSheetMetaText} selectable={false}>{currentItem.recipe.totalTimeMinutes} 分钟</Text>
                </View>
                <View style={styles.recipeSheetMetaPill}>
                  <Ionicons name="restaurant-outline" size={14} color="#5f645f" />
                  <Text style={styles.recipeSheetMetaText} selectable={false}>
                    {difficultyLabels[currentItem.recipe.difficultyKey] ?? currentItem.recipe.difficultyKey}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      ) : null}

      {openingRecipe ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.openingRecipeOverlay, openingRecipeSheetStyle]}
        >
          <View style={styles.openingRecipeHandle} />
          <Text style={styles.openingRecipeKicker}>正在展开完整做法</Text>
          <Text style={styles.openingRecipeTitle} numberOfLines={2}>
            {openingRecipe.recipe.zhName}
          </Text>
          <Text style={styles.openingRecipeBody} numberOfLines={3}>
            {openingRecipe.recipe.description ?? currentReason}
          </Text>
          <View style={styles.openingRecipeMetaRow}>
            <View style={styles.recipeSheetMetaPill}>
              <Ionicons name="time-outline" size={14} color="#5f645f" />
              <Text style={styles.recipeSheetMetaText}>{openingRecipe.recipe.totalTimeMinutes} 分钟</Text>
            </View>
            <View style={styles.recipeSheetMetaPill}>
              <Ionicons name="restaurant-outline" size={14} color="#5f645f" />
              <Text style={styles.recipeSheetMetaText}>
                {difficultyLabels[openingRecipe.recipe.difficultyKey] ?? openingRecipe.recipe.difficultyKey}
              </Text>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e7ded3',
  },
  content: {
    alignSelf: 'center',
    backgroundColor: '#f6efe7',
    maxWidth: PHONE_CANVAS_WIDTH,
    minHeight: PHONE_CANVAS_MIN_HEIGHT,
    overflow: 'hidden',
    padding: UI_PAGE_SIDE_PADDING_COMPACT,
    paddingBottom: 122,
    position: 'relative',
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  topKicker: {
    color: '#8b4b25',
    fontSize: 13,
    fontWeight: '800',
  },
  topButtonSlot: {
    height: UI_TOP_BUTTON_SIZE,
    width: UI_TOP_BUTTON_SIZE,
  },
  updateNotice: {
    alignItems: 'center',
    backgroundColor: '#edf7f1',
    borderColor: '#c6dfd1',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  updateNoticeText: {
    color: '#285f49',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  statePanel: {
    alignItems: 'center',
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    gap: 8,
    marginTop: 34,
    padding: 20,
  },
  errorPanel: {
    backgroundColor: '#fff6f2',
    borderColor: '#dfb2a5',
  },
  stateTitle: {
    color: '#342e28',
    fontSize: 17,
    fontWeight: '800',
  },
  stateText: {
    color: '#6c6259',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#b76432',
    borderRadius: 22,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonPressed: {
    backgroundColor: '#945128',
  },
  retryButtonText: {
    color: '#fff8f1',
    fontSize: 14,
    fontWeight: '700',
  },
  showcase: {
    flex: 1,
    minHeight: 760,
    paddingTop: 24,
  },
  cornerTopLeft: {
    left: 12,
    maxWidth: '64%',
    position: 'absolute',
    top: 18,
    zIndex: 4,
  },
  kicker: {
    color: '#a85a2a',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  currentRecipeName: {
    color: '#27231f',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
  },
  cornerTopRight: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 12,
    top: 32,
    zIndex: 4,
  },
  cornerBottomLeft: {
    bottom: 176,
    left: 4,
    maxWidth: '48%',
    position: 'absolute',
    zIndex: 4,
  },
  cornerBottomRight: {
    alignItems: 'flex-end',
    bottom: 176,
    maxWidth: '48%',
    position: 'absolute',
    right: 0,
    zIndex: 4,
  },
  cornerMetric: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 240, 0.9)',
    borderColor: '#ecdcc9',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    shadowColor: '#6f4d35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  cornerIcon: {
    alignItems: 'center',
    backgroundColor: '#f2ddca',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  cornerMetricCopy: {
    maxWidth: 110,
    minWidth: 0,
  },
  cornerMetricLabel: {
    color: '#8b7a6c',
    fontSize: 10,
    fontWeight: '800',
  },
  cornerMetricValue: {
    color: '#2f2923',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },
  orbitStage: {
    alignItems: 'center',
    height: 486,
    justifyContent: 'flex-start',
    marginHorizontal: 0,
    marginTop: 126,
    overflow: 'hidden',
    position: 'relative',
  },
  placemat: {
    backgroundColor: '#e8d2b9',
    borderColor: '#f5e9db',
    borderRadius: 155,
    borderWidth: 10,
    height: 310,
    position: 'absolute',
    top: 146,
    width: 310,
  },
  orbitPlate: {
    alignItems: 'center',
    height: 306,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -153,
    position: 'absolute',
    top: 66,
    width: 306,
  },
  orbitPlatePressed: {
    opacity: 0.95,
  },
  dishPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#2f493e',
    justifyContent: 'center',
  },
  orbitInfoTray: {
    alignItems: 'center',
    bottom: 52,
    gap: 8,
    paddingHorizontal: 26,
    position: 'absolute',
    width: '100%',
  },
  orbitInfoLabel: {
    color: '#9a8778',
    fontSize: 11,
    fontWeight: '900',
  },
  orbitInfoMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  orbitInfoPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 240, 0.92)',
    borderColor: '#eadbc9',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    maxWidth: 166,
    minHeight: 42,
    minWidth: 116,
    paddingHorizontal: 13,
  },
  orbitInfoReason: {
    color: '#4e443b',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    maxWidth: 342,
    textAlign: 'center',
  },
  orbitInfoValue: {
    color: '#2f2923',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  detailPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  detailPill: {
    alignItems: 'center',
    backgroundColor: '#fff8f0',
    borderColor: '#eadbc9',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  detailPillText: {
    color: '#6b4b36',
    fontSize: 13,
    fontWeight: '800',
  },
  detailPillWarning: {
    alignItems: 'center',
    backgroundColor: '#fff1e7',
    borderColor: '#edc9ae',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  detailPillWarningText: {
    color: '#8d4b25',
    fontSize: 13,
    fontWeight: '800',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    backgroundColor: '#d3c4b5',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: '#2f493e',
    width: 22,
  },
  recipeSheetBody: {
    color: '#5c5f5a',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 5,
    maxWidth: 310,
    textAlign: 'center',
  },
  recipeSheetCircle: {
    backgroundColor: '#eceeeb',
    borderColor: '#f8f5ee',
    borderRadius: 360,
    borderWidth: 1,
    height: 720,
    left: '50%',
    marginLeft: -360,
    position: 'absolute',
    top: 0,
    width: 720,
  },
  recipeSheetContent: {
    alignItems: 'center',
    paddingHorizontal: 42,
    paddingTop: 54,
  },
  recipeSheetFrame: {
    alignSelf: 'center',
    height: 230,
    marginTop: -88,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  recipeSheetHandle: {
    backgroundColor: '#c7c9c4',
    borderRadius: 3,
    height: 5,
    marginBottom: 11,
    width: 48,
  },
  recipeSheetKicker: {
    color: '#7d8179',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 6,
  },
  recipeSheetMetaPill: {
    alignItems: 'center',
    backgroundColor: '#f7f8f5',
    borderColor: '#dfe2dc',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 30,
    paddingHorizontal: 10,
  },
  recipeSheetMetaRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  recipeSheetMetaText: {
    color: '#555b54',
    fontSize: 12,
    fontWeight: '900',
  },
  recipeSheetTitle: {
    color: '#252722',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    maxWidth: 330,
    textAlign: 'center',
  },
  openingRecipeOverlay: {
    alignItems: 'center',
    backgroundColor: '#eceeeb',
    borderColor: '#f8f5ee',
    borderWidth: 1,
    height: PHONE_CANVAS_MIN_HEIGHT,
    left: 0,
    paddingHorizontal: 42,
    paddingTop: 72,
    position: 'absolute',
    right: 4,
    top: 0,
    zIndex: 80,
  },
  openingRecipeHandle: {
    backgroundColor: '#c7c9c4',
    borderRadius: 3,
    height: 5,
    marginBottom: 18,
    width: 48,
  },
  openingRecipeKicker: {
    color: '#7d8179',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 10,
  },
  openingRecipeTitle: {
    color: '#252722',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
    maxWidth: 340,
    textAlign: 'center',
  },
  openingRecipeBody: {
    color: '#5c5f5a',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 330,
    textAlign: 'center',
  },
  openingRecipeMetaRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
  },
})
