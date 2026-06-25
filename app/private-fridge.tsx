import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { type Href, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { FridgeInventoryCard } from '@/components/fridge-inventory'
import { getFridgeInventoryItems } from '@/services/fridgeService'
import type {
  FridgeInventoryItem,
  FridgeInventoryTimingStatus,
  FridgeStorageLocation,
} from '@/types/fridge'

type InventoryFilter = 'all' | 'priority' | 'comfortable' | 'unknown'

const FILTER_OPTIONS: Array<{
  key: InventoryFilter
  label: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
}> = [
  { key: 'all', label: '全部储藏', description: '查看所有食材', icon: 'search-outline' },
  { key: 'priority', label: '优先安排', description: '先进入菜谱', icon: 'warning-outline' },
  { key: 'comfortable', label: '鲜度舒适', description: '余量更从容', icon: 'ellipse' },
  { key: 'unknown', label: '待补信息', description: '缺少建议时间', icon: 'create-outline' },
]

const STORAGE_LOCATION_LABELS: Record<FridgeStorageLocation, string> = {
  fridge: '冷藏区',
  freezer: '冷冻区',
  pantry: '常温储物',
  room_temp: '室温区',
}

const STORAGE_LOCATION_META: Record<FridgeStorageLocation, string> = {
  fridge: '按建议鲜度排列',
  freezer: '适合长期安排',
  pantry: '常温食材记录',
  room_temp: '室温食材记录',
}

const STORAGE_LOCATION_ORDER: FridgeStorageLocation[] = ['fridge', 'freezer', 'room_temp', 'pantry']

function isPriorityStatus(status: FridgeInventoryTimingStatus): boolean {
  return status === 'use_soon' || status === 'past_suggested'
}

function countByStatus(items: FridgeInventoryItem[], status: FridgeInventoryTimingStatus): number {
  return items.filter((item) => item.timing.status === status).length
}

function applyInventoryFilter(items: FridgeInventoryItem[], filter: InventoryFilter): FridgeInventoryItem[] {
  if (filter === 'priority') {
    return items.filter((item) => isPriorityStatus(item.timing.status))
  }

  if (filter === 'comfortable') {
    return items.filter((item) => item.timing.status === 'comfortable')
  }

  if (filter === 'unknown') {
    return items.filter((item) => item.timing.status === 'unknown')
  }

  return items
}

function groupedByLocation(items: FridgeInventoryItem[]): Array<{
  key: FridgeStorageLocation
  items: FridgeInventoryItem[]
}> {
  return STORAGE_LOCATION_ORDER
    .map((location) => ({
      key: location,
      items: items
        .filter((item) => item.storageLocation === location)
        .sort((left, right) => {
          const leftDays = left.timing.daysUntilSuggestedUseBy ?? Number.POSITIVE_INFINITY
          const rightDays = right.timing.daysUntilSuggestedUseBy ?? Number.POSITIVE_INFINITY
          return leftDays - rightDays
        }),
    }))
    .filter((group) => group.items.length > 0)
}

function filterCount(items: FridgeInventoryItem[], filter: InventoryFilter, priorityCount: number): number {
  if (filter === 'all') return items.length
  if (filter === 'priority') return priorityCount
  if (filter === 'comfortable') return countByStatus(items, 'comfortable')
  return countByStatus(items, 'unknown')
}

export default function PrivateFridgeScreen() {
  const router = useRouter()
  const [items, setItems] = useState<FridgeInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>('all')

  const priorityCount = useMemo(
    () => items.filter((item) => isPriorityStatus(item.timing.status)).length,
    [items]
  )
  const filteredItems = useMemo(
    () => applyInventoryFilter(items, activeFilter),
    [activeFilter, items]
  )
  const locationGroups = useMemo(
    () => groupedByLocation(filteredItems),
    [filteredItems]
  )

  useFocusEffect(
    useCallback(() => {
      let active = true
      void reloadKey

      async function loadItems() {
        setLoading(true)
        setErrorMessage(null)

        try {
          const currentItems = await getFridgeInventoryItems()
          if (active) {
            setItems(currentItems.filter((item) => item.ingredientKey !== null))
          }
        } catch (error) {
          if (active) setErrorMessage(error instanceof Error ? error.message : String(error))
        } finally {
          if (active) setLoading(false)
        }
      }

      void loadItems()
      return () => {
        active = false
      }
    }, [reloadKey])
  )

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back-outline" size={25} color="#463f39" />
        </Pressable>
        <Text style={styles.topBarTitle}>私人冰箱</Text>
        <Pressable onPress={() => router.push('/fridge-scan' as Href)} style={styles.iconButton}>
          <Ionicons name="camera-outline" size={24} color="#c2652a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>AURA 私人电子冰箱</Text>
          <Text style={styles.title}>现在冰箱里有什么</Text>
          <Text style={styles.subtitle}>按最近确认时间和公共保存建议，帮你安排优先吃什么。</Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#3f7958" />
            <Text style={styles.stateText}>正在打开冰箱...</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#a33a2d" />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable onPress={() => setReloadKey((value) => value + 1)}>
              <Text style={styles.retryText}>重试</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !errorMessage && items.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="snow-outline" size={32} color="#3f7958" />
            </View>
            <Text style={styles.emptyTitle}>冰箱记录还是空的</Text>
            <Text style={styles.emptyText}>拍几张照片并确认食材后，它们会出现在这里。</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/fridge-scan' as Href)}>
              <Ionicons name="camera-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>拍一下冰箱</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !errorMessage && items.length > 0 ? (
          <>
            <View style={styles.shortcutPanel}>
              <View style={styles.shortcutHeader}>
                <View>
                  <Text style={styles.shortcutTitle}>🔑 AURA 食材鲜度捷径</Text>
                  <Text style={styles.shortcutSubtitle}>滑动筛选，只看你现在最关心的食材</Text>
                </View>
                <Pressable style={styles.scanMiniButton} onPress={() => router.push('/fridge-scan' as Href)}>
                  <Ionicons name="camera-outline" size={18} color="#ffffff" />
                  <Text style={styles.scanMiniButtonText}>更新</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shortcutList}
              >
                {FILTER_OPTIONS.map((option) => {
                  const selected = activeFilter === option.key
                  const count = filterCount(items, option.key, priorityCount)
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setActiveFilter(option.key)}
                      style={[styles.shortcutCard, selected && styles.shortcutCardActive]}
                    >
                      <View style={styles.shortcutCardTop}>
                        <Ionicons
                          name={option.icon}
                          size={19}
                          color={selected ? '#c2652a' : '#4f4740'}
                        />
                        <View style={[styles.shortcutCountPill, selected && styles.shortcutCountPillActive]}>
                          <Text style={[styles.shortcutCountText, selected && styles.shortcutCountTextActive]}>
                            {count}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.shortcutCardTitle, selected && styles.shortcutCardTitleActive]}>
                        {option.label}
                      </Text>
                      <Text style={styles.shortcutCardSubtitle}>{option.description}</Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>

            <View style={styles.fridgeShell}>
              <View style={styles.fridgeTopGlow} />
              <View style={styles.fridgeLeftWall} />
              <View style={styles.fridgeRightWall} />
              <View style={styles.fridgeHeader}>
                <View>
                  <Text style={styles.fridgeKicker}>智能电子冰箱</Text>
                  <Text style={styles.fridgeTitle}>门内食材陈列</Text>
                </View>
                <View style={styles.temperaturePill}>
                  <Ionicons name="snow-outline" size={16} color="#c2652a" />
                  <Text style={styles.temperatureText}>{items.length} 项</Text>
                </View>
              </View>

              {locationGroups.length > 0 ? (
                <View style={styles.locationList}>
                  {locationGroups.map((group) => (
                    <View key={group.key} style={styles.locationSection}>
                      <View style={styles.locationSideLight} />
                      <View style={styles.locationHeader}>
                        <View style={styles.locationTitleGroup}>
                          <View style={styles.locationBadge}>
                            <Ionicons name="layers-outline" size={14} color="#c2652a" />
                            <Text style={styles.locationBadgeText}>AURA SHELF</Text>
                          </View>
                          <Text style={styles.locationTitle}>{STORAGE_LOCATION_LABELS[group.key]}</Text>
                          <Text style={styles.locationMeta}>{STORAGE_LOCATION_META[group.key]}</Text>
                        </View>
                        <View style={styles.locationCountPill}>
                          <Text style={styles.locationCount}>{group.items.length} 项</Text>
                        </View>
                      </View>

                      <View style={styles.shelf}>
                        <View style={styles.shelfBackPanel} />
                        <View style={styles.grid}>
                          {group.items.map((item) => (
                            <FridgeInventoryCard key={item.id} item={item} />
                          ))}
                        </View>
                        <View style={styles.shelfFrontRail}>
                          <View style={styles.shelfFrontHighlight} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.filteredEmpty}>
                  <Ionicons name="filter-outline" size={24} color="#8a7f76" />
                  <Text style={styles.filteredEmptyTitle}>这个筛选下暂时没有食材</Text>
                  <Text style={styles.filteredEmptyText}>切回全部，可以查看当前所有冰箱记录。</Text>
                </View>
              )}
            </View>

            <View style={styles.safetyNote}>
              <Ionicons name="information-circle-outline" size={18} color="#7d726a" />
              <Text style={styles.safetyNoteText}>
                建议食用时间只用于安排做饭顺序，实际处理前仍需结合外观、气味和包装日期判断。
              </Text>
            </View>

            <Pressable style={styles.updateButton} onPress={() => router.push('/fridge-scan' as Href)}>
              <Ionicons name="camera-outline" size={21} color="#ffffff" />
              <Text style={styles.updateButtonText}>重新拍一下冰箱</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#faf5ee' },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#faf5ee',
    borderBottomColor: '#d8d0c8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  iconButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  topBarTitle: { color: '#c2652a', flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  container: { alignSelf: 'center', maxWidth: 430, paddingBottom: 50, width: '100%' },
  hero: { paddingHorizontal: 20, paddingBottom: 18, paddingTop: 26 },
  eyebrow: { color: '#c2652a', fontSize: 12, fontWeight: '900', marginBottom: 7 },
  title: { color: '#332e29', fontSize: 30, fontWeight: '900', lineHeight: 36 },
  subtitle: { color: '#766c64', fontSize: 14, lineHeight: 21, marginTop: 7 },
  stateCard: { alignItems: 'center', gap: 10, padding: 34 },
  stateText: { color: '#766c64' },
  errorCard: {
    alignItems: 'center',
    backgroundColor: '#fff2ef',
    borderRadius: 18,
    gap: 10,
    marginHorizontal: 22,
    padding: 20,
  },
  errorText: { color: '#8d4a40', lineHeight: 20, textAlign: 'center' },
  retryText: { color: '#a33a2d', fontWeight: '900' },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e6ddd4',
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 22,
    padding: 32,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#eaf2ed',
    borderRadius: 31,
    height: 62,
    justifyContent: 'center',
    marginBottom: 18,
    width: 62,
  },
  emptyTitle: { color: '#332e29', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  emptyText: { color: '#776c64', lineHeight: 22, marginBottom: 22, textAlign: 'center' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 26,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 24,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  shortcutPanel: {
    backgroundColor: '#f3eadf',
    borderBottomColor: '#ded1c5',
    borderBottomWidth: 1,
    borderRadius: 8,
    borderTopColor: '#f9f3eb',
    borderTopWidth: 1,
    marginBottom: 18,
    marginHorizontal: 12,
    overflow: 'hidden',
    paddingBottom: 14,
    paddingTop: 14,
    shadowColor: '#3a302a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  shortcutHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  shortcutTitle: { color: '#c2652a', fontSize: 15, fontWeight: '900', letterSpacing: 0 },
  shortcutSubtitle: { color: '#766b63', fontSize: 11, fontWeight: '800', marginTop: 4 },
  shortcutList: { gap: 10, paddingHorizontal: 14, paddingTop: 14 },
  shortcutCard: {
    backgroundColor: '#fffaf4',
    borderColor: '#ece2d8',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 106,
    padding: 12,
    width: 168,
  },
  shortcutCardActive: {
    backgroundColor: '#f5e3d4',
    borderColor: '#c2652a',
    borderWidth: 2,
  },
  shortcutCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shortcutCountPill: {
    backgroundColor: '#e9e1d8',
    borderRadius: 8,
    minWidth: 34,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  shortcutCountPillActive: { backgroundColor: '#c2652a' },
  shortcutCountText: { color: '#665b52', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  shortcutCountTextActive: { color: '#ffffff' },
  shortcutCardTitle: { color: '#332e29', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  shortcutCardTitleActive: { color: '#c2652a' },
  shortcutCardSubtitle: { color: '#766b63', fontSize: 12, fontWeight: '800', lineHeight: 17 },
  scanMiniButton: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  scanMiniButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  fridgeShell: {
    backgroundColor: '#fffaf1',
    borderColor: '#dfd1c1',
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
    paddingBottom: 14,
    paddingHorizontal: 10,
    paddingTop: 12,
    position: 'relative',
    shadowColor: '#3a302a',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 34,
  },
  fridgeTopGlow: {
    backgroundColor: '#fff3df',
    borderBottomColor: '#f1d9bd',
    borderBottomWidth: 1,
    height: 38,
    left: 0,
    opacity: 0.82,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  fridgeLeftWall: {
    backgroundColor: '#eadfce',
    bottom: 0,
    left: 0,
    opacity: 0.5,
    position: 'absolute',
    top: 0,
    width: 10,
  },
  fridgeRightWall: {
    backgroundColor: '#ffffff',
    bottom: 0,
    opacity: 0.62,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 10,
  },
  fridgeHeader: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 253, 249, 0.82)',
    borderColor: '#e4d5c5',
    borderRadius: 8,
    borderWidth: 1,
    borderBottomColor: '#e4d5c5',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    position: 'relative',
  },
  fridgeKicker: { color: '#c2652a', fontSize: 11, fontWeight: '900' },
  fridgeTitle: { color: '#332e29', fontSize: 20, fontWeight: '900', marginTop: 2 },
  temperaturePill: {
    alignItems: 'center',
    backgroundColor: '#fff0e5',
    borderColor: '#edc9ac',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  temperatureText: { color: '#9e5129', fontSize: 11, fontWeight: '900' },
  locationList: { gap: 16, paddingTop: 14, position: 'relative' },
  locationSection: {
    backgroundColor: '#fffdf8',
    borderColor: '#e7dacb',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#7d5b3e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  locationSideLight: {
    backgroundColor: '#c2652a',
    bottom: 0,
    left: 0,
    opacity: 0.16,
    position: 'absolute',
    top: 0,
    width: 5,
  },
  locationHeader: {
    alignItems: 'flex-start',
    backgroundColor: '#f7efe4',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingLeft: 15,
    paddingRight: 12,
    paddingTop: 12,
  },
  locationTitleGroup: { flex: 1, minWidth: 0 },
  locationBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff7ec',
    borderColor: '#edcfb4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  locationBadgeText: { color: '#9e5129', fontSize: 9, fontWeight: '900' },
  locationTitle: { color: '#332e29', fontSize: 17, fontWeight: '900' },
  locationMeta: { color: '#7d726a', fontSize: 11, lineHeight: 16, marginTop: 3 },
  locationCountPill: {
    backgroundColor: '#ffffff',
    borderColor: '#e6d8ca',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationCount: { color: '#c2652a', fontSize: 12, fontWeight: '900' },
  shelf: {
    backgroundColor: '#fffbf4',
    borderTopColor: '#ffffff',
    borderTopWidth: 1,
    overflow: 'hidden',
    paddingBottom: 22,
    paddingTop: 16,
    position: 'relative',
  },
  shelfBackPanel: {
    backgroundColor: '#f5eadb',
    borderColor: '#efe0cf',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 18,
    left: 12,
    opacity: 0.42,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  shelfFrontRail: {
    backgroundColor: '#ead8c4',
    borderTopColor: '#ffffff',
    borderTopWidth: 1,
    bottom: 0,
    height: 16,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  shelfFrontHighlight: {
    alignSelf: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 2,
    height: 3,
    marginTop: 3,
    opacity: 0.38,
    width: '72%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 12,
    position: 'relative',
  },
  filteredEmpty: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd5',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 16,
    padding: 24,
  },
  filteredEmptyTitle: { color: '#332e29', fontSize: 17, fontWeight: '900' },
  filteredEmptyText: { color: '#766b63', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  safetyNote: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 22,
    marginTop: 18,
  },
  safetyNoteText: { color: '#766b63', flex: 1, fontSize: 12, lineHeight: 18 },
  updateButton: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 27,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginHorizontal: 22,
    marginTop: 24,
    minHeight: 54,
  },
  updateButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
})
