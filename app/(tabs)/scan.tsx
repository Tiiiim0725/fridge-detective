import { Ionicons } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function ScanTab() {
  const router = useRouter()

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="camera-outline" size={34} color="#c2652a" />
        <Text style={styles.title}>拍一下冰箱</Text>
        <Text style={styles.body}>拍清主要食材，确认后就会刷新你的推荐。</Text>
        <Pressable style={styles.button} onPress={() => router.push('/fridge-scan' as Href)}>
          <Text style={styles.buttonText}>开始拍摄</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: '#faf5ee',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e6ddd4',
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 440,
    padding: 32,
    width: '100%',
  },
  title: { color: '#332e29', fontSize: 26, fontWeight: '900', marginTop: 16 },
  body: { color: '#766c64', lineHeight: 22, marginTop: 8, textAlign: 'center' },
  button: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 26,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
    width: '100%',
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
})
