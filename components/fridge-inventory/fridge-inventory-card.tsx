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
}

const STATUS_TONES: Record<FridgeInventoryTimingStatus, Tone> = {
  comfortable: {
    backgroundColor: '#edf6f0',
    borderColor: '#cfe3d7',
    iconColor: '#3f7958',
    textColor: '#315442',
  },
  use_soon: {
    backgroundColor: '#fff5df',
    borderColor: '#ecd69c',
    iconColor: '#b56b19',
    textColor: '#7a4a14',
  },
  past_suggested: {
    backgroundColor: '#fff0ed',
    borderColor: '#efc6bd',
    iconColor: '#a33a2d',
    textColor: '#7d342d',
  },
  unknown: {
    backgroundColor: '#f4f0eb',
    borderColor: '#e2d7cd',
    iconColor: '#7d726a',
    textColor: '#60564f',
  },
}

const STORAGE_LOCATION_LABELS: Record<FridgeStorageLocation, string> = {
  fridge: '冷藏',
  freezer: '冷冻',
  pantry: '常温储物',
  room_temp: '室温',
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

export function FridgeInventoryCard({ item }: { item: FridgeInventoryItem }) {
  const tone = STATUS_TONES[item.timing.status]

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.itemIcon}>
          <Ionicons name="leaf-outline" size={22} color="#ffffff" />
        </View>
        <View style={styles.heading}>
          <Text style={styles.name} numberOfLines={2}>{item.displayName}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {quantityLabel(item)} · {STORAGE_LOCATION_LABELS[item.storageLocation]}
          </Text>
        </View>
      </View>

      <View style={[styles.timingBadge, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
        <Ionicons name="time-outline" size={16} color={tone.iconColor} />
        <Text style={[styles.timingText, { color: tone.textColor }]} numberOfLines={2}>
          {item.timing.label}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>存放</Text>
          <Text style={styles.detailValue}>{dateLabel(item.storedAt)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>确认</Text>
          <Text style={styles.detailValue}>{dateLabel(item.lastSeenAt)}</Text>
        </View>
      </View>

      <Text style={styles.helperText} numberOfLines={2}>
        {item.guideline?.note ?? item.timing.helperText}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd5',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 202,
    padding: 15,
    width: '48%',
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: 11, minHeight: 50 },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: '#db7b42',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  heading: { flex: 1, minWidth: 0 },
  name: { color: '#332e29', fontSize: 17, fontWeight: '900', lineHeight: 22 },
  meta: { color: '#766b63', fontSize: 12, marginTop: 3 },
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
  detailRow: { flexDirection: 'row', gap: 10, marginTop: 13 },
  detailItem: { flex: 1 },
  detailLabel: { color: '#978c82', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  detailValue: { color: '#453d37', fontSize: 13, fontWeight: '900' },
  helperText: { color: '#766b63', fontSize: 12, lineHeight: 17, marginTop: 12 },
})
