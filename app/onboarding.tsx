import { Ionicons } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { UserProfileFlow } from '@/app/dev-user-profile-check'
import { useAppSession } from '@/providers/AppSessionProvider'

export default function OnboardingScreen() {
  const router = useRouter()
  const { refreshProfile } = useAppSession()
  const [profileSaved, setProfileSaved] = useState(false)

  if (!profileSaved) {
    return (
      <UserProfileFlow
        mode="onboarding"
        onSaved={async () => {
          await refreshProfile()
          setProfileSaved(true)
        }}
      />
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={34} color="#ffffff" />
        </View>
        <Text style={styles.eyebrow}>档案已经准备好了</Text>
        <Text style={styles.title}>下一步，看看冰箱里有什么</Text>
        <Text style={styles.body}>
          拍几张冰箱照片，我会先让你确认识别结果，再根据真实库存刷新推荐。
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/fridge-scan' as Href)}
        >
          <Ionicons name="camera-outline" size={21} color="#ffffff" />
          <Text style={styles.primaryButtonText}>拍一下冰箱</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.secondaryButtonText}>先看看推荐</Text>
          <Ionicons name="arrow-forward" size={19} color="#6f5d51" />
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
    borderColor: '#eadfd5',
    borderRadius: 26,
    borderWidth: 1,
    maxWidth: 520,
    paddingHorizontal: 28,
    paddingVertical: 38,
    width: '100%',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#3f7958',
    borderRadius: 31,
    height: 62,
    justifyContent: 'center',
    marginBottom: 22,
    width: 62,
  },
  eyebrow: {
    color: '#3f7958',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  title: {
    color: '#332e29',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#756b63',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 400,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 27,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 54,
    width: '100%',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 27,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 54,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#6f5d51',
    fontSize: 16,
    fontWeight: '800',
  },
})
