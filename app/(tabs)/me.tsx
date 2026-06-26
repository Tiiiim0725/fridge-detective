import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { type Href, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { getFridgeInventoryItems } from '@/services/fridgeService'
import { getOnboardingContext } from '@/services/profileService'
import { COOKING_RADIUS } from '@/constants/cookingUi'
import type { FridgeInventoryItem } from '@/types/fridge'
import {
  COOK_TIME_PREFERENCE_OPTIONS,
  COOKING_SKILL_OPTIONS,
  type OnboardingContext,
} from '@/types/profile'

type DashboardData = {
  context: OnboardingContext
  fridgeItems: FridgeInventoryItem[]
}

const ME_RADIUS = COOKING_RADIUS

function cookTimeLabel(context: OnboardingContext): string {
  const key = context.preferences?.cookTimePreferenceKey
  return COOK_TIME_PREFERENCE_OPTIONS.find((option) => option.key === key)?.zhLabel ?? '尚未设置'
}

function cookingSkillLabel(context: OnboardingContext): string {
  const key = context.preferences?.cookingSkill
  return COOKING_SKILL_OPTIONS.find((option) => option.key === key)?.zhLabel ?? '尚未设置'
}

export default function MeScreen() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useFocusEffect(
    useCallback(() => {
      let active = true
      void reloadKey

      async function loadDashboard() {
        setLoading(true)
        setErrorMessage(null)

        try {
          const [context, fridgeItems] = await Promise.all([
            getOnboardingContext(),
            getFridgeInventoryItems(),
          ])

          if (active) {
            setData({
              context,
              fridgeItems: fridgeItems.filter((item) => item.ingredientKey !== null),
            })
          }
        } catch (error) {
          if (active) {
            setErrorMessage(error instanceof Error ? error.message : String(error))
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

      void loadDashboard()
      return () => {
        active = false
      }
    }, [reloadKey])
  )

  const displayName = data?.context.profile.displayName?.trim() || '厨房新朋友'
  const fridgePreview = data?.fridgeItems.slice(0, 4) ?? []
  const priorityFridgeCount = data?.fridgeItems.filter((item) => (
    item.timing.status === 'use_soon' || item.timing.status === 'past_suggested'
  )).length ?? 0

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>冰箱侦探</Text>
          <View style={styles.topButtonSlot} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>我的厨房</Text>
          <Text style={styles.title}>你好，{displayName}</Text>
          <Text style={styles.subtitle}>你的口味、厨房条件和冰箱库存都在这里。</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={21} color="#a33a2d" />
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>暂时没能读取你的厨房</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
            <Pressable onPress={() => setReloadKey((value) => value + 1)} style={styles.retryButton}>
              <Text style={styles.retryText}>重试</Text>
            </Pressable>
          </View>
        ) : null}

        {loading && !data ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#c2652a" />
            <Text style={styles.loadingText}>正在整理你的厨房...</Text>
          </View>
        ) : null}

        {data ? (
          <>
            <Pressable
              onPress={() => router.push('/profile' as Href)}
              style={({ pressed }) => [styles.profileCard, pressed && styles.pressedCard]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Ionicons name="options-outline" size={22} color="#ffffff" />
                </View>
                <View style={styles.cardHeading}>
                  <Text style={styles.cardTitle}>我的口味档案</Text>
                  <Text style={styles.cardSubtitle}>这些信息会影响过滤和推荐排序</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#897b70" />
              </View>

              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>做饭时间</Text>
                  <Text style={styles.statValue}>{cookTimeLabel(data.context)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>熟练度</Text>
                  <Text style={styles.statValue}>{cookingSkillLabel(data.context)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>常备项</Text>
                  <Text style={styles.statValue}>{data.context.pantryItemKeys.length} 项</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>关键厨具</Text>
                  <Text style={styles.statValue}>{data.context.equipmentKeys.length} 件</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/private-fridge' as Href)}
              style={({ pressed }) => [styles.fridgeCard, pressed && styles.pressedCard]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.fridgeIcon]}>
                  <Ionicons name="snow-outline" size={22} color="#ffffff" />
                </View>
                <View style={styles.cardHeading}>
                  <Text style={styles.cardTitle}>私人冰箱</Text>
                  <Text style={styles.cardSubtitle}>
                    {data.fridgeItems.length > 0
                      ? `目前记录了 ${data.fridgeItems.length} 个食材，${priorityFridgeCount} 个建议优先安排`
                      : '冰箱里还没有确认过的食材'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#897b70" />
              </View>

              {fridgePreview.length > 0 ? (
                <>
                  <View style={styles.fridgeStats}>
                    <View style={styles.fridgeStat}>
                      <Text style={styles.fridgeStatValue}>{data.fridgeItems.length}</Text>
                      <Text style={styles.fridgeStatLabel}>当前食材</Text>
                    </View>
                    <View style={styles.fridgeStat}>
                      <Text style={styles.fridgeStatValue}>{priorityFridgeCount}</Text>
                      <Text style={styles.fridgeStatLabel}>建议优先</Text>
                    </View>
                  </View>

                  <View style={styles.fridgePreview}>
                    {fridgePreview.map((item) => (
                      <View key={item.id} style={styles.ingredientPill}>
                        <Text style={styles.ingredientPillText}>{item.displayName}</Text>
                      </View>
                    ))}
                    {data.fridgeItems.length > fridgePreview.length ? (
                      <Text style={styles.moreText}>+{data.fridgeItems.length - fridgePreview.length}</Text>
                    ) : null}
                  </View>
                </>
              ) : (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation()
                    router.push('/fridge-scan' as Href)
                  }}
                  style={styles.scanPrompt}
                >
                  <Ionicons name="camera-outline" size={20} color="#c2652a" />
                  <Text style={styles.scanPromptText}>拍一下，建立你的冰箱记录</Text>
                </Pressable>
              )}
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#faf5ee' },
  container: { alignSelf: 'center', maxWidth: 760, paddingBottom: 40, width: '100%' },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#e6ddd4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  brand: { color: '#b55f28', flex: 1, fontSize: 25, fontWeight: '900' },
  topButtonSlot: { height: 48, width: 48 },
  hero: { paddingHorizontal: 24, paddingBottom: 26, paddingTop: 34 },
  eyebrow: { color: '#c2652a', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  title: { color: '#332e29', fontSize: 34, fontWeight: '900', lineHeight: 42 },
  subtitle: { color: '#766c64', fontSize: 16, lineHeight: 24, marginTop: 8 },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: ME_RADIUS,
    gap: 10,
    marginHorizontal: 22,
    padding: 28,
  },
  loadingText: { color: '#766c64' },
  errorCard: {
    alignItems: 'flex-start',
    backgroundColor: '#fff4f1',
    borderColor: '#e9c8c1',
    borderRadius: ME_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    marginHorizontal: 22,
    padding: 16,
  },
  errorCopy: { flex: 1 },
  errorTitle: { color: '#74372f', fontWeight: '900', marginBottom: 4 },
  errorText: { color: '#8d4a40', fontSize: 13, lineHeight: 19 },
  retryButton: { paddingHorizontal: 8, paddingVertical: 4 },
  retryText: { color: '#a33a2d', fontWeight: '900' },
  profileCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e8ded5',
    borderRadius: ME_RADIUS,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 22,
    padding: 20,
  },
  fridgeCard: {
    backgroundColor: '#fffdf9',
    borderColor: '#ded1c5',
    borderRadius: ME_RADIUS,
    borderWidth: 1,
    marginHorizontal: 22,
    padding: 20,
    shadowColor: '#3a302a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  pressedCard: { opacity: 0.78, transform: [{ scale: 0.995 }] },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  fridgeIcon: { backgroundColor: '#c2652a' },
  cardHeading: { flex: 1 },
  cardTitle: { color: '#332e29', fontSize: 19, fontWeight: '900' },
  cardSubtitle: { color: '#7d726a', fontSize: 13, lineHeight: 19, marginTop: 3 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  statItem: {
    backgroundColor: '#faf6f2',
    borderRadius: ME_RADIUS,
    minWidth: '46%',
    padding: 13,
  },
  statLabel: { color: '#8a7f76', fontSize: 12, marginBottom: 5 },
  statValue: { color: '#3b342f', fontSize: 15, fontWeight: '900' },
  fridgeStats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  fridgeStat: {
    backgroundColor: '#fbf7f2',
    borderColor: '#e8ded5',
    borderRadius: ME_RADIUS,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  fridgeStatValue: { color: '#332e29', fontSize: 19, fontWeight: '900' },
  fridgeStatLabel: { color: '#7d726a', fontSize: 12, fontWeight: '800', marginTop: 3 },
  fridgePreview: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  ingredientPill: {
    backgroundColor: '#fff0e5',
    borderColor: '#edc9ac',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ingredientPillText: { color: '#9e5129', fontSize: 13, fontWeight: '800' },
  moreText: { color: '#c2652a', fontSize: 13, fontWeight: '900' },
  scanPrompt: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 18 },
  scanPromptText: { color: '#9e5129', fontSize: 14, fontWeight: '900' },
})
