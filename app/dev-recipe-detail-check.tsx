import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'

type DifficultyKey = 'easy' | 'medium' | 'hard'
type NecessityKey = 'required' | 'recommended' | 'optional'
type IngredientRoleKey = 'main' | 'side' | 'seasoning' | 'garnish'

type RecipeDetail = {
  recipe: {
    id: string
    recipeKey: string
    zhName: string
    enName: string
    description: string
    cuisineKey: string
    difficultyKey: DifficultyKey
    totalTimeMinutes: number
    servingCount: number
    mealStyleKeys: string[]
    flavorProfileKeys: string[]
    matchPercent: number
  }
  ingredients: Array<{
    ingredientKey: string
    zhName: string
    roleKey: IngredientRoleKey
    necessityKey: NecessityKey
    isMinimumRequired: boolean
    quantityText: string
  }>
  tools: Array<{
    equipmentKey: string
    zhName: string
    necessityKey: NecessityKey
  }>
  steps: Array<{
    stepNumber: number
    title: string
    body: string
    estimatedMinutes: number
  }>
}

const mockRecipeDetail: RecipeDetail = {
  recipe: {
    id: 'demo-recipe-1',
    recipeKey: 'tomato_egg_stir_fry',
    zhName: '番茄炒蛋',
    enName: 'Tomato Egg Stir Fry',
    description: '酸甜开胃的快手家常菜，用冰箱里的番茄和鸡蛋就能完成。',
    cuisineKey: 'Chinese',
    difficultyKey: 'easy',
    totalTimeMinutes: 15,
    servingCount: 1,
    mealStyleKeys: ['quick_easy', 'budget'],
    flavorProfileKeys: ['savory', 'slightly_sweet'],
    matchPercent: 98,
  },
  ingredients: [
    {
      ingredientKey: 'tomato',
      zhName: '番茄',
      roleKey: 'main',
      necessityKey: 'required',
      isMinimumRequired: true,
      quantityText: '1-2 个',
    },
    {
      ingredientKey: 'egg',
      zhName: '鸡蛋',
      roleKey: 'main',
      necessityKey: 'required',
      isMinimumRequired: true,
      quantityText: '2 个',
    },
    {
      ingredientKey: 'cooking_oil',
      zhName: '食用油',
      roleKey: 'seasoning',
      necessityKey: 'required',
      isMinimumRequired: true,
      quantityText: '1 汤匙',
    },
    {
      ingredientKey: 'salt',
      zhName: '盐',
      roleKey: 'seasoning',
      necessityKey: 'required',
      isMinimumRequired: true,
      quantityText: '少许',
    },
    {
      ingredientKey: 'sugar',
      zhName: '糖',
      roleKey: 'seasoning',
      necessityKey: 'optional',
      isMinimumRequired: false,
      quantityText: '少许',
    },
    {
      ingredientKey: 'scallion',
      zhName: '葱花',
      roleKey: 'garnish',
      necessityKey: 'optional',
      isMinimumRequired: false,
      quantityText: '可选',
    },
  ],
  tools: [
    { equipmentKey: 'pan', zhName: '平底锅', necessityKey: 'required' },
    { equipmentKey: 'spatula', zhName: '锅铲', necessityKey: 'recommended' },
    { equipmentKey: 'knife', zhName: '刀', necessityKey: 'required' },
    { equipmentKey: 'cutting_board', zhName: '砧板', necessityKey: 'recommended' },
  ],
  steps: [
    {
      stepNumber: 1,
      title: '处理食材',
      body: '番茄切成小块，鸡蛋打散。想要更嫩可以在蛋液里加一小勺水。',
      estimatedMinutes: 3,
    },
    {
      stepNumber: 2,
      title: '先炒鸡蛋',
      body: '锅热后放油，倒入蛋液，炒到刚刚凝固就盛出，避免炒老。',
      estimatedMinutes: 4,
    },
    {
      stepNumber: 3,
      title: '炒番茄出汁',
      body: '同一口锅放入番茄，加少许盐帮助出汁，炒到番茄变软。',
      estimatedMinutes: 5,
    },
    {
      stepNumber: 4,
      title: '合并调味',
      body: '把鸡蛋倒回锅里，按口味加盐和少许糖，翻炒均匀后出锅。',
      estimatedMinutes: 3,
    },
  ],
}

const difficultyLabels: Record<DifficultyKey, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const necessityLabels: Record<NecessityKey, string> = {
  required: '必需',
  recommended: '推荐',
  optional: '可选',
}

const roleLabels: Record<IngredientRoleKey, string> = {
  main: '主料',
  side: '辅料',
  seasoning: '调料',
  garnish: '点缀',
}

export default function DevRecipeDetailCheck() {
  const [mode, setMode] = useState<'detail' | 'cooking'>('detail')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const { preview } = useLocalSearchParams<{ preview?: string }>()
  const { width } = useWindowDimensions()
  const isMobilePreview = preview === 'mobile'
  const isWide = !isMobilePreview && width >= 860

  const totalSteps = mockRecipeDetail.steps.length
  const currentStep = mockRecipeDetail.steps[currentStepIndex]
  const completedStepCount = isCompleted ? totalSteps : currentStepIndex
  const progressPercent = useMemo(
    () => completedStepCount / totalSteps,
    [completedStepCount, totalSteps]
  )
  const progressWidth = `${progressPercent * 100}%` as `${number}%`

  const startCooking = () => {
    setMode('cooking')
    setIsCompleted(false)
  }

  const goToPreviousStep = () => {
    setIsCompleted(false)
    setCurrentStepIndex((value) => Math.max(0, value - 1))
  }

  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((value) => value + 1)
      return
    }

    setIsCompleted(true)
  }

  const resetTutorial = () => {
    setCurrentStepIndex(0)
    setIsCompleted(false)
    setMode('detail')
  }

  if (mode === 'cooking') {
    return (
      <CookingMode
        currentStepIndex={currentStepIndex}
        isCompleted={isCompleted}
        isMobilePreview={isMobilePreview}
        isWide={isWide}
        onClose={() => setMode('detail')}
        onPrevious={goToPreviousStep}
        onNext={goToNextStep}
        onReset={resetTutorial}
      />
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.detailContent,
        isMobilePreview && styles.mobilePreviewContent,
      ]}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Ionicons name="book-outline" size={22} color={colors.primary} />
          <Text style={styles.brandTitle}>冰箱侦探厨房</Text>
        </View>
        <View style={styles.devPill}>
          <Ionicons name="flask-outline" size={15} color={colors.primary} />
          <Text style={styles.devPillText}>Mock UI</Text>
        </View>
      </View>

      <View style={[styles.recipeHero, isWide && styles.recipeHeroWide]}>
        <View style={[styles.visualPanel, isMobilePreview && styles.mobileVisualPanel]}>
          <View style={[styles.recipeImageMock, isMobilePreview && styles.mobileRecipeImageMock]}>
            <View style={styles.recipeImageGlow} />
            <Text style={[styles.recipeEmoji, isMobilePreview && styles.mobileRecipeEmoji]}>🍅</Text>
            <Text
              style={[
                styles.recipeEmojiSecondary,
                isMobilePreview && styles.mobileRecipeEmojiSecondary,
              ]}>
              🥚
            </Text>
            <View style={styles.matchBadge}>
              <Ionicons name="sparkles-outline" size={17} color="#fff" />
              <Text style={styles.matchBadgeText}>
                {mockRecipeDetail.recipe.matchPercent}% 匹配
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.heroCopy, isMobilePreview && styles.mobileHeroCopy]}>
          <View style={styles.metaRow}>
            <MetaChip iconName="time-outline" label={`${mockRecipeDetail.recipe.totalTimeMinutes} 分钟`} />
            <MetaChip iconName="restaurant-outline" label={difficultyLabels[mockRecipeDetail.recipe.difficultyKey]} />
            <MetaChip iconName="people-outline" label={`${mockRecipeDetail.recipe.servingCount} 人份`} />
          </View>

          <Text style={[styles.recipeTitle, isMobilePreview && styles.mobileRecipeTitle]}>
            {mockRecipeDetail.recipe.zhName}
          </Text>
          <Text style={styles.recipeSubtitle}>{mockRecipeDetail.recipe.enName}</Text>
          <Text style={styles.recipeDescription}>{mockRecipeDetail.recipe.description}</Text>

          <View style={[styles.progressBlock, isMobilePreview && styles.mobileProgressBlock]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>烹饪进度</Text>
              <Text style={styles.progressHint}>
                {isCompleted ? '已完成' : `步骤 ${currentStepIndex + 1} / ${totalSteps}`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>

          <View style={[styles.ctaRow, isMobilePreview && styles.mobileCtaRow]}>
            <Pressable
              accessibilityRole="button"
              onPress={startCooking}
              style={({ pressed }) => [
                styles.primaryButton,
                isMobilePreview && styles.mobilePrimaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {currentStepIndex > 0 || isCompleted ? '继续烹饪' : '开始烹饪'}
              </Text>
              <Ionicons name="arrow-forward-outline" size={22} color="#fff" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={resetTutorial}
              style={({ pressed }) => [
                styles.secondaryButton,
                isMobilePreview && styles.mobileSecondaryButton,
                pressed && styles.buttonPressed,
              ]}>
              <Ionicons name="refresh-outline" size={18} color={colors.onSurface} />
              <Text style={styles.secondaryButtonText}>重置</Text>
            </Pressable>
          </View>

          <View style={styles.statGrid}>
            <NutritionStat iconName="flame-outline" label="难度" value={difficultyLabels[mockRecipeDetail.recipe.difficultyKey]} />
            <NutritionStat iconName="leaf-outline" label="风味" value="酸甜咸香" />
            <NutritionStat iconName="bar-chart-outline" label="预算" value="低成本" />
            <NutritionStat iconName="calendar-outline" label="场景" value="快手晚餐" />
          </View>
        </View>
      </View>

      <View style={[styles.infoGrid, isWide && styles.infoGridWide]}>
        <SectionCard title="食材清单" iconName="basket-outline">
          {mockRecipeDetail.ingredients.map((ingredient) => (
            <View key={ingredient.ingredientKey} style={styles.listRow}>
              <View style={styles.listText}>
                <Text style={styles.itemName}>{ingredient.zhName}</Text>
                <Text style={styles.itemMeta}>
                  {roleLabels[ingredient.roleKey]} · {necessityLabels[ingredient.necessityKey]}
                </Text>
              </View>
              <Text style={styles.quantityText}>{ingredient.quantityText}</Text>
            </View>
          ))}
        </SectionCard>

        <SectionCard title="厨具与调料" iconName="construct-outline">
          <View style={styles.toolGrid}>
            {mockRecipeDetail.tools.map((tool) => (
              <View key={tool.equipmentKey} style={styles.toolChip}>
                <Ionicons name="checkmark-circle-outline" size={17} color={colors.primary} />
                <Text style={styles.toolText}>{tool.zhName}</Text>
                <Text style={styles.toolMeta}>{necessityLabels[tool.necessityKey]}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      </View>

      <SectionCard title="步骤预览" iconName="list-outline">
        <View style={styles.timelinePreview}>
          {mockRecipeDetail.steps.map((step, index) => {
            const isActive = !isCompleted && index === currentStepIndex
            const isDone = isCompleted || index < currentStepIndex

            return (
              <Pressable
                key={step.stepNumber}
                accessibilityRole="button"
                onPress={() => {
                  setCurrentStepIndex(index)
                  setIsCompleted(false)
                }}
                style={[
                  styles.previewStep,
                  isActive && styles.previewStepActive,
                  isDone && styles.previewStepDone,
                ]}>
                <View
                  style={[
                    styles.previewStepMarker,
                    isActive && styles.previewStepMarkerActive,
                    isDone && styles.previewStepMarkerDone,
                  ]}>
                  <Text
                    style={[
                      styles.previewStepMarkerText,
                      (isActive || isDone) && styles.previewStepMarkerTextActive,
                    ]}>
                    {isDone ? '✓' : step.stepNumber}
                  </Text>
                </View>
                <View style={styles.previewStepText}>
                  <Text style={styles.previewStepTitle}>{step.title}</Text>
                  <Text style={styles.previewStepBody}>{step.body}</Text>
                </View>
                <Text style={styles.previewStepTime}>{step.estimatedMinutes} 分</Text>
              </Pressable>
            )
          })}
        </View>
      </SectionCard>

      <Text style={styles.footerNote}>
        Dev-only route. Data source is local mockRecipeDetail. Future source:
        recipeService.getRecipeDetail(recipeId).
      </Text>
    </ScrollView>
  )
}

type CookingModeProps = {
  currentStepIndex: number
  isCompleted: boolean
  isMobilePreview: boolean
  isWide: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onReset: () => void
}

function CookingMode({
  currentStepIndex,
  isCompleted,
  isMobilePreview,
  isWide,
  onClose,
  onPrevious,
  onNext,
  onReset,
}: CookingModeProps) {
  const totalSteps = mockRecipeDetail.steps.length
  const currentStep = mockRecipeDetail.steps[currentStepIndex]
  const completedStepCount = isCompleted ? totalSteps : currentStepIndex
  const progressWidth = `${(completedStepCount / totalSteps) * 100}%` as `${number}%`

  return (
    <View
      style={[
        styles.cookingScreen,
        isWide && styles.cookingScreenWide,
        isMobilePreview && styles.mobilePreviewDevice,
      ]}>
      {isWide && (
        <View style={styles.cookingSidebar}>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}>
            <Ionicons name="close-outline" size={20} color={colors.primary} />
            <Text style={styles.closeButtonText}>关闭模式</Text>
          </Pressable>

          <View style={styles.sideTimeline}>
            <View style={styles.sideTimelineLine} />
            {mockRecipeDetail.steps.map((step, index) => {
              const isCurrent = !isCompleted && index === currentStepIndex
              const isPast = isCompleted || index < currentStepIndex

              return (
                <View key={step.stepNumber} style={styles.sideStep}>
                  <View
                    style={[
                      styles.sideStepMarker,
                      isCurrent && styles.sideStepMarkerCurrent,
                      isPast && styles.sideStepMarkerPast,
                    ]}>
                    <Text
                      style={[
                        styles.sideStepMarkerText,
                        (isCurrent || isPast) && styles.sideStepMarkerTextActive,
                      ]}>
                      {isPast ? '✓' : step.stepNumber}
                    </Text>
                  </View>
                  <View style={[styles.sideStepCopy, !isCurrent && styles.sideStepCopyMuted]}>
                    <Text style={styles.sideStepTitle}>{step.title}</Text>
                    <Text style={styles.sideStepTime}>{step.estimatedMinutes} 分钟</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <View style={styles.cookingMain}>
        <View style={styles.cookingHeader}>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed,
            ]}>
            <Ionicons name="close-outline" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <View style={styles.cookingHeaderText}>
            <Text style={styles.cookingKicker}>
              {isCompleted ? '完成' : `步骤 ${currentStepIndex + 1} / ${totalSteps}`}
            </Text>
            <Text style={styles.cookingHeaderTitle}>{mockRecipeDetail.recipe.zhName}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onReset}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed,
            ]}>
            <Ionicons name="refresh-outline" size={21} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {!isWide && (
          <View style={styles.mobileProgressDots}>
            {mockRecipeDetail.steps.map((step, index) => (
              <View
                key={step.stepNumber}
                style={[
                  styles.mobileProgressDot,
                  (index <= currentStepIndex || isCompleted) && styles.mobileProgressDotActive,
                ]}
              />
            ))}
          </View>
        )}

        <ScrollView
          style={styles.cookingScroll}
          contentContainerStyle={styles.cookingScrollContent}>
          <View style={styles.cookingInstructionWrap}>
            <Text style={styles.instructionLabel}>烹饪指令</Text>
            <Text style={styles.instructionTitle}>
              {isCompleted ? '漂亮，今天这案子结了。' : currentStep.body}
            </Text>
            <Text style={styles.instructionSubtitle}>
              {isCompleted
                ? '可以拍照记录成果，或重置教程再演示一次。'
                : `${currentStep.title} · 预计 ${currentStep.estimatedMinutes} 分钟`}
            </Text>

            <View style={styles.voiceHint}>
              <View style={styles.voicePulse}>
                <Ionicons name="mic-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.voiceText}>"嘿，下一步"</Text>
            </View>
          </View>

          <View style={styles.cookingProgressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>当前进度</Text>
              <Text style={styles.progressHint}>
                {isCompleted ? `${totalSteps}/${totalSteps}` : `${currentStepIndex}/${totalSteps}`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>
        </ScrollView>

        <View style={styles.cookingActionBar}>
          <Pressable
            accessibilityRole="button"
            onPress={onPrevious}
            disabled={currentStepIndex === 0 && !isCompleted}
            style={({ pressed }) => [
              styles.previousButton,
              pressed && styles.buttonPressed,
              currentStepIndex === 0 && !isCompleted && styles.disabledButton,
            ]}>
            <Ionicons name="arrow-back-outline" size={24} color={colors.onSurface} />
            <Text style={styles.previousButtonText}>上一步</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={isCompleted ? onReset : onNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.buttonPressed,
              isCompleted && styles.completeButton,
            ]}>
            <Text style={styles.nextButtonText}>
              {isCompleted
                ? '重置教程'
                : currentStepIndex === totalSteps - 1
                  ? '完成烹饪'
                  : '下一步'}
            </Text>
            <Ionicons
              name={isCompleted ? 'refresh-outline' : 'arrow-forward-outline'}
              size={28}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

type IconName = React.ComponentProps<typeof Ionicons>['name']

type MetaChipProps = {
  iconName: IconName
  label: string
}

function MetaChip({ iconName, label }: MetaChipProps) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={iconName} size={15} color={colors.primary} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  )
}

type NutritionStatProps = {
  iconName: IconName
  label: string
  value: string
}

function NutritionStat({ iconName, label, value }: NutritionStatProps) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={iconName} size={18} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

type SectionCardProps = {
  title: string
  iconName: IconName
  children: React.ReactNode
}

function SectionCard({ title, iconName, children }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name={iconName} size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

const colors = {
  primary: '#c2652a',
  primarySoft: '#f2d9c7',
  background: '#faf5ee',
  surface: '#ffffff',
  surfaceLow: '#f6f0e8',
  surfaceMid: '#f2ece4',
  outline: '#d8d0c8',
  onSurface: '#3a302a',
  onSurfaceVariant: '#605850',
  tertiary: '#8c3c3c',
}

const sharedShadow = {
  shadowColor: '#3a302a',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 4,
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContent: {
    gap: 24,
    padding: 18,
    paddingBottom: 36,
  },
  mobilePreviewContent: {
    alignSelf: 'center',
    maxWidth: 430,
    padding: 12,
    paddingBottom: 28,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(250, 245, 238, 0.96)',
    borderColor: 'rgba(216, 208, 200, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBarLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandTitle: {
    color: colors.primary,
    fontFamily: 'serif',
    fontSize: 22,
    fontStyle: 'italic',
    fontWeight: '900',
  },
  devPill: {
    alignItems: 'center',
    backgroundColor: '#fff2e8',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  devPillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recipeHero: {
    backgroundColor: colors.surfaceLow,
    borderColor: 'rgba(216, 208, 200, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    ...sharedShadow,
  },
  recipeHeroWide: {
    flexDirection: 'row',
    minHeight: 520,
  },
  visualPanel: {
    backgroundColor: colors.surfaceMid,
    flex: 1,
    minHeight: 300,
  },
  mobileVisualPanel: {
    minHeight: 190,
  },
  recipeImageMock: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  mobileRecipeImageMock: {
    minHeight: 190,
  },
  recipeImageGlow: {
    backgroundColor: 'rgba(194, 101, 42, 0.16)',
    borderRadius: 180,
    height: 320,
    position: 'absolute',
    right: -70,
    top: -70,
    width: 320,
  },
  recipeEmoji: {
    fontSize: 112,
    transform: [{ rotate: '-8deg' }],
  },
  mobileRecipeEmoji: {
    fontSize: 78,
  },
  recipeEmojiSecondary: {
    bottom: 76,
    fontSize: 72,
    position: 'absolute',
    right: 72,
    transform: [{ rotate: '12deg' }],
  },
  mobileRecipeEmojiSecondary: {
    bottom: 42,
    fontSize: 46,
    right: 48,
  },
  matchBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    left: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: 'absolute',
    top: 22,
    ...sharedShadow,
  },
  matchBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  heroCopy: {
    flex: 1.35,
    gap: 22,
    justifyContent: 'space-between',
    padding: 28,
  },
  mobileHeroCopy: {
    gap: 13,
    padding: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaChip: {
    alignItems: 'center',
    backgroundColor: '#fff5ed',
    borderColor: 'rgba(194, 101, 42, 0.18)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaChipText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '800',
  },
  recipeTitle: {
    color: colors.onSurface,
    fontFamily: 'serif',
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 54,
  },
  mobileRecipeTitle: {
    fontSize: 34,
    lineHeight: 40,
  },
  recipeSubtitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: -18,
    textTransform: 'uppercase',
  },
  recipeDescription: {
    color: colors.onSurfaceVariant,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(58, 48, 42, 0.04)',
    borderRadius: 18,
    flexGrow: 1,
    gap: 5,
    minWidth: 112,
    padding: 14,
  },
  statValue: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  progressBlock: {
    gap: 9,
  },
  mobileProgressBlock: {
    backgroundColor: '#fff8f1',
    borderColor: 'rgba(194, 101, 42, 0.18)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  progressHint: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: colors.surfaceMid,
    borderRadius: 999,
    height: 9,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mobileCtaRow: {
    flexWrap: 'nowrap',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 190,
    paddingHorizontal: 24,
    ...sharedShadow,
  },
  mobilePrimaryButton: {
    flex: 1,
    minHeight: 52,
    minWidth: 0,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(216, 208, 200, 0.9)',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 22,
  },
  mobileSecondaryButton: {
    minHeight: 52,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
  infoGrid: {
    gap: 18,
  },
  infoGridWide: {
    flexDirection: 'row',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(216, 208, 200, 0.85)',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    gap: 14,
    padding: 22,
    ...sharedShadow,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '900',
  },
  listRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(216, 208, 200, 0.45)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  listText: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
  },
  itemMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  quantityText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderColor: 'rgba(216, 208, 200, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  toolText: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '900',
  },
  toolMeta: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
  },
  timelinePreview: {
    gap: 10,
  },
  previewStep: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceLow,
    borderColor: 'rgba(216, 208, 200, 0.62)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 15,
  },
  previewStepActive: {
    backgroundColor: '#fff6ef',
    borderColor: 'rgba(194, 101, 42, 0.42)',
  },
  previewStepDone: {
    opacity: 0.82,
  },
  previewStepMarker: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMid,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  previewStepMarkerActive: {
    backgroundColor: colors.primary,
  },
  previewStepMarkerDone: {
    backgroundColor: colors.primarySoft,
  },
  previewStepMarkerText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '900',
  },
  previewStepMarkerTextActive: {
    color: colors.onSurface,
  },
  previewStepText: {
    flex: 1,
    gap: 5,
  },
  previewStepTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
  },
  previewStepBody: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  previewStepTime: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    paddingTop: 3,
  },
  footerNote: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  cookingScreen: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    flex: 1,
    width: '100%',
  },
  mobilePreviewDevice: {
    maxWidth: 430,
  },
  cookingScreenWide: {
    flexDirection: 'row',
  },
  cookingSidebar: {
    backgroundColor: colors.surfaceLow,
    borderRightColor: colors.outline,
    borderRightWidth: 1,
    gap: 42,
    padding: 28,
    width: 320,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(58, 48, 42, 0.05)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  sideTimeline: {
    gap: 34,
    position: 'relative',
  },
  sideTimelineLine: {
    backgroundColor: colors.outline,
    bottom: 24,
    left: 19,
    position: 'absolute',
    top: 18,
    width: 2,
  },
  sideStep: {
    flexDirection: 'row',
    gap: 18,
  },
  sideStepMarker: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.outline,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
    zIndex: 2,
  },
  sideStepMarkerCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.12 }],
  },
  sideStepMarkerPast: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  sideStepMarkerText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '900',
  },
  sideStepMarkerTextActive: {
    color: colors.onSurface,
  },
  sideStepCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 5,
  },
  sideStepCopyMuted: {
    opacity: 0.48,
  },
  sideStepTitle: {
    color: colors.onSurface,
    fontFamily: 'serif',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 23,
  },
  sideStepTime: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
  },
  cookingMain: {
    flex: 1,
  },
  cookingScroll: {
    flex: 1,
  },
  cookingScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 18,
  },
  cookingHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(250, 245, 238, 0.96)',
    borderBottomColor: 'rgba(216, 208, 200, 0.7)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cookingHeaderText: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  cookingKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cookingHeaderTitle: {
    color: colors.onSurface,
    fontFamily: 'serif',
    fontSize: 22,
    fontStyle: 'italic',
    fontWeight: '900',
  },
  mobileProgressDots: {
    backgroundColor: colors.surfaceLow,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  mobileProgressDot: {
    backgroundColor: colors.outline,
    borderRadius: 999,
    flex: 1,
    height: 6,
  },
  mobileProgressDotActive: {
    backgroundColor: colors.primary,
  },
  cookingInstructionWrap: {
    alignItems: 'center',
    gap: 22,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  instructionLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  instructionTitle: {
    color: colors.onSurface,
    fontFamily: 'serif',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
    maxWidth: 900,
    textAlign: 'center',
  },
  instructionSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 25,
    textAlign: 'center',
  },
  voiceHint: {
    alignItems: 'center',
    backgroundColor: '#fff2e8',
    borderColor: 'rgba(194, 101, 42, 0.24)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...sharedShadow,
  },
  voicePulse: {
    alignItems: 'center',
    backgroundColor: 'rgba(194, 101, 42, 0.12)',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  voiceText: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: '900',
  },
  cookingProgressBlock: {
    gap: 10,
    paddingHorizontal: 22,
  },
  cookingActionBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    paddingBottom: 16,
  },
  previousButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMid,
    borderColor: 'rgba(216, 208, 200, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 58,
  },
  previousButtonText: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '900',
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    flex: 2.5,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 58,
    ...sharedShadow,
  },
  completeButton: {
    backgroundColor: colors.tertiary,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.35,
  },
})
