import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import {
  COOKING_COLORS,
  COOKING_CONTROL_SIZE,
  COOKING_RADIUS,
  COOKING_SHADOW,
} from '@/constants/cookingUi'
import { speakCookingText } from '@/services/cookingSpeechService'

type CookingStepTimerProps = {
  stepNumber: number
  timerSeconds: number | null
  disabled?: boolean
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  return `${minutes}:${restSeconds.toString().padStart(2, '0')}`
}

export function CookingStepTimer({
  stepNumber,
  timerSeconds,
  disabled,
}: CookingStepTimerProps) {
  const initialSeconds = Math.max(0, timerSeconds ?? 0)
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const progress = useMemo(() => {
    if (!initialSeconds) return 0
    return 1 - remainingSeconds / initialSeconds
  }, [initialSeconds, remainingSeconds])

  useEffect(() => {
    setRemainingSeconds(initialSeconds)
    setRunning(false)
    setFinished(false)
  }, [initialSeconds, stepNumber])

  useEffect(() => {
    if (!running || disabled) return

    const timer = setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [disabled, running])

  useEffect(() => {
    if (!running || remainingSeconds > 0) return

    setRunning(false)
    setFinished(true)
    void speakCookingText('这一步计时结束了，可以看一下状态，再决定是否进入下一步。')
  }, [remainingSeconds, running])

  if (!timerSeconds) return null

  function toggleTimer() {
    if (disabled) return
    if (finished) {
      setRemainingSeconds(initialSeconds)
      setFinished(false)
      setRunning(true)
      return
    }
    setRunning((value) => !value)
  }

  function resetTimer() {
    setRunning(false)
    setFinished(false)
    setRemainingSeconds(initialSeconds)
  }

  return (
    <View style={styles.panel}>
      <View style={styles.headingRow}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="timer-outline" size={18} color={COOKING_COLORS.accent} />
          <Text style={styles.title}>这一步可以计时</Text>
        </View>
        <Text style={styles.timerText}>{formatTimer(remainingSeconds)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {finished ? (
        <Text style={styles.finishedText}>计时结束了，先看一下锅里的状态，不会自动跳到下一步。</Text>
      ) : (
        <Text style={styles.description}>适合煎、焖、炖、等待这类不方便一直盯屏幕的步骤。</Text>
      )}

      <View style={styles.controls}>
        <Pressable
          disabled={disabled}
          onPress={toggleTimer}
          style={({ pressed }) => [
            styles.primaryButton,
            disabled && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons
            name={running ? 'pause' : finished ? 'restart' : 'play-outline'}
            size={20}
            color="#fff"
          />
          <Text style={styles.primaryButtonText}>
            {running ? '暂停' : finished ? '再计一次' : '开始计时'}
          </Text>
        </Pressable>

        <Pressable
          disabled={disabled || (!running && remainingSeconds === initialSeconds && !finished)}
          onPress={resetTimer}
          style={({ pressed }) => [
            styles.secondaryButton,
            (disabled || (!running && remainingSeconds === initialSeconds && !finished)) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="restore" size={18} color={COOKING_COLORS.text} />
          <Text style={styles.secondaryButtonText}>重置</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COOKING_COLORS.surface,
    borderRadius: COOKING_RADIUS,
    gap: 12,
    marginTop: 16,
    padding: 16,
    ...COOKING_SHADOW,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  title: {
    color: COOKING_COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  timerText: {
    color: COOKING_COLORS.accent,
    fontSize: 28,
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: COOKING_COLORS.border,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: COOKING_COLORS.accent,
    borderRadius: 999,
    height: '100%',
  },
  description: {
    color: COOKING_COLORS.mutedText,
    lineHeight: 20,
  },
  finishedText: {
    color: COOKING_COLORS.secondary,
    fontWeight: '900',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.accent,
    borderRadius: COOKING_RADIUS,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: COOKING_CONTROL_SIZE,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderColor: COOKING_COLORS.border,
    borderRadius: COOKING_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: COOKING_CONTROL_SIZE,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: COOKING_COLORS.text,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.78,
  },
})
