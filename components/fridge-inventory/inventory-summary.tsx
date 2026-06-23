import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import type { FridgeInventoryItem } from '@/types/fridge'

export function InventorySummary({ items }: { items: FridgeInventoryItem[] }) {
  const useSoonCount = items.filter((item) => item.timing.status === 'use_soon').length
  const pastSuggestedCount = items.filter((item) => item.timing.status === 'past_suggested').length
  const unknownCount = items.filter((item) => item.timing.status === 'unknown').length

  return (
    <View style={styles.container}>
      <View style={styles.summaryItem}>
        <Ionicons name="cube-outline" size={18} color="#3f7958" />
        <View>
          <Text style={styles.value}>{items.length}</Text>
          <Text style={styles.label}>当前食材</Text>
        </View>
      </View>
      <View style={styles.summaryItem}>
        <Ionicons name="time-outline" size={18} color="#b56b19" />
        <View>
          <Text style={styles.value}>{useSoonCount}</Text>
          <Text style={styles.label}>建议优先</Text>
        </View>
      </View>
      <View style={styles.summaryItem}>
        <Ionicons name="alert-circle-outline" size={18} color="#a33a2d" />
        <View>
          <Text style={styles.value}>{pastSuggestedCount}</Text>
          <Text style={styles.label}>超过建议</Text>
        </View>
      </View>
      <View style={styles.summaryItem}>
        <Ionicons name="create-outline" size={18} color="#766b63" />
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
    backgroundColor: '#faf6f2',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 10,
    width: '48%',
  },
  value: { color: '#332e29', fontSize: 17, fontWeight: '900' },
  label: { color: '#766b63', fontSize: 11, fontWeight: '800', marginTop: 1 },
})
