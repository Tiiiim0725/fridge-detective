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

import { getCurrentFridgeItems } from '@/services/fridgeService'
import type { FridgeItem } from '@/types/fridge'

function quantityLabel(item: FridgeItem): string {
  if (item.quantityKind === 'count' && typeof item.quantityCount === 'number') {
    return `${item.quantityCount} 个`
  }

  if (item.quantityKind === 'text' && item.quantityText) {
    return item.quantityText
  }

  return '数量未记录'
}

function lastSeenLabel(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '最近确认过'
  }

  return `${date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} 确认`
}

export default function PrivateFridgeScreen() {
  const router = useRouter()
  const [items, setItems] = useState<FridgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadItems() {
        setLoading(true)
        setErrorMessage(null)

        try {
          const currentItems = await getCurrentFridgeItems()
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
          <Text style={styles.eyebrow}>我的冰箱</Text>
          <Text style={styles.title}>现在冰箱里有什么</Text>
          <Text style={styles.subtitle}>这里只展示你已经确认过、目前仍在库存中的食材。</Text>
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
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>当前食材</Text>
              <Text style={styles.summaryCount}>{items.length} 项</Text>
            </View>

            <View style={styles.grid}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="leaf-outline" size={23} color="#ffffff" />
                  </View>
                  <Text style={styles.itemName} numberOfLines={2}>{item.displayName}</Text>
                  <Text style={styles.itemQuantity}>{quantityLabel(item)}</Text>
                  <Text style={styles.itemSeen}>{lastSeenLabel(item.lastSeenAt)}</Text>
                </View>
              ))}
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
    backgroundColor: '#fffaf5',
    borderBottomColor: '#e7ddd4',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  iconButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  topBarTitle: { color: '#332e29', flex: 1, fontSize: 19, fontWeight: '900', textAlign: 'center' },
  container: { alignSelf: 'center', maxWidth: 760, paddingBottom: 50, width: '100%' },
  hero: { paddingHorizontal: 24, paddingBottom: 28, paddingTop: 34 },
  eyebrow: { color: '#3f7958', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  title: { color: '#332e29', fontSize: 32, fontWeight: '900', lineHeight: 40 },
  subtitle: { color: '#766c64', fontSize: 15, lineHeight: 23, marginTop: 8 },
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
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  summaryTitle: { color: '#332e29', fontSize: 20, fontWeight: '900' },
  summaryCount: { color: '#3f7958', fontSize: 14, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 22 },
  itemCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3ddd6',
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 164,
    padding: 16,
    width: '48%',
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: '#db7b42',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginBottom: 16,
    width: 44,
  },
  itemName: { color: '#332e29', fontSize: 18, fontWeight: '900', lineHeight: 23 },
  itemQuantity: { color: '#766b63', fontSize: 14, marginTop: 6 },
  itemSeen: { color: '#3f7958', fontSize: 12, fontWeight: '800', marginTop: 8 },
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
