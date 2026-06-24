import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { getRecipeDetail } from '@/services/recipeService'
import { getTutorialOverview } from '@/services/tutorialService'
import { KITCHEN_EQUIPMENT_OPTIONS } from '@/types/profile'
import type {
  IngredientRoleKey,
  NecessityKey,
  RecipeDetail,
  RecipeDifficultyKey,
} from '@/types/recipe'

type LoadStatus = 'loading' | 'success' | 'error'

const difficultyLabels: Record<RecipeDifficultyKey, string> = {
  beginner: '新手',
  normal: '普通',
  confident: '熟练',
}

const costLevelLabels: Record<string, string> = {
  low: '低成本',
  low_to_medium: '中低成本',
  medium: '中等成本',
  high: '较高成本',
}

const necessityLabels: Record<NecessityKey, string> = {
  required: '必需',
  recommended: '推荐',
  optional: '可选',
}

const roleLabels: Record<IngredientRoleKey, string> = {
  main: '主料',
  side: '配菜',
  seasoning: '调味',
  garnish: '点缀',
}

const equipmentLabelByKey: Map<string, string> = new Map(
  KITCHEN_EQUIPMENT_OPTIONS.map((option) => [option.key, option.zhLabel])
)

function formatEquipmentName(key: string) {
  return equipmentLabelByKey.get(key) ?? '其他厨具'
}

function DetailChip({
  iconName,
  label,
}: {
  iconName: keyof typeof Ionicons.glyphMap
  label: string
}) {
  return (
    <View style={styles.detailChip}>
      <Ionicons name={iconName} size={15} color="#5c4738" />
      <Text style={styles.detailChipText}>{label}</Text>
    </View>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function RecipeHeroImage({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) {
    return (
      <View style={styles.heroIcon}>
        <Ionicons name="restaurant-outline" size={30} color="#fff8f1" />
      </View>
    )
  }

  return (
    <View style={styles.heroImageFrame}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.heroImage}
        contentFit="contain"
        transition={180}
      />
    </View>
  )
}

export default function RecipeDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ recipeKey?: string | string[] }>()
  const recipeKey = useMemo(() => {
    if (Array.isArray(params.recipeKey)) {
      return params.recipeKey[0]
    }
    return params.recipeKey
  }, [params.recipeKey])

  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<RecipeDetail | null>(null)
  const [tutorialStepCount, setTutorialStepCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadDetail = useCallback(async () => {
    if (!recipeKey) {
      setStatus('error')
      setErrorMessage('缺少 recipeKey，无法读取菜谱详情。')
      return
    }

    setStatus('loading')
    setErrorMessage(null)
    setTutorialStepCount(0)

    try {
      const result = await getRecipeDetail(recipeKey)
      setDetail(result)
      setStatus('success')

      try {
        const tutorial = await getTutorialOverview(recipeKey)
        setTutorialStepCount(tutorial?.stepCount ?? 0)
      } catch {
        // Recipe details remain useful while Tutorial Core is unavailable.
        setTutorialStepCount(0)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }
  }, [recipeKey])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="返回"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Ionicons name="chevron-back" size={22} color="#fff8f1" />
        </Pressable>
        <Text style={styles.topBarTitle}>菜谱详情</Text>
      </View>

      {status === 'loading' ? (
        <View style={styles.statePanel}>
          <ActivityIndicator color="#b76432" />
          <Text style={styles.stateTitle}>正在读取菜谱</Text>
          <Text style={styles.stateText}>正在加载食材、厨具和步骤。</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={[styles.statePanel, styles.errorPanel]}>
          <Ionicons name="warning-outline" size={24} color="#a33a2d" />
          <Text style={styles.stateTitle}>菜谱暂时不可用</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Pressable
            onPress={loadDetail}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'success' && detail ? (
        <>
          <View style={styles.hero}>
            <RecipeHeroImage imageUrl={detail.recipe.coverImageUrl ?? detail.recipe.cardImageUrl} />
            <Text style={styles.recipeName}>{detail.recipe.zhName}</Text>
            {detail.recipe.enName ? (
              <Text style={styles.recipeSubtitle}>{detail.recipe.enName}</Text>
            ) : null}
            {detail.recipe.description ? (
              <Text style={styles.recipeDescription}>{detail.recipe.description}</Text>
            ) : null}
            <View style={styles.detailChipWrap}>
              <DetailChip iconName="time-outline" label={`${detail.recipe.totalTimeMinutes} 分钟`} />
              <DetailChip
                iconName="flame-outline"
                label={difficultyLabels[detail.recipe.difficultyKey]}
              />
              <DetailChip iconName="people-outline" label={`${detail.recipe.servingCount} 人份`} />
              <DetailChip
                iconName="cash-outline"
                label={detail.recipe.estimatedCostLevel
                  ? costLevelLabels[detail.recipe.estimatedCostLevel]
                  : '成本未标注'}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tutorialStepCount > 0 ? '开始跟做' : '精细教程尚未开放'}
            disabled={tutorialStepCount === 0}
            onPress={() => router.push({
              pathname: '/recipe/[recipeKey]/cook',
              params: { recipeKey: detail.recipe.recipeKey },
            })}
            style={({ pressed }) => [
              styles.cookingEntry,
              tutorialStepCount === 0 && styles.cookingEntryDisabled,
              pressed && tutorialStepCount > 0 && styles.cookingEntryPressed,
            ]}
          >
            <View style={styles.cookingEntryIcon}>
              <Ionicons name="play-circle-outline" size={24} color="#fff8f1" />
            </View>
            <View style={styles.cookingEntryCopy}>
              <Text style={styles.cookingEntryTitle}>开始跟做</Text>
              <Text style={styles.cookingEntryText}>
                {tutorialStepCount > 0
                  ? `${tutorialStepCount} 步精细教程，进度会自动保存。`
                  : '这道菜的精细教程还在准备中，当前可先查看下方概括步骤。'}
              </Text>
            </View>
            <View style={tutorialStepCount > 0 ? styles.activePill : styles.disabledPill}>
              <Text style={tutorialStepCount > 0 ? styles.activePillText : styles.disabledPillText}>
                {tutorialStepCount > 0 ? '开始' : '未开放'}
              </Text>
              {tutorialStepCount > 0 ? (
                <Ionicons name="chevron-forward" size={14} color="#2f493e" />
              ) : null}
            </View>
          </Pressable>

          <Section title="食材">
            <View style={styles.rowList}>
              {detail.ingredients.map((item) => (
                <View key={item.id} style={styles.ingredientRow}>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle}>{item.ingredient.zhName}</Text>
                    <Text style={styles.rowSubtitle}>
                      {item.ingredient.enName} · {roleLabels[item.roleKey]} · {necessityLabels[item.necessityKey]}
                    </Text>
                    {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
                  </View>
                  <View style={styles.quantityPill}>
                    <Text style={styles.quantityText}>{item.quantityText ?? '适量'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Section title="厨具">
            <View style={styles.tagWrap}>
              {detail.tools.map((tool) => (
                <View key={tool.id} style={styles.toolTag}>
                  <Ionicons name="construct-outline" size={14} color="#305b49" />
                  <Text style={styles.toolTagText}>
                    {formatEquipmentName(tool.equipmentKey)} · {necessityLabels[tool.necessityKey]}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          {detail.substitutions.length > 0 ? (
            <Section title="可替代食材">
              <View style={styles.rowList}>
                {detail.substitutions.map((item) => (
                  <View key={item.id} style={styles.substitutionRow}>
                    <Text style={styles.substitutionTitle}>
                      {item.ingredient.zhName} → {item.substituteIngredient.zhName}
                    </Text>
                    {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section title="步骤">
            <View style={styles.stepList}>
              {detail.steps.map((step) => (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                  </View>
                  <View style={styles.stepBody}>
                    {step.title ? <Text style={styles.stepTitle}>{step.title}</Text> : null}
                    <Text style={styles.stepText}>{step.body}</Text>
                    <View style={styles.stepMetaWrap}>
                      {step.estimatedMinutes ? (
                        <Text style={styles.stepMeta}>{step.estimatedMinutes} 分钟</Text>
                      ) : null}
                      {step.equipmentKeys.map((key) => (
                        <Text key={key} style={styles.stepMeta}>{formatEquipmentName(key)}</Text>
                      ))}
                    </View>
                    {step.tips ? <Text style={styles.stepTip}>{step.tips}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </Section>
        </>
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
    gap: 16,
    padding: 18,
    paddingBottom: 34,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#2f493e',
    borderRadius: 8,
    justifyContent: 'center',
    width: 42,
  },
  backButtonPressed: {
    backgroundColor: '#20362d',
  },
  topBarTitle: {
    color: '#332d27',
    fontSize: 18,
    fontWeight: '800',
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
  hero: {
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  heroIcon: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#b76432',
    borderRadius: 8,
    justifyContent: 'center',
    width: 50,
  },
  heroImageFrame: {
    alignItems: 'center',
    alignSelf: 'center',
    aspectRatio: 1,
    backgroundColor: '#fff7ec',
    borderColor: '#ead8c5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    maxWidth: 320,
    overflow: 'hidden',
    width: '72%',
  },
  heroImage: {
    height: '94%',
    width: '94%',
  },
  recipeName: {
    color: '#2e2924',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 36,
  },
  recipeSubtitle: {
    color: '#786d63',
    fontSize: 15,
    lineHeight: 21,
  },
  recipeDescription: {
    color: '#5f554d',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 720,
  },
  detailChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  detailChip: {
    alignItems: 'center',
    backgroundColor: '#f4eadf',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  detailChipText: {
    color: '#5c4738',
    fontSize: 13,
    fontWeight: '700',
  },
  cookingEntry: {
    alignItems: 'center',
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  cookingEntryDisabled: {
    opacity: 0.74,
  },
  cookingEntryPressed: {
    backgroundColor: '#f5eadf',
  },
  cookingEntryIcon: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#2f493e',
    borderRadius: 8,
    justifyContent: 'center',
    width: 44,
  },
  cookingEntryCopy: {
    flex: 1,
    minWidth: 0,
  },
  cookingEntryTitle: {
    color: '#2f2a25',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  cookingEntryText: {
    color: '#6d6258',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  disabledPill: {
    backgroundColor: '#ede5dc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  disabledPillText: {
    color: '#81766d',
    fontSize: 12,
    fontWeight: '800',
  },
  activePill: {
    alignItems: 'center',
    backgroundColor: '#e4eee8',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  activePillText: {
    color: '#2f493e',
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#322d27',
    fontSize: 20,
    fontWeight: '800',
  },
  rowList: {
    gap: 8,
  },
  ingredientRow: {
    alignItems: 'flex-start',
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: '#2f2a25',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  rowSubtitle: {
    color: '#766a5f',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  rowNote: {
    color: '#6c6259',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  quantityPill: {
    backgroundColor: '#e8f0e8',
    borderRadius: 8,
    maxWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  quantityText: {
    color: '#2e624e',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolTag: {
    alignItems: 'center',
    backgroundColor: '#e8f0e8',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  toolTagText: {
    color: '#305b49',
    fontSize: 13,
    fontWeight: '700',
  },
  substitutionRow: {
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  substitutionTitle: {
    color: '#2f2a25',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  stepList: {
    gap: 10,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#293f37',
    borderRadius: 8,
    justifyContent: 'center',
    width: 34,
  },
  stepNumberText: {
    color: '#fff8f1',
    fontSize: 15,
    fontWeight: '800',
  },
  stepBody: {
    backgroundColor: '#fffaf3',
    borderColor: '#eadfd2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 0,
    padding: 12,
  },
  stepTitle: {
    color: '#2f2a25',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  stepText: {
    color: '#4d453e',
    fontSize: 14,
    lineHeight: 21,
  },
  stepMetaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stepMeta: {
    backgroundColor: '#f4eadf',
    borderRadius: 8,
    color: '#5c4738',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepTip: {
    color: '#8e522c',
    fontSize: 12,
    lineHeight: 18,
  },
})
