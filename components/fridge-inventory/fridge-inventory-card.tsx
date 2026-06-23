import { StyleSheet, Text, View } from 'react-native'

import type {
  FridgeInventoryItem,
  FridgeInventoryTimingStatus,
  FridgeStorageLocation,
} from '@/types/fridge'

type Tone = {
  accentColor: string
  backgroundColor: string
  borderColor: string
  glowColor: string
  softBackgroundColor: string
  textColor: string
}

const DAY_MS = 24 * 60 * 60 * 1000

const STATUS_TONES: Record<FridgeInventoryTimingStatus, Tone> = {
  comfortable: {
    accentColor: '#10b981',
    backgroundColor: '#f3fff8',
    borderColor: '#9fe8c0',
    glowColor: '#dff9eb',
    softBackgroundColor: '#e9fff3',
    textColor: '#066c49',
  },
  use_soon: {
    accentColor: '#d48825',
    backgroundColor: '#fffaf0',
    borderColor: '#f1d188',
    glowColor: '#fff1c9',
    softBackgroundColor: '#fff4d9',
    textColor: '#895312',
  },
  past_suggested: {
    accentColor: '#c45d4e',
    backgroundColor: '#fff7f5',
    borderColor: '#f0bdb4',
    glowColor: '#ffe2dd',
    softBackgroundColor: '#fff0ed',
    textColor: '#8b352c',
  },
  unknown: {
    accentColor: '#8a7f76',
    backgroundColor: '#fbf7f2',
    borderColor: '#ded1c5',
    glowColor: '#f1e7dd',
    softBackgroundColor: '#f5efe8',
    textColor: '#5f564f',
  },
}

const STORAGE_LOCATION_LABELS: Record<FridgeStorageLocation, string> = {
  fridge: '冷藏',
  freezer: '冷冻',
  pantry: '常温',
  room_temp: '室温',
}

const INGREDIENT_ICON_RULES: Array<[RegExp, string]> = [
  [/番茄|西红柿|tomato/i, '🍅'],
  [/黄瓜|cucumber/i, '🥒'],
  [/欧芹|香菜|parsley|cilantro/i, '🌿'],
  [/卷心菜|圆白菜|包菜|cabbage/i, '🥬'],
  [/橙|橘|柑|orange|citrus/i, '🍊'],
  [/鸡蛋|蛋|egg/i, '🥚'],
  [/牛奶|奶|milk/i, '🥛'],
  [/牛肉|牛排|beef|steak/i, '🥩'],
  [/猪肉|pork/i, '🥓'],
  [/鸡肉|chicken/i, '🍗'],
  [/鱼|三文鱼|salmon|fish/i, '🐟'],
  [/虾|shrimp/i, '🦐'],
  [/蘑菇|菌|mushroom/i, '🍄'],
  [/胡萝卜|carrot/i, '🥕'],
  [/土豆|马铃薯|potato/i, '🥔'],
  [/洋葱|onion/i, '🧅'],
  [/辣椒|甜椒|椒|pepper/i, '🫑'],
  [/生菜|lettuce/i, '🥬'],
  [/苹果|apple/i, '🍎'],
  [/香蕉|banana/i, '🍌'],
  [/柠檬|lemon/i, '🍋'],
  [/米饭|饭|rice/i, '🍚'],
  [/豆腐|tofu/i, '◻️'],
]

function quantityLabel(item: FridgeInventoryItem): string | null {
  if (item.quantityKind === 'count' && typeof item.quantityCount === 'number') {
    return `${item.quantityCount}个`
  }

  if (item.quantityKind === 'text' && item.quantityText) {
    return item.quantityText
  }

  return null
}

function dateLabel(value: string | null): string {
  if (!value) {
    return '未记录'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '未记录'
  }

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function daysBetween(startValue: string | null, endValue: string | null): number | null {
  if (!startValue || !endValue) return null

  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }

  return Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS))
}

function ingredientIcon(item: FridgeInventoryItem): string {
  const haystack = `${item.displayName} ${item.rawName} ${item.ingredientKey ?? ''}`

  for (const [pattern, icon] of INGREDIENT_ICON_RULES) {
    if (pattern.test(haystack)) return icon
  }

  return '🥡'
}

function remainingDays(item: FridgeInventoryItem): number | null {
  return item.timing.daysUntilSuggestedUseBy
}

function freshnessPercent(item: FridgeInventoryItem): number | null {
  const daysLeft = remainingDays(item)
  const totalDays = item.guideline?.suggestedDaysMax
    ?? daysBetween(item.storedAt, item.expiresAt ?? item.timing.suggestedUseBy)

  if (daysLeft === null || totalDays === null || totalDays <= 0) {
    return null
  }

  const value = Math.round((Math.max(0, daysLeft) / totalDays) * 100)
  return Math.max(0, Math.min(100, value))
}

function remainingLabel(item: FridgeInventoryItem): string {
  const daysLeft = remainingDays(item)

  if (daysLeft === null) return '待补充'
  if (daysLeft > 0) return `剩 ${daysLeft}天`
  if (daysLeft === 0) return '今天优先'
  return `超建议 ${Math.abs(daysLeft)}天`
}

function freshnessLabel(item: FridgeInventoryItem): string {
  const percent = freshnessPercent(item)
  return percent === null ? '--' : `${percent}%`
}

function timingShortLabel(status: FridgeInventoryTimingStatus): string {
  if (status === 'use_soon') return '优先'
  if (status === 'past_suggested') return '超建议'
  if (status === 'unknown') return '待补充'
  return '状态舒适'
}

export function FridgeInventoryCard({ item }: { item: FridgeInventoryItem }) {
  const tone = STATUS_TONES[item.timing.status]
  const quantity = quantityLabel(item)

  return (
    <View style={styles.cardStage}>
      <View style={[styles.cardGlow, { backgroundColor: tone.glowColor }]} />
      <View style={[styles.card, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
        <View style={[styles.cap, { backgroundColor: tone.accentColor }]} />

        <View style={styles.iconBay}>
          <Text style={styles.iconText}>{ingredientIcon(item)}</Text>
        </View>

        <View style={[styles.namePill, { borderColor: tone.borderColor, backgroundColor: tone.softBackgroundColor }]}>
          <View style={[styles.statusDot, { backgroundColor: tone.accentColor }]} />
          <Text style={styles.nameText} numberOfLines={1}>{item.displayName}</Text>
        </View>

        <View style={styles.metricRow}>
          <View style={[styles.freshnessBadge, { backgroundColor: tone.softBackgroundColor }]}>
            <Text style={[styles.freshnessValue, { color: tone.textColor }]}>
              {freshnessLabel(item)}
            </Text>
            <Text style={[styles.metricLabel, { color: tone.textColor }]}>建议鲜度</Text>
          </View>
          <View style={styles.remainingBox}>
            <Text style={[styles.remainingValue, { color: tone.textColor }]}>{remainingLabel(item)}</Text>
          </View>
        </View>

        <View style={styles.miniMetaRow}>
          <Text style={styles.miniMetaText} numberOfLines={1}>
            {quantity ? `${quantity} · ` : ''}{STORAGE_LOCATION_LABELS[item.storageLocation]}
          </Text>
          <Text style={styles.miniMetaText} numberOfLines={1}>
            到 {dateLabel(item.expiresAt ?? item.timing.suggestedUseBy)}
          </Text>
        </View>

        <Text style={[styles.shortStatus, { color: tone.textColor }]} numberOfLines={1}>
          {timingShortLabel(item.timing.status)}
        </Text>
      </View>
      <View style={styles.contactShadow} />
    </View>
  )
}

const styles = StyleSheet.create({
  cardStage: {
    paddingBottom: 8,
    position: 'relative',
    width: '48%',
  },
  cardGlow: {
    borderRadius: 8,
    bottom: 18,
    left: 8,
    opacity: 0.7,
    position: 'absolute',
    right: 8,
    top: 18,
  },
  card: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 184,
    overflow: 'hidden',
    paddingBottom: 12,
    paddingHorizontal: 10,
    paddingTop: 16,
    position: 'relative',
    shadowColor: '#3a302a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  cap: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    height: 11,
    position: 'absolute',
    top: 0,
    width: 42,
  },
  iconBay: {
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
    marginBottom: 7,
    marginTop: 7,
  },
  iconText: {
    fontSize: 38,
    lineHeight: 48,
    textAlign: 'center',
  },
  namePill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    maxWidth: '100%',
    minHeight: 30,
    paddingHorizontal: 9,
  },
  statusDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  nameText: {
    color: '#26352f',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  freshnessBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  freshnessValue: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 20,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    marginTop: 1,
  },
  remainingBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  remainingValue: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  miniMetaRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    marginTop: 9,
    width: '100%',
  },
  miniMetaText: {
    color: '#8a7f76',
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  shortStatus: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 7,
  },
  contactShadow: {
    alignSelf: 'center',
    backgroundColor: '#4a3424',
    borderRadius: 999,
    height: 7,
    marginTop: -3,
    opacity: 0.09,
    width: '70%',
  },
})
