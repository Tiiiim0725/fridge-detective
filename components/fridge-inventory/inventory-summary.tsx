import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import type { FridgeInventoryItem } from '@/types/fridge'

export function InventorySummary({ items }: { items: FridgeInventoryItem[] }) {
  const comfortableCount = items.filter((item) => item.timing.status === 'comfortable').length
  const useSoonCount = items.filter((item) => item.timing.status === 'use_soon').length
  const pastSuggestedCount = items.filter((item) => item.timing.status === 'past_suggested').length
  const unknownCount = items.filter((item) => item.timing.status === 'unknown').length

  return (
    <View style={styles.container}>
      <View style={[styles.summaryItem, styles.normalItem]}>
        <Ionicons name="checkmark-circle-outline" size={19} color="#3f7958" />
        <View>
          <Text style={styles.value}>{comfortableCount}</Text>
          <Text style={styles.label}>状态正常</Text>
        </View>
      </View>
      <View style={[styles.summaryItem, styles.soonItem]}>
        <Ionicons name="time-outline" size={19} color="#b56b19" />
        <View>
          <Text style={styles.value}>{useSoonCount}</Text>
          <Text style={styles.label}>建议优先安排</Text>
        </View>
      </View>
      <View style={[styles.summaryItem, styles.pastItem]}>
        <Ionicons name="alert-circle-outline" size={19} color="#a33a2d" />
        <View>
          <Text style={styles.value}>{pastSuggestedCount}</Text>
          <Text style={styles.label}>超过建议</Text>
        </View>
      </View>
      <View style={[styles.summaryItem, styles.unknownItem]}>
        <Ionicons name="create-outline" size={19} color="#766b63" />
        <View>
          <Text style={styles.value}>{unknownCount}</Text>
          <Text style={styles.label}>待补充</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 22,
    marginBottom: 18,
    padding: 14,
  },
  summaryItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 10,
    width: '48%',
  },
  normalItem: { backgroundColor: '#edf6f0' },
  soonItem: { backgroundColor: '#fff5df' },
  pastItem: { backgroundColor: '#fff0ed' },
  unknownItem: { backgroundColor: '#f4f0eb' },
  value: { color: '#332e29', fontSize: 17, fontWeight: '900' },
  label: { color: '#766b63', fontSize: 11, fontWeight: '800', marginTop: 1 },
})
