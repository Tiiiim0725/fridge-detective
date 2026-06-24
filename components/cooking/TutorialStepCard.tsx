import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { StyleSheet, Text, View } from 'react-native'

import { ActionVisual } from '@/components/cooking/ActionVisual'
import {
  COOKING_COLORS,
  COOKING_RADIUS,
  COOKING_SHADOW,
} from '@/constants/cookingUi'
import type { CookingActionAsset, RecipeTutorialStep } from '@/types/tutorial'

type TutorialStepCardProps = {
  step: RecipeTutorialStep
  action: CookingActionAsset | null
  totalSteps: number
  totalMinutes: number
  recipeName: string
}

export function TutorialStepCard({
  step,
  action,
  totalSteps,
  totalMinutes,
  recipeName,
}: TutorialStepCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.progressRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.eyebrow}>第 {step.stepNumber} 步</Text>
        </View>
        <Text style={styles.progressTotal}>共 {totalSteps} 步</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.recipeName}>{recipeName}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
      </View>

      <ActionVisual
        action={action}
        instruction={step.body}
        progress={step.stepNumber / totalSteps}
      />

      <View style={styles.metaRow}>
        {step.estimatedMinutes ? (
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={COOKING_COLORS.accent} />
            <Text style={styles.metaText}>
              全程约 {totalMinutes} 分钟 · 本步约 {step.estimatedMinutes} 分钟
            </Text>
          </View>
        ) : null}
        {step.timerSeconds ? (
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="timer-outline" size={18} color={COOKING_COLORS.secondary} />
            <Text style={styles.timerText}>建议计时 {step.timerSeconds} 秒</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    paddingVertical: 10,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepBadge: {
    backgroundColor: '#f3e0d0',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  eyebrow: {
    color: COOKING_COLORS.accent,
    fontWeight: '900',
  },
  progressTotal: {
    color: COOKING_COLORS.mutedText,
    fontWeight: '800',
  },
  titleBlock: {
    gap: 5,
  },
  recipeName: {
    color: COOKING_COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  stepTitle: {
    color: COOKING_COLORS.mutedText,
    fontSize: 17,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  metaItem: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.surface,
    borderRadius: COOKING_RADIUS,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...COOKING_SHADOW,
  },
  metaText: {
    color: COOKING_COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  timerText: {
    color: COOKING_COLORS.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
})
