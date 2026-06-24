import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

import {
  COOKING_COLORS,
  COOKING_CONTROL_SIZE,
  COOKING_RADIUS,
  COOKING_SHADOW,
} from '@/constants/cookingUi'
import {
  speakCookingText,
  stopCookingSpeech,
} from '@/services/cookingSpeechService'

type CookingSpeechControlsProps = {
  recipeName: string
  stepNumber: number
  totalSteps: number
  stepTitle: string
  stepBody: string
  disabled?: boolean
}

export function CookingSpeechControls({
  recipeName,
  stepNumber,
  totalSteps,
  stepTitle,
  stepBody,
  disabled,
}: CookingSpeechControlsProps) {
  const [autoReadEnabled, setAutoReadEnabled] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const speechText = useMemo(() => (
    `${recipeName}，第 ${stepNumber} 步，共 ${totalSteps} 步。${stepTitle}。${stepBody}`
  ), [recipeName, stepBody, stepNumber, stepTitle, totalSteps])

  useEffect(() => {
    return () => {
      void stopCookingSpeech()
    }
  }, [])

  useEffect(() => {
    if (!autoReadEnabled || disabled) return

    let active = true
    setError(null)
    setSpeaking(true)

    void speakCookingText(speechText)
      .catch((caught) => {
        if (!active) return
        setError(caught instanceof Error ? caught.message : String(caught))
      })
      .finally(() => {
        if (active) setSpeaking(false)
      })

    return () => {
      active = false
      void stopCookingSpeech()
    }
  }, [autoReadEnabled, disabled, speechText])

  async function readCurrentStep() {
    setError(null)
    setSpeaking(true)

    try {
      await speakCookingText(speechText)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSpeaking(false)
    }
  }

  async function stopReading() {
    setError(null)
    setAutoReadEnabled(false)
    await stopCookingSpeech()
    setSpeaking(false)
  }

  function toggleAutoRead() {
    setError(null)
    setAutoReadEnabled((value) => !value)
  }

  return (
    <View style={styles.panel}>
      <View style={styles.copyBlock}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="volume-high" size={18} color={COOKING_COLORS.secondary} />
          <Text style={styles.title}>免手跟做</Text>
          {speaking ? (
            <View style={styles.speakingPill}>
              <View style={styles.speakingDot} />
              <Text style={styles.speakingText}>正在朗读</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.description}>
          先把当前步骤读出来，手上沾东西时不用一直看屏幕。
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          disabled={disabled || speaking}
          onPress={() => void readCurrentStep()}
          style={({ pressed }) => [
            styles.primaryButton,
            (disabled || speaking) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {speaking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialCommunityIcons name="play-outline" size={20} color="#fff" />
          )}
          <Text style={styles.primaryButtonText}>朗读这步</Text>
        </Pressable>

        <Pressable
          disabled={disabled || !speaking}
          onPress={() => void stopReading()}
          style={({ pressed }) => [
            styles.secondaryButton,
            (disabled || !speaking) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="stop" size={18} color={COOKING_COLORS.text} />
          <Text style={styles.secondaryButtonText}>停止</Text>
        </Pressable>
      </View>

      <Pressable
        disabled={disabled}
        onPress={toggleAutoRead}
        style={({ pressed }) => [
          styles.autoRow,
          autoReadEnabled && styles.autoRowActive,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.autoSwitch, autoReadEnabled && styles.autoSwitchActive]}>
          {autoReadEnabled ? (
            <MaterialCommunityIcons name="check" size={15} color="#fff" />
          ) : null}
        </View>
        <View style={styles.autoCopy}>
          <Text style={styles.autoTitle}>进入下一步时自动朗读</Text>
          <Text style={styles.autoDescription}>
            这是临时免手模式；真正语音输入会在单独节点继续迁移。
          </Text>
        </View>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  copyBlock: {
    gap: 4,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  title: {
    color: COOKING_COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  description: {
    color: COOKING_COLORS.mutedText,
    lineHeight: 20,
  },
  speakingPill: {
    alignItems: 'center',
    backgroundColor: '#e8f0e9',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  speakingDot: {
    backgroundColor: COOKING_COLORS.secondary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  speakingText: {
    color: COOKING_COLORS.secondary,
    fontSize: 12,
    fontWeight: '900',
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.secondary,
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
  autoRow: {
    alignItems: 'center',
    borderColor: COOKING_COLORS.border,
    borderRadius: COOKING_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  autoRowActive: {
    backgroundColor: '#f0f6f1',
    borderColor: '#cddfd2',
  },
  autoSwitch: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.border,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  autoSwitchActive: {
    backgroundColor: COOKING_COLORS.secondary,
  },
  autoCopy: {
    flex: 1,
    gap: 2,
  },
  autoTitle: {
    color: COOKING_COLORS.text,
    fontWeight: '900',
  },
  autoDescription: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  errorText: {
    color: COOKING_COLORS.errorText,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.78,
  },
})
