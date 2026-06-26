import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { type Href, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import {
  UI_CARD_RADIUS,
  UI_PAGE_MAX_WIDTH,
  UI_PAGE_SIDE_PADDING,
  UI_TOP_BUTTON_SIZE,
} from '@/components/ui/design-tokens'
import {
  getLatestOpenCookingSession,
  type LatestCookingSession,
} from '@/services/cookingSessionService'
import { getTutorialOverview } from '@/services/tutorialService'

type TutorialEntry = {
  recipeKey: string
  zhName: string
  stepCount: number
  currentStepNumber: number
  isRecent: boolean
}

const DEFAULT_TUTORIAL_ENTRY: TutorialEntry = {
  recipeKey: 'tomato_egg_stir_fry',
  zhName: '番茄炒蛋',
  stepCount: 6,
  currentStepNumber: 1,
  isRecent: false,
}

export default function TutorialTab() {
  const router = useRouter()
  const [entry, setEntry] = useState<TutorialEntry>(DEFAULT_TUTORIAL_ENTRY)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadLatestTutorialEntry() {
        setIsLoading(true)
        setNotice(null)

        try {
          const latestSession: LatestCookingSession | null = await getLatestOpenCookingSession()

          if (!active) return

          if (!latestSession || !latestSession.recipeKey) {
            setEntry(DEFAULT_TUTORIAL_ENTRY)
            return
          }

          const overview = await getTutorialOverview(latestSession.recipeKey)

          if (!active) return

          if (!overview) {
            setEntry(DEFAULT_TUTORIAL_ENTRY)
            setNotice('上次教程暂时没有可用步骤，先保留番茄炒蛋入口。')
            return
          }

          setEntry({
            recipeKey: latestSession.recipeKey,
            zhName: latestSession.recipeZhName ?? latestSession.recipeKey,
            stepCount: overview.stepCount,
            currentStepNumber: Math.min(
              Math.max(latestSession.currentStepNumber, 1),
              overview.stepCount
            ),
            isRecent: true,
          })
        } catch (error) {
          if (!active) return

          setEntry(DEFAULT_TUTORIAL_ENTRY)
          setNotice(error instanceof Error ? error.message : String(error))
        } finally {
          if (active) {
            setIsLoading(false)
          }
        }
      }

      void loadLatestTutorialEntry()

      return () => {
        active = false
      }
    }, [])
  )

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>跟做教程</Text>
        <Text style={styles.title}>{entry.isRecent ? '继续刚刚那道菜' : '选一道菜，按步骤做下去'}</Text>
        <Text style={styles.subtitle}>
          {entry.isRecent
            ? '我会从你上次离开的步骤继续，不用重新找。'
            : '从推荐或详情页进入跟做后，这里会记住你最近做到哪一步。'}
        </Text>
      </View>

      {notice ? (
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={18} color="#9a5a2d" />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={entry.isRecent ? `继续${entry.zhName}教程` : `进入${entry.zhName}教程`}
        disabled={isLoading}
        onPress={() =>
          router.push({
            pathname: '/recipe/[recipeKey]/cook',
            params: { recipeKey: entry.recipeKey },
          } as Href)
        }
        style={({ pressed }) => [
          styles.tutorialCard,
          isLoading && styles.tutorialCardDisabled,
          pressed && styles.tutorialCardPressed,
        ]}
      >
        <View style={styles.iconBubble}>
          {isLoading ? (
            <ActivityIndicator color="#fffaf5" />
          ) : (
            <Ionicons name="restaurant-outline" size={27} color="#fffaf5" />
          )}
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{entry.zhName}</Text>
          <Text style={styles.cardSubtitle}>
            {entry.isRecent
              ? `上次到第 ${entry.currentStepNumber} / ${entry.stepCount} 步，点开继续。`
              : `${entry.stepCount} 步精细教程，支持步骤恢复和 AI 辅助。`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#8d6953" />
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff8f1',
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    gap: 22,
    maxWidth: UI_PAGE_MAX_WIDTH,
    paddingBottom: 120,
    paddingHorizontal: UI_PAGE_SIDE_PADDING,
    paddingTop: 34,
    width: '100%',
  },
  header: {
    gap: 10,
  },
  kicker: {
    color: '#c2652a',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  title: {
    color: '#28231f',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
  subtitle: {
    color: '#70665d',
    fontSize: 16,
    lineHeight: 24,
  },
  noticeCard: {
    alignItems: 'flex-start',
    backgroundColor: '#fff4e9',
    borderColor: '#efd8c2',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 14,
  },
  noticeText: {
    color: '#7b5f4a',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  tutorialCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eadfd3',
    borderRadius: UI_CARD_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    shadowColor: '#6f4a31',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.11,
    shadowRadius: 26,
  },
  tutorialCardDisabled: {
    opacity: 0.7,
  },
  tutorialCardPressed: {
    opacity: 0.78,
    transform: [{ translateY: 1 }],
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: '#163f34',
    borderRadius: UI_TOP_BUTTON_SIZE / 2,
    height: UI_TOP_BUTTON_SIZE,
    justifyContent: 'center',
    width: UI_TOP_BUTTON_SIZE,
  },
  cardText: {
    flex: 1,
    gap: 5,
  },
  cardTitle: {
    color: '#2d2925',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardSubtitle: {
    color: '#766d65',
    fontSize: 14,
    lineHeight: 20,
  },
})
