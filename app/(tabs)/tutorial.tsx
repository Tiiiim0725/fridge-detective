import { Ionicons } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import {
  UI_CARD_RADIUS,
  UI_PAGE_MAX_WIDTH,
  UI_PAGE_SIDE_PADDING,
  UI_TOP_BUTTON_SIZE,
} from '@/components/ui/design-tokens'

export default function TutorialTab() {
  const router = useRouter()

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>跟做教程</Text>
        <Text style={styles.title}>选一道菜，按步骤做下去</Text>
        <Text style={styles.subtitle}>
          目前已开放番茄炒蛋精细教程，后续会把更多菜的真实步骤补进来。
        </Text>
      </View>

      <Pressable
        accessibilityLabel="进入番茄炒蛋教程"
        onPress={() =>
          router.push({
            pathname: '/recipe/[recipeKey]/cook',
            params: { recipeKey: 'tomato_egg_stir_fry' },
          } as Href)
        }
        style={({ pressed }) => [
          styles.tutorialCard,
          pressed && styles.tutorialCardPressed,
        ]}
      >
        <View style={styles.iconBubble}>
          <Ionicons name="restaurant-outline" size={27} color="#fffaf5" />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>番茄炒蛋</Text>
          <Text style={styles.cardSubtitle}>6 步精细教程，支持步骤恢复和 AI 辅助。</Text>
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
