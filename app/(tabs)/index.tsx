import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { getIngredientDictionary } from '@/services/ingredientService'
import { getPersonalizedRecipeRecommendations } from '@/services/recommendationService'
import type {
  RecipeRecommendationResult,
  RecipeRecommendationRunResult,
} from '@/types/recommendation'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

const difficultyLabels: Record<string, string> = {
  beginner: '新手',
  normal: '普通',
  confident: '熟练',
}

const cuisineLabels: Record<string, string> = {
  chinese_home: '中式家常',
  western_simple: '西餐简餐',
  shandong: '鲁菜',
  sichuan: '川菜',
  cantonese: '粤菜',
  huaiyang: '淮扬菜',
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

function RecipeImagePlaceholder() {
  return (
    <View style={styles.imagePlaceholder}>
      <Ionicons name="restaurant-outline" size={24} color="#fff8f1" />
    </View>
  )
}

function RecipeCardImage({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) {
    return <RecipeImagePlaceholder />
  }

  return (
    <View style={styles.recipeImageFrame}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.recipeImage}
        contentFit="contain"
        transition={160}
      />
    </View>
  )
}

function RecipeCard({
  item,
  rank,
  ingredientNameByKey,
}: {
  item: RecipeRecommendationResult
  rank: number
  ingredientNameByKey: Map<string, string>
}) {
  const router = useRouter()
  const hasMissingCore = item.missingCoreIngredients.length > 0
  const imageUrl = item.recipe.cardImageUrl ?? item.recipe.coverImageUrl

  return (
    <Pressable
      onPress={() => router.push({
        pathname: '/recipe/[recipeKey]',
        params: { recipeKey: item.recipe.recipeKey },
      })}
      style={({ pressed }) => [
        styles.recipeCard,
        pressed && styles.recipeCardPressed,
      ]}
    >
      <View style={styles.cardImageRow}>
        <RecipeCardImage imageUrl={imageUrl} />
        <View style={styles.cardImageCopy}>
          <Text style={styles.cardImageTitle}>今晚候选</Text>
          <Text style={styles.cardImageText}>根据当前库存和口味排序。</Text>
        </View>
      </View>

      <View style={styles.cardTopRow}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <View style={styles.recipeTitleGroup}>
          <Text style={styles.recipeName}>{item.recipe.zhName}</Text>
          {item.recipe.enName ? (
            <Text style={styles.recipeSubtitle}>{item.recipe.enName}</Text>
          ) : null}
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="time-outline" size={14} color="#5d4736" />
          <Text style={styles.metaText}>{item.recipe.totalTimeMinutes} 分钟</Text>
        </View>
        <View style={styles.metaPill}>
          <Ionicons name="flame-outline" size={14} color="#5d4736" />
          <Text style={styles.metaText}>
            {difficultyLabels[item.recipe.difficultyKey] ?? item.recipe.difficultyKey}
          </Text>
        </View>
        <View style={styles.metaPill}>
          <Ionicons name="restaurant-outline" size={14} color="#5d4736" />
          <Text style={styles.metaText}>
            {cuisineLabels[item.recipe.cuisineKey] ?? item.recipe.cuisineKey}
          </Text>
        </View>
      </View>

      <View style={styles.matchPanel}>
        <View style={styles.matchLine}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#24745a" />
          <Text style={styles.matchText}>
            已有核心：{formatIngredientNames(item.matchedCoreIngredients, ingredientNameByKey, '暂无')}
          </Text>
        </View>
        <View style={styles.matchLine}>
          <Ionicons name="leaf-outline" size={16} color="#24745a" />
          <Text style={styles.matchText}>
            已有常备：{formatIngredientNames(item.matchedPantryItems, ingredientNameByKey, '暂无')}
          </Text>
        </View>
        {hasMissingCore ? (
          <View style={styles.warningLine}>
            <Ionicons name="alert-circle-outline" size={16} color="#a7562a" />
            <Text style={styles.warningText}>
              还差核心：{formatIngredientNames(item.missingCoreIngredients, ingredientNameByKey, '暂不确定')}
            </Text>
          </View>
        ) : null}
      </View>

      {item.reasons.length > 0 ? (
        <View style={styles.reasonWrap}>
          {item.reasons.slice(0, 3).map((reason) => (
            <Text key={reason} style={styles.reasonChip}>
              {formatRecommendationReason(reason, ingredientNameByKey)}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
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
  const hasLoadedOnceRef = useRef(false)

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
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>冰箱侦探</Text>
          <Text style={styles.title}>今晚可以做什么</Text>
          <Text style={styles.subtitle}>根据你的口味、常备调料和冰箱库存生成 Top 8 推荐。</Text>
        </View>
        <Pressable
          accessibilityLabel="刷新推荐"
          onPress={() => loadRecommendations('refresh')}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
          ]}
        >
          <Ionicons name="refresh-outline" size={22} color="#fff8f1" />
        </Pressable>
      </View>

      {fridgeUpdated === '1' ? (
        <View style={styles.updateNotice}>
          <Ionicons name="checkmark-circle" size={20} color="#34785c" />
          <Text style={styles.updateNoticeText}>冰箱已更新，推荐已根据最新库存刷新。</Text>
        </View>
      ) : null}

      {runResult ? (
        <View style={styles.summaryBand}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{runResult.totalCandidates}</Text>
            <Text style={styles.summaryLabel}>菜品库</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{runResult.eligibleCandidates}</Text>
            <Text style={styles.summaryLabel}>可推荐</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{runResult.filteredCandidates}</Text>
            <Text style={styles.summaryLabel}>已过滤</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="拍照更新冰箱"
        onPress={() => router.push('/fridge-scan')}
        style={({ pressed }) => [
          styles.fridgePrompt,
          pressed && styles.fridgePromptPressed,
        ]}
      >
        <View style={styles.fridgePromptIcon}>
          <Ionicons name="camera-outline" size={22} color="#fff8f1" />
        </View>
        <View style={styles.fridgePromptCopy}>
          <Text style={styles.fridgePromptTitle}>拍一下冰箱，推荐会更准</Text>
          <Text style={styles.fridgePromptText}>拍清主要食材，确认后会自动刷新推荐。</Text>
        </View>
        <View style={styles.fridgePromptAction}>
          <Text style={styles.fridgePromptActionText}>去更新</Text>
          <Ionicons name="chevron-forward" size={15} color="#8f4b25" />
        </View>
      </Pressable>

      {status === 'loading' ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#b76432" />
          <Text style={styles.stateTitle}>正在读取推荐</Text>
          <Text style={styles.stateText}>正在组合你的偏好、常备调料、冰箱库存和 200 道菜品。</Text>
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

      {recommendations.length > 0 ? (
        <View style={styles.recipeList}>
          {recommendations.map((item, index) => (
            <RecipeCard
              key={item.recipe.recipeKey}
              item={item}
              rank={index + 1}
              ingredientNameByKey={ingredientNameByKey}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f3ec',
  },
  content: {
    gap: 18,
    padding: 18,
    paddingBottom: 34,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  eyebrow: {
    color: '#9a5a30',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#2f2923',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 38,
    marginTop: 4,
  },
  subtitle: {
    color: '#6d6258',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 560,
  },
  refreshButton: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#b76432',
    borderRadius: 8,
    justifyContent: 'center',
    width: 46,
  },
  refreshButtonPressed: {
    backgroundColor: '#945128',
  },
  summaryBand: {
    alignItems: 'center',
    backgroundColor: '#2f493e',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: '#fff8f1',
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#d8eadf',
    fontSize: 12,
    marginTop: 2,
  },
  summaryDivider: {
    backgroundColor: '#6e8a7c',
    height: 32,
    width: 1,
  },
  statePanel: {
    alignItems: 'center',
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  errorPanel: {
    borderColor: '#dfb2a5',
    backgroundColor: '#fff6f2',
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
    borderRadius: 8,
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
  fridgePrompt: {
    alignItems: 'center',
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  fridgePromptPressed: {
    backgroundColor: '#f7ecdf',
  },
  fridgePromptIcon: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#b76432',
    borderRadius: 8,
    justifyContent: 'center',
    width: 42,
  },
  fridgePromptCopy: {
    flex: 1,
    minWidth: 0,
  },
  fridgePromptTitle: {
    color: '#2f2a25',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  fridgePromptText: {
    color: '#6d6258',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  fridgePromptAction: {
    alignItems: 'center',
    backgroundColor: '#f4e4d4',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  fridgePromptActionText: {
    color: '#8f4b25',
    fontSize: 12,
    fontWeight: '800',
  },
  updateNotice: {
    alignItems: 'center',
    backgroundColor: '#edf7f1',
    borderColor: '#c6dfd1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
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
  recipeList: {
    gap: 12,
  },
  recipeCard: {
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  cardImageRow: {
    alignItems: 'center',
    backgroundColor: '#f4eadf',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  imagePlaceholder: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#2f493e',
    borderRadius: 8,
    justifyContent: 'center',
    width: 54,
  },
  recipeImageFrame: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#fff7ec',
    borderColor: '#ead8c5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  recipeImage: {
    height: '94%',
    width: '94%',
  },
  cardImageCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardImageTitle: {
    color: '#3b332c',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardImageText: {
    color: '#786d63',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  recipeCardPressed: {
    backgroundColor: '#f3eadf',
  },
  cardTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  rankBadge: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#293f37',
    borderRadius: 8,
    justifyContent: 'center',
    width: 34,
  },
  rankText: {
    color: '#fff8f1',
    fontSize: 15,
    fontWeight: '800',
  },
  recipeTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  recipeName: {
    color: '#2e2924',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  recipeSubtitle: {
    color: '#786d63',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  scorePill: {
    alignItems: 'center',
    backgroundColor: '#f0dcc9',
    borderRadius: 8,
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  scoreText: {
    color: '#8d4a24',
    fontSize: 15,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    alignItems: 'center',
    backgroundColor: '#f4eadf',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 30,
    paddingHorizontal: 9,
  },
  metaText: {
    color: '#5d4736',
    fontSize: 12,
    fontWeight: '700',
  },
  matchPanel: {
    gap: 7,
  },
  matchLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  matchText: {
    color: '#3e4f45',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  warningLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  warningText: {
    color: '#8e522c',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  reasonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  reasonChip: {
    backgroundColor: '#e8f0e8',
    borderRadius: 8,
    color: '#2e624e',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
})
