import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import type {
  FridgeInventoryItem,
  FridgeInventoryTimingStatus,
  FridgeStorageLocation,
} from '@/types/fridge'

type Tone = {
  backgroundColor: string
  borderColor: string
  iconColor: string
  textColor: string
  accentColor: string
}

const STATUS_TONES: Record<FridgeInventoryTimingStatus, Tone> = {
  comfortable: {
    backgroundColor: '#edf6f0',
    borderColor: '#cfe3d7',
    iconColor: '#3f7958',
    textColor: '#315442',
    accentColor: '#3f7958',
  },
  use_soon: {
    backgroundColor: '#fff5df',
    borderColor: '#ecd69c',
    iconColor: '#b56b19',
    textColor: '#7a4a14',
    accentColor: '#d18424',
  },
  past_suggested: {
    backgroundColor: '#fff0ed',
    borderColor: '#efc6bd',
    iconColor: '#a33a2d',
    textColor: '#7d342d',
    accentColor: '#c24f3f',
  },
  unknown: {
    backgroundColor: '#f4f0eb',
    borderColor: '#e2d7cd',
    iconColor: '#7d726a',
    textColor: '#60564f',
    accentColor: '#8a7f76',
  },
}

const STORAGE_LOCATION_LABELS: Record<FridgeStorageLocation, string> = {
  fridge: '冷藏',
  freezer: '冷冻',
  pantry: '常温储物',
  room_temp: '室温',
}

const EXPIRY_SOURCE_LABELS: Record<FridgeInventoryItem['expirySource'], string> = {
  system_suggested: '系统建议',
  user_override: '手动调整',
  unknown: '待确认',
}

const STATUS_ICON_NAMES: Record<FridgeInventoryTimingStatus, keyof typeof Ionicons.glyphMap> = {
  comfortable: 'checkmark-circle-outline',
  use_soon: 'time-outline',
  past_suggested: 'alert-circle-outline',
  unknown: 'help-circle-outline',
}

function quantityLabel(item: FridgeInventoryItem): string {
  if (item.quantityKind === 'count' && typeof item.quantityCount === 'number') {
    return `${item.quantityCount} 个`
  }

  if (item.quantityKind === 'text' && item.quantityText) {
    return item.quantityText
  }

  return '数量未记录'
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

function fullDateLabel(value: string | null): string {
  if (!value) {
    return '未记录'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '未记录'
  }

  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function suggestedDateLabel(item: FridgeInventoryItem): string {
  return fullDateLabel(item.timing.suggestedUseBy)
}

export function FridgeInventoryCard({ item, compact = false }: {
  item: FridgeInventoryItem
  compact?: boolean
}) {
  const tone = STATUS_TONES[item.timing.status]

  return (
    <View style={[styles.card, { borderLeftColor: tone.accentColor }, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={[styles.itemIcon, { backgroundColor: tone.accentColor }]}>
          <Ionicons name="leaf-outline" size={21} color="#ffffff" />
        </View>
        <View style={styles.heading}>
          <Text style={styles.name} numberOfLines={2}>{item.displayName}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {quantityLabel(item)} · {STORAGE_LOCATION_LABELS[item.storageLocation]}
          </Text>
        </View>
        <View style={[styles.sourcePill, { backgroundColor: tone.backgroundColor }]}>
          <Text style={[styles.sourceText, { color: tone.textColor }]}>{EXPIRY_SOURCE_LABELS[item.expirySource]}</Text>
        </View>
      </View>

      <View style={[styles.timingBadge, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
        <Ionicons name={STATUS_ICON_NAMES[item.timing.status]} size={17} color={tone.iconColor} />
        <Text style={[styles.timingText, { color: tone.textColor }]} numberOfLines={2}>
          {item.timing.label}
        </Text>
      </View>

      <View style={styles.detailGrid}>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>建议食用时间</Text>
          <Text style={styles.detailValue}>{suggestedDateLabel(item)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>存放时间</Text>
          <Text style={styles.detailValue}>{dateLabel(item.storedAt)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>开封时间</Text>
          <Text style={styles.detailValue}>{dateLabel(item.openedAt)}</Text>
        </View>
        <View style={styles.detailCell}>
          <Text style={styles.detailLabel}>最近确认</Text>
          <Text style={styles.detailValue}>{dateLabel(item.lastSeenAt)}</Text>
        </View>
      </View>

      {!compact ? (
        <Text style={styles.helperText} numberOfLines={3}>
          {item.guideline?.note ?? item.timing.helperText}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd5',
    borderRadius: 8,
    borderLeftWidth: 5,
    borderWidth: 1,
    minHeight: 214,
    padding: 16,
    width: '100%',
  },
  compactCard: { minHeight: 176 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 50 },
  itemIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  heading: { flex: 1, minWidth: 0 },
  name: { color: '#332e29', fontSize: 17, fontWeight: '900', lineHeight: 22 },
  meta: { color: '#766b63', fontSize: 12, marginTop: 3 },
  sourcePill: {
    borderRadius: 8,
    minWidth: 66,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sourceText: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  timingBadge: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timingText: { flex: 1, fontSize: 13, fontWeight: '900', lineHeight: 17 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 13 },
  detailCell: {
    backgroundColor: '#faf7f3',
    borderRadius: 8,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '48%',
  },
  detailLabel: { color: '#978c82', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  detailValue: { color: '#453d37', fontSize: 12, fontWeight: '900' },
  helperText: { color: '#766b63', fontSize: 12, lineHeight: 17, marginTop: 12 },
})
