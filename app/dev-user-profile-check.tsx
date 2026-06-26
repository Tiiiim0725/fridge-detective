// app/dev-user-profile-check.tsx
// User Profile / Onboarding v0.2 product prototype backed by profileService.

import { Ionicons } from '@expo/vector-icons'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { FloatingTopButton } from '@/components/ui/floating-top-button'
import {
  UI_CARD_RADIUS,
  UI_CONTROL_HEIGHT,
  UI_PAGE_MAX_WIDTH,
  UI_PAGE_SIDE_PADDING,
  UI_PAGE_SIDE_PADDING_COMPACT,
  UI_PILL_RADIUS,
  UI_TOP_BAR_SIDE_PADDING,
  UI_TOP_BUTTON_SIZE,
} from '@/components/ui/design-tokens'
import { normalizeIngredientName } from '@/services/ingredientService'
import {
  addManualFridgeItem,
  confirmManualFridgeItems,
  type ManualFridgeLocalCandidate,
} from '@/services/manualFridgeService'
import { normalizePantryItemName } from '@/services/pantryItemService'
import {
  ensureProfile,
  getOnboardingContext,
  saveKitchenEquipment,
  savePantryItems,
  saveUserPreferences,
  updateProfile,
} from '@/services/profileService'
import type { Ingredient } from '@/types/recipe'
import {
  ALLERGEN_OPTIONS,
  COOK_TIME_PREFERENCE_OPTIONS,
  COOKING_SKILL_OPTIONS,
  CUISINE_PREFERENCE_OPTIONS,
  DEFAULT_ASSUMED_KITCHEN_EQUIPMENT_KEYS,
  DEFAULT_ASSUMED_PANTRY_KEYS,
  DEFAULT_COOK_TIME_PREFERENCE_KEY,
  DEFAULT_COOKING_SKILL_KEY,
  DIETARY_RULE_OPTIONS,
  KITCHEN_EQUIPMENT_OPTIONS,
  MEAL_STYLE_OPTIONS,
  MVP_DEFAULT_KITCHEN_EQUIPMENT_KEYS,
  PANTRY_ITEM_OPTIONS,
  QUICK_PANTRY_ITEM_KEYS,
  USER_SELECTABLE_KITCHEN_EQUIPMENT_KEYS,
  type AllergenKey,
  type CookTimePreferenceKey,
  type CookingSkillKey,
  type CuisinePreferenceKey,
  type DietaryRuleKey,
  type KitchenEquipmentKey,
  type MealStyleKey,
  type PantryItemKey,
} from '@/types/profile'

type SaveStatus = 'idle' | 'loading' | 'saving' | 'success' | 'error'
type IoniconName = keyof typeof Ionicons.glyphMap

export type UserProfileFlowMode = 'onboarding' | 'settings' | 'dev'

export type UserProfileFlowProps = {
  mode: UserProfileFlowMode
  onBack?: () => void
  onSaved?: () => void | Promise<void>
  showDebug?: boolean
}

const selectedColor = '#c2652a'
const inkColor = '#332e29'
const paperColor = '#fff8f1'
const pageColor = '#faf5ee'
const quickPantryKeys = QUICK_PANTRY_ITEM_KEYS as readonly PantryItemKey[]
const defaultPantryKeys = DEFAULT_ASSUMED_PANTRY_KEYS as readonly PantryItemKey[]
const traditionalCuisineKeys: CuisinePreferenceKey[] = ['shandong', 'sichuan', 'cantonese', 'huaiyang']

function unique<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values))
}

function toggleKey<T extends string>(values: T[], key: T): T[] {
  return values.includes(key)
    ? values.filter((value) => value !== key)
    : [...values, key]
}

function optionIcon(key: string): IoniconName {
  if (key.includes('vegetarian') || key.includes('healthy') || key.includes('chinese')) return 'leaf-outline'
  if (key.includes('vegan')) return 'flower-outline'
  if (key.includes('halal')) return 'moon-outline'
  if (key.includes('western')) return 'fast-food-outline'
  if (key.includes('time') || key.includes('quick')) return 'timer-outline'
  if (key.includes('rice') || key.includes('pot') || key.includes('stove')) return 'restaurant-outline'
  if (key.includes('microwave') || key.includes('oven') || key.includes('air')) return 'hardware-chip-outline'
  if (key.includes('sauce') || key.includes('vinegar') || key.includes('oil')) return 'water-outline'
  if (key.includes('pepper') || key.includes('chili')) return 'flame-outline'
  return 'sparkles-outline'
}

function getPantryLabel(key: PantryItemKey): string {
  return PANTRY_ITEM_OPTIONS.find((option) => option.key === key)?.zhLabel ?? key
}

function getEquipmentLabel(key: KitchenEquipmentKey): string {
  return KITCHEN_EQUIPMENT_OPTIONS.find((option) => option.key === key)?.zhLabel ?? key
}

export function UserProfileFlow({
  mode,
  onBack,
  onSaved,
  showDebug = false,
}: UserProfileFlowProps) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [debugOpen, setDebugOpen] = useState(false)
  const [debugContext, setDebugContext] = useState<unknown | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [dietaryRules, setDietaryRules] = useState<DietaryRuleKey[]>(['none'])
  const [cuisinePreferences, setCuisinePreferences] = useState<CuisinePreferenceKey[]>([
    'chinese_home',
    'western_simple',
  ])
  const [mealStylePreferences, setMealStylePreferences] = useState<MealStyleKey[]>([
    'quick_easy',
    'budget',
  ])
  const [allergenKeys, setAllergenKeys] = useState<AllergenKey[]>([])
  const [avoidIngredientKeys, setAvoidIngredientKeys] = useState<string[]>([])
  const [cookTimePreferenceKey, setCookTimePreferenceKey] =
    useState<CookTimePreferenceKey>(DEFAULT_COOK_TIME_PREFERENCE_KEY)
  const [cookingSkill, setCookingSkill] = useState<CookingSkillKey>(DEFAULT_COOKING_SKILL_KEY)
  const [equipmentKeys, setEquipmentKeys] = useState<KitchenEquipmentKey[]>([
    ...MVP_DEFAULT_KITCHEN_EQUIPMENT_KEYS,
  ])
  const [pantryKeys, setPantryKeys] = useState<PantryItemKey[]>([
    ...defaultPantryKeys,
    'soy_sauce',
    'vinegar',
    'black_pepper',
  ])
  const [pantryInput, setPantryInput] = useState('')
  const [avoidInput, setAvoidInput] = useState('')
  const [matchedPantry, setMatchedPantry] = useState<Ingredient | null>(null)
  const [pantryFridgeCandidate, setPantryFridgeCandidate] =
    useState<ManualFridgeLocalCandidate | null>(null)

  const isBusy = status === 'loading' || status === 'saving'
  const selectedTraditionalCuisineCount = useMemo(
    () => cuisinePreferences.filter((key) => traditionalCuisineKeys.includes(key)).length,
    [cuisinePreferences]
  )

  useEffect(() => {
    let mounted = true

    async function loadContext() {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const context = await getOnboardingContext()

        if (!mounted) return

        setDisplayName(context.profile.displayName ?? '')

        if (context.preferences) {
          setDietaryRules(context.preferences.dietaryRules.length > 0
            ? context.preferences.dietaryRules
            : ['none'])
          setCuisinePreferences(context.preferences.cuisinePreferences.length > 0
            ? context.preferences.cuisinePreferences
            : ['chinese_home', 'western_simple'])
          setMealStylePreferences(context.preferences.mealStylePreferences)
          setAllergenKeys(context.preferences.allergenKeys)
          setAvoidIngredientKeys(context.preferences.avoidIngredientKeys)
          setCookTimePreferenceKey(context.preferences.cookTimePreferenceKey)
          setCookingSkill(context.preferences.cookingSkill)
        }

        setEquipmentKeys(context.equipmentKeys.length > 0
          ? context.equipmentKeys.filter((key) => USER_SELECTABLE_KITCHEN_EQUIPMENT_KEYS.includes(key))
          : [...MVP_DEFAULT_KITCHEN_EQUIPMENT_KEYS])
        setPantryKeys(context.pantryItemKeys.length > 0
          ? unique([...defaultPantryKeys, ...context.pantryItemKeys])
          : unique([...defaultPantryKeys, 'soy_sauce', 'vinegar', 'black_pepper']))
        setDebugContext(context)
        setStatus('idle')
      } catch (error) {
        if (!mounted) return
        setErrorMessage(error instanceof Error ? error.message : String(error))
        setStatus('error')
      }
    }

    loadContext()

    return () => {
      mounted = false
    }
  }, [])

  function toggleDietaryRule(key: DietaryRuleKey) {
    setDietaryRules((current) => {
      if (key === 'none') {
        return ['none']
      }

      const withoutNone = current.filter((value) => value !== 'none')
      const next = toggleKey(withoutNone, key)
      return next.length > 0 ? next : ['none']
    })
  }

  function toggleCuisine(key: CuisinePreferenceKey) {
    setCuisinePreferences((current) => {
      const isTraditional = traditionalCuisineKeys.includes(key)
      const alreadySelected = current.includes(key)

      if (isTraditional && !alreadySelected && selectedTraditionalCuisineCount >= 2) {
        setErrorMessage('传统菜系最多选择 2 个。')
        return current
      }

      setErrorMessage(null)
      return toggleKey(current, key)
    })
  }

  function togglePantry(key: PantryItemKey) {
    if (defaultPantryKeys.includes(key)) {
      return
    }

    setPantryKeys((current) => toggleKey(current, key))
  }

  async function addFreePantryItem() {
    const raw = pantryInput.trim()

    if (!raw) {
      setErrorMessage('请输入一个 pantry 或调味品名称。')
      return
    }

    setErrorMessage(null)
    setMatchedPantry(null)
    setPantryFridgeCandidate(null)

    try {
      const pantryIngredient = await normalizePantryItemName(raw)

      if (pantryIngredient) {
        setPantryKeys((current) => unique([...current, pantryIngredient.ingredientKey as PantryItemKey]))
        setMatchedPantry(pantryIngredient)
        setPantryInput('')
        return
      }

      const ingredient = await normalizeIngredientName(raw)

      if (ingredient && !ingredient.isPantryItem) {
        const result = await addManualFridgeItem({
          rawName: raw,
          quantityKind: 'unknown',
        })

        if (result.kind === 'local_candidate') {
          setPantryFridgeCandidate(result.item)
          return
        }
      }

      if (!ingredient || !ingredient.isPantryItem) {
        setErrorMessage(`没有匹配到可保存的 pantry 食材：“${raw}”。可以换个常见说法再试。`)
        return
      }

      setPantryKeys((current) => unique([...current, ingredient.ingredientKey as PantryItemKey]))
      setMatchedPantry(ingredient)
      setPantryInput('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  async function confirmPantryFridgeCandidate() {
    if (!pantryFridgeCandidate) {
      return
    }

    setStatus('saving')
    setErrorMessage(null)

    try {
      await confirmManualFridgeItems([pantryFridgeCandidate])
      setSuccessMessage(`已把 ${pantryFridgeCandidate.displayName} 加入冰箱库存。`)
      setPantryInput('')
      setPantryFridgeCandidate(null)
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }
  }

  function dismissPantryFridgeCandidate() {
    setPantryInput('')
    setPantryFridgeCandidate(null)
    setErrorMessage(null)
  }

  async function addAvoidIngredient() {
    const raw = avoidInput.trim()

    if (!raw) {
      setErrorMessage('请输入一个不想吃的食材。')
      return
    }

    setErrorMessage(null)

    try {
      const ingredient = await normalizeIngredientName(raw)

      if (!ingredient) {
        setErrorMessage(`没有匹配到标准食材：“${raw}”。可以换个常见说法再试。`)
        return
      }

      setAvoidIngredientKeys((current) => unique([...current, ingredient.ingredientKey]))
      setAvoidInput('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  async function saveProfile() {
    setStatus('saving')
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await ensureProfile()
      let profile = await updateProfile({
        displayName: displayName.trim() || null,
        ...(mode !== 'settings' ? { onboardingStatus: 'in_progress' as const } : {}),
      })
      const preferences = await saveUserPreferences({
        cuisinePreferences,
        mealStylePreferences,
        dietaryRules,
        avoidIngredientKeys,
        allergenKeys,
        cookTimePreferenceKey,
        cookingSkill,
      })
      const equipment = await saveKitchenEquipment({
        equipmentKeys: unique([...DEFAULT_ASSUMED_KITCHEN_EQUIPMENT_KEYS, ...equipmentKeys]),
      })
      const pantry = await savePantryItems({
        pantryItemKeys: unique(pantryKeys),
      })

      if (mode !== 'settings') {
        profile = await updateProfile({
          onboardingStatus: 'completed',
        })
      }

      const context = await getOnboardingContext()

      setDebugContext({
        profile,
        preferences,
        equipmentKeys: equipment.map((item) => item.equipmentKey),
        pantryItemKeys: pantry.map((item) => item.pantryItemKey),
        context,
      })
      setSuccessMessage('档案已保存，推荐系统可以使用这些偏好了。')
      setStatus('success')
      await onSaved?.()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setStatus('error')
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <FloatingTopButton
            accessibilityLabel={onBack ? '返回' : '打开菜单'}
            disabled={!onBack}
            iconName={onBack ? 'arrow-back-outline' : 'menu-outline'}
            onPress={onBack}
          />
          <Text style={styles.brand}>冰箱侦探</Text>
          {mode === 'settings' ? (
            <View style={styles.topButtonSlot} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color="#fff8f1" />
            </View>
          )}
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="options-outline" size={30} color={selectedColor} />
          </View>
          <Text style={styles.title}>
            {mode === 'onboarding' ? '先认识一下你' : '完善你的口味档案'}
          </Text>
          <Text style={styles.subtitle}>告诉我一点点口味和厨房条件，今晚推荐会更像你。</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorPanel}>
            <Ionicons name="alert-circle-outline" size={18} color="#a33a2d" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successPanel}>
            <Ionicons name="checkmark-circle-outline" size={19} color="#1f5945" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.topGrid}>
          <View style={[styles.card, styles.topGridCard]}>
            <SectionHeader icon="person-outline" title="怎么称呼你" />
            <Text style={styles.helperText}>这个名字只用于页面称呼，不影响推荐。</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              editable={!isBusy}
              placeholder="怎么称呼你？"
              placeholderTextColor="#9c9087"
              style={styles.textInput}
            />
          </View>

          <View style={[styles.card, styles.topGridCard]}>
            <SectionHeader icon="timer-outline" title="做饭节奏" />
            <Text style={styles.helperText}>默认是 30 分钟以内；第四档表示愿意接受更长准备。</Text>
            <View style={styles.pillWrap}>
              {COOK_TIME_PREFERENCE_OPTIONS.map((option) => (
                <PillButton
                  key={option.key}
                  label={option.zhLabel}
                  selected={cookTimePreferenceKey === option.key}
                  onPress={() => setCookTimePreferenceKey(option.key)}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="restaurant-outline" title="饮食方式" />
          <Text style={styles.helperText}>这里只保留会影响推荐过滤的核心饮食限制。</Text>
          <View style={styles.optionGrid}>
            {DIETARY_RULE_OPTIONS.map((option) => (
              <OptionCard
                key={option.key}
                label={option.zhLabel}
                description={option.zhDescription}
                icon={optionIcon(option.key)}
                selected={dietaryRules.includes(option.key)}
                onPress={() => toggleDietaryRule(option.key)}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="compass-outline" title="喜欢的菜系" />
          <Text style={styles.helperText}>建议保留中式家常菜和西餐简餐；传统菜系最多选 2 个。</Text>
          <View style={styles.pillWrap}>
            {CUISINE_PREFERENCE_OPTIONS.map((option) => (
              <PillButton
                key={option.key}
                label={option.zhLabel}
                selected={cuisinePreferences.includes(option.key)}
                onPress={() => toggleCuisine(option.key)}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="sparkles-outline" title="想吃的类型" />
          <Text style={styles.helperText}>这些是推荐排序的轻量偏好，不是硬性限制。</Text>
          <View style={styles.pillWrap}>
            {MEAL_STYLE_OPTIONS.map((option) => (
              <PillButton
                key={option.key}
                label={option.zhLabel}
                selected={mealStylePreferences.includes(option.key)}
                onPress={() => setMealStylePreferences((current) => toggleKey(current, option.key))}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="school-outline" title="做饭熟练度" />
          <View style={styles.optionGrid}>
            {COOKING_SKILL_OPTIONS.map((option) => (
              <OptionCard
                key={option.key}
                label={option.zhLabel}
                description={option.zhDescription}
                icon="flame-outline"
                selected={cookingSkill === option.key}
                onPress={() => setCookingSkill(option.key)}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="close-circle-outline" title="忌口与过敏" />
          <Text style={styles.helperText}>具体不想吃的食材会先匹配标准食材字典，匹配不到不会写入。</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={avoidInput}
              onChangeText={setAvoidInput}
              editable={!isBusy}
              placeholder="例如：香菜、蘑菇、虾"
              placeholderTextColor="#9c9087"
              style={styles.textInput}
            />
            <Pressable style={styles.addButton} onPress={addAvoidIngredient} disabled={isBusy}>
              <Ionicons name="add-outline" size={19} color="#ffffff" />
            </Pressable>
          </View>
          {avoidIngredientKeys.length > 0 ? (
            <View style={styles.pillWrap}>
              {avoidIngredientKeys.map((key) => (
                <PillButton
                  key={key}
                  label={key}
                  selected
                  onPress={() => setAvoidIngredientKeys((current) => current.filter((value) => value !== key))}
                />
              ))}
            </View>
          ) : null}
          <Text style={styles.subSectionTitle}>过敏项</Text>
          <View style={styles.pillWrap}>
            {ALLERGEN_OPTIONS.map((option) => (
              <PillButton
                key={option.key}
                label={option.zhLabel}
                selected={allergenKeys.includes(option.key)}
                onPress={() => setAllergenKeys((current) => toggleKey(current, option.key))}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="construct-outline" title="厨房设备" />
          <Text style={styles.helperText}>
            {`基础工具默认假设拥有：${DEFAULT_ASSUMED_KITCHEN_EQUIPMENT_KEYS.map(getEquipmentLabel).join('、')}。这里只问会影响菜谱的关键厨具。`}
          </Text>
          <View style={styles.optionGrid}>
            {KITCHEN_EQUIPMENT_OPTIONS
              .filter((option) => USER_SELECTABLE_KITCHEN_EQUIPMENT_KEYS.includes(option.key))
              .map((option) => (
                <OptionCard
                  key={option.key}
                  label={option.zhLabel}
                  description={option.isMvpDefault ? '推荐默认' : option.enLabel}
                  icon={optionIcon(option.key)}
                  selected={equipmentKeys.includes(option.key)}
                  onPress={() => setEquipmentKeys((current) => toggleKey(current, option.key))}
                />
              ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader icon="basket-outline" title="常备调料与干货" />
          <Text style={styles.helperText}>盐和糖默认不问。九宫格用于高频 pantry，其他调料可以自由输入。</Text>
          <View style={styles.basicPantryBox}>
            <Text style={styles.basicPantryText}>默认已有：{defaultPantryKeys.map(getPantryLabel).join('、')}</Text>
          </View>
          <View style={styles.optionGrid}>
            {quickPantryKeys.map((key) => (
              <OptionCard
                key={key}
                label={getPantryLabel(key)}
                description="快捷选择"
                icon={optionIcon(key)}
                selected={pantryKeys.includes(key)}
                onPress={() => togglePantry(key)}
              />
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              value={pantryInput}
              onChangeText={setPantryInput}
              editable={!isBusy}
              placeholder="自由输入：蚝油 / 郫县豆瓣 / 味噌"
              placeholderTextColor="#9c9087"
              style={styles.textInput}
            />
            <Pressable style={styles.addButton} onPress={addFreePantryItem} disabled={isBusy}>
              <Ionicons name="add-outline" size={19} color="#ffffff" />
            </Pressable>
          </View>
          {matchedPantry ? (
            <Text style={styles.matchText}>已匹配：{matchedPantry.zhName} / {matchedPantry.ingredientKey}</Text>
          ) : null}
          {pantryFridgeCandidate ? (
            <View style={styles.fridgeCandidatePrompt}>
              <View style={styles.fridgeCandidateCopy}>
                <Text style={styles.fridgeCandidateTitle}>这个更像冰箱食材</Text>
                <Text style={styles.fridgeCandidateText}>
                  {pantryFridgeCandidate.displayName} 不会保存到常备 pantry。要加入冰箱库存吗？
                </Text>
              </View>
              <View style={styles.fridgeCandidateActions}>
                <Pressable
                  disabled={isBusy}
                  onPress={dismissPantryFridgeCandidate}
                  style={styles.fridgeCandidateSecondaryButton}
                >
                  <Text style={styles.fridgeCandidateSecondaryText}>不加入</Text>
                </Pressable>
                <Pressable
                  disabled={isBusy}
                  onPress={confirmPantryFridgeCandidate}
                  style={styles.fridgeCandidatePrimaryButton}
                >
                  <Text style={styles.fridgeCandidatePrimaryText}>加入冰箱</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <View style={styles.pillWrap}>
            {pantryKeys
              .filter((key) => !defaultPantryKeys.includes(key))
              .map((key) => (
                <PillButton
                  key={key}
                  label={getPantryLabel(key)}
                  selected
                  onPress={() => togglePantry(key)}
                />
              ))}
          </View>
        </View>

        {showDebug ? (
          <View style={styles.debugPanel}>
            <Pressable style={styles.debugHeader} onPress={() => setDebugOpen((open) => !open)}>
              <Text style={styles.debugTitle}>调试信息</Text>
              <Ionicons name={debugOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color="#6b625b" />
            </Pressable>
            {debugOpen ? (
              <Text style={styles.debugText}>{JSON.stringify(debugContext, null, 2)}</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        {showDebug ? (
          <Pressable
            style={({ pressed }: { pressed: boolean }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setDebugOpen((open) => !open)}
          >
            <Text style={styles.secondaryButtonText}>调试信息</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={isBusy}
          style={({ pressed }: { pressed: boolean }) => [
            styles.saveButton,
            !showDebug && styles.fullWidthSaveButton,
            pressed && !isBusy && styles.buttonPressed,
            isBusy && styles.disabledButton,
          ]}
          onPress={saveProfile}
        >
          {isBusy ? <ActivityIndicator color="#ffffff" /> : null}
          <Text style={styles.saveButtonText}>
            {mode === 'settings' ? '保存修改' : '保存并继续'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function DevUserProfileCheck() {
  return <UserProfileFlow mode="dev" showDebug />
}

function SectionHeader({ icon, title }: { icon: IoniconName; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color="#746b63" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )
}

function PillButton({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.pill,
        selected && styles.pillSelected,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  )
}

function OptionCard({
  label,
  description,
  icon,
  selected,
  onPress,
}: {
  label: string
  description: string
  icon: IoniconName
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.optionCard,
        selected && styles.optionCardSelected,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <Ionicons name={icon} size={24} color={selected ? '#ffffff' : '#7d746c'} />
      </View>
      <Text style={styles.optionLabel} numberOfLines={2}>{label}</Text>
      <Text style={styles.optionDescription} numberOfLines={2}>{description}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: pageColor,
  },
  container: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: UI_PAGE_MAX_WIDTH,
    paddingBottom: 104,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#e5ddd4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: UI_TOP_BAR_SIDE_PADDING,
    paddingTop: 28,
    backgroundColor: '#fff8f1',
  },
  brand: {
    color: '#b55f28',
    flex: 1,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0,
    paddingLeft: 10,
  },
  avatar: {
    alignItems: 'center',
    borderColor: '#ffffff',
    borderRadius: UI_TOP_BUTTON_SIZE / 2,
    borderWidth: 2,
    height: UI_TOP_BUTTON_SIZE,
    justifyContent: 'center',
    width: UI_TOP_BUTTON_SIZE,
    backgroundColor: '#17251f',
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: UI_PAGE_SIDE_PADDING,
    paddingTop: 22,
  },
  heroIcon: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    color: '#2c2824',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    color: '#70665d',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: UI_PAGE_MAX_WIDTH,
    textAlign: 'center',
  },
  topGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginHorizontal: UI_PAGE_SIDE_PADDING,
  },
  topGridCard: {
    flex: 1,
    marginHorizontal: 0,
    minWidth: 280,
  },
  card: {
    borderColor: '#e4dbd2',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    gap: 15,
    marginHorizontal: UI_PAGE_SIDE_PADDING,
    padding: UI_PAGE_SIDE_PADDING_COMPACT,
    backgroundColor: paperColor,
    shadowColor: '#31261f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomColor: '#ebe2d9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 42,
    paddingBottom: 10,
  },
  sectionTitle: {
    color: inkColor,
    fontSize: 22,
    fontWeight: '900',
  },
  helperText: {
    color: '#746b63',
    fontSize: 14,
    lineHeight: 20,
  },
  subSectionTitle: {
    color: inkColor,
    fontSize: 15,
    fontWeight: '900',
  },
  textInput: {
    borderColor: '#d8cec5',
    borderRadius: UI_PILL_RADIUS,
    borderWidth: 1,
    color: '#302a25',
    flex: 1,
    fontSize: 15,
    minHeight: UI_CONTROL_HEIGHT,
    minWidth: 180,
    paddingHorizontal: 13,
    backgroundColor: '#ffffff',
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: UI_TOP_BUTTON_SIZE / 2,
    height: UI_TOP_BUTTON_SIZE,
    justifyContent: 'center',
    width: 48,
    backgroundColor: selectedColor,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    borderColor: '#ded5cc',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: UI_CONTROL_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  pillSelected: {
    borderColor: selectedColor,
    backgroundColor: selectedColor,
  },
  pillText: {
    color: '#5f554d',
    fontSize: 14,
    fontWeight: '800',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    borderColor: '#ded5cc',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    gap: 7,
    minHeight: 132,
    padding: 13,
    width: '47%',
    backgroundColor: '#ffffff',
  },
  optionCardSelected: {
    borderColor: selectedColor,
    backgroundColor: '#fbecdf',
  },
  optionIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
    backgroundColor: '#f4eee8',
  },
  optionIconSelected: {
    backgroundColor: '#dc884d',
  },
  optionLabel: {
    color: inkColor,
    fontSize: 16,
    fontWeight: '900',
  },
  optionDescription: {
    color: '#81776e',
    fontSize: 12,
    lineHeight: 17,
  },
  basicPantryBox: {
    borderColor: '#e7d2bf',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    padding: 12,
    backgroundColor: '#fff1e6',
  },
  basicPantryText: {
    color: '#9a5528',
    fontSize: 14,
    fontWeight: '900',
  },
  matchText: {
    color: '#1f5945',
    fontSize: 13,
    fontWeight: '800',
  },
  fridgeCandidatePrompt: {
    borderColor: '#e2b67a',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    gap: 12,
    padding: 14,
    backgroundColor: '#fff4e8',
  },
  fridgeCandidateCopy: {
    gap: 4,
  },
  fridgeCandidateTitle: {
    color: '#3a3029',
    fontSize: 15,
    fontWeight: '900',
  },
  fridgeCandidateText: {
    color: '#75685f',
    fontSize: 13,
    lineHeight: 19,
  },
  fridgeCandidateActions: {
    flexDirection: 'row',
    gap: 10,
  },
  fridgeCandidatePrimaryButton: {
    alignItems: 'center',
    borderRadius: UI_PILL_RADIUS,
    flex: 1,
    justifyContent: 'center',
    minHeight: UI_CONTROL_HEIGHT,
    backgroundColor: selectedColor,
  },
  fridgeCandidatePrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  fridgeCandidateSecondaryButton: {
    alignItems: 'center',
    borderColor: '#ddd4cb',
    borderRadius: UI_PILL_RADIUS,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: UI_CONTROL_HEIGHT,
    backgroundColor: '#ffffff',
  },
  fridgeCandidateSecondaryText: {
    color: '#5f534b',
    fontSize: 13,
    fontWeight: '900',
  },
  errorPanel: {
    alignItems: 'center',
    borderColor: '#efc5bd',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: UI_PAGE_SIDE_PADDING,
    padding: 12,
    backgroundColor: '#fff1ee',
  },
  errorText: {
    color: '#a33a2d',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  successPanel: {
    alignItems: 'center',
    borderColor: '#bdd8c8',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: UI_PAGE_SIDE_PADDING,
    padding: 12,
    backgroundColor: '#edf8f1',
  },
  successText: {
    color: '#1f5945',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  debugPanel: {
    borderColor: '#e1d8cf',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    marginHorizontal: UI_PAGE_SIDE_PADDING,
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
  bottomBar: {
    alignItems: 'center',
    borderTopColor: '#e4dcd3',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    left: 0,
    minHeight: 78,
    paddingHorizontal: UI_PAGE_SIDE_PADDING,
    position: 'absolute',
    right: 0,
    backgroundColor: 'rgba(255, 250, 245, 0.98)',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#ded5cc',
    borderRadius: UI_PILL_RADIUS,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: UI_CONTROL_HEIGHT,
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#6e645c',
    fontSize: 15,
    fontWeight: '900',
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: UI_PILL_RADIUS,
    flex: 1.4,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: UI_CONTROL_HEIGHT,
    backgroundColor: selectedColor,
  },
  topButtonSlot: {
    height: UI_TOP_BUTTON_SIZE,
    width: UI_TOP_BUTTON_SIZE,
  },
  fullWidthSaveButton: {
    flex: 1,
    maxWidth: UI_PAGE_MAX_WIDTH - UI_PAGE_SIDE_PADDING * 2,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
})
