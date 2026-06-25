import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CookingAssistantPanel } from '@/components/cooking/CookingAssistantPanel'
import { CookingSpeechControls } from '@/components/cooking/CookingSpeechControls'
import { CookingStepTimer } from '@/components/cooking/CookingStepTimer'
import { TutorialStepCard } from '@/components/cooking/TutorialStepCard'
import { FloatingTopButton, FLOATING_TOP_BUTTON_SIZE } from '@/components/ui/floating-top-button'
import {
  COOKING_COLORS,
  COOKING_CONTROL_SIZE,
  COOKING_RADIUS,
  COOKING_SHADOW,
} from '@/constants/cookingUi'
import { getTutorialFallback } from '@/constants/tutorialFallback'
import {
  getOrCreateCookingSession,
  pauseCookingSession,
  updateCookingSession,
} from '@/services/cookingSessionService'
import { getTutorialBundle } from '@/services/tutorialService'
import type { CookingSessionStatus, TutorialBundle } from '@/types/tutorial'

type LoadStatus = 'loading' | 'ready' | 'error'
type DataSource = 'supabase' | 'fallback'

export default function CookingTutorialScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{ recipeKey?: string | string[] }>()
  const recipeKey = Array.isArray(params.recipeKey) ? params.recipeKey[0] : params.recipeKey

  const [status, setStatus] = useState<LoadStatus>('loading')
  const [bundle, setBundle] = useState<TutorialBundle | null>(null)
  const [dataSource, setDataSource] = useState<DataSource>('supabase')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<CookingSessionStatus | 'local'>('local')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    async function loadTutorial() {
      if (!recipeKey) {
        setErrorMessage('缺少菜谱信息，暂时无法打开教程。')
        setStatus('error')
        return
      }

      setStatus('loading')
      setErrorMessage(null)

      try {
        const remoteBundle = await getTutorialBundle(recipeKey)
        if (!active) return

        if (!remoteBundle) {
          throw new Error('这道菜的精细教程还没有准备好。')
        }

        setBundle(remoteBundle)
        setDataSource('supabase')

        try {
          const session = await getOrCreateCookingSession(recipeKey)
          if (!active) return
          const boundedStep = Math.min(
            Math.max(session.currentStepNumber, 1),
            remoteBundle.steps.length
          )
          setSessionId(session.id)
          setSessionStatus(session.status)
          setCurrentStepIndex(boundedStep - 1)
        } catch (sessionError) {
          if (!active) return
          setSessionStatus('local')
          setMessage(`教程可以继续使用，但这次进度暂时不会保存。${sessionError instanceof Error ? ` ${sessionError.message}` : ''}`)
        }

        setStatus('ready')
      } catch (error) {
        if (!active) return
        const fallback = getTutorialFallback(recipeKey)

        if (fallback) {
          setBundle(fallback)
          setDataSource('fallback')
          setSessionStatus('local')
          setMessage('教程数据暂时离线，当前可以预览完整步骤；这次进度不会保存。')
          setStatus('ready')
          return
        }

        setErrorMessage(error instanceof Error ? error.message : String(error))
        setStatus('error')
      }
    }

    void loadTutorial()
    return () => {
      active = false
    }
  }, [recipeKey])

  const currentStep = bundle?.steps[currentStepIndex] ?? null
  const currentAction = useMemo(() => {
    if (!bundle || !currentStep) return null
    return bundle.actionAssets.find((asset) => asset.actionKey === currentStep.actionKey) ?? null
  }, [bundle, currentStep])

  async function moveToStep(nextIndex: number) {
    if (!bundle) return
    const boundedIndex = Math.max(0, Math.min(nextIndex, bundle.steps.length - 1))
    setCurrentStepIndex(boundedIndex)
    setMessage(null)

    if (!sessionId) return

    setSaving(true)
    try {
      const session = await updateCookingSession(sessionId, {
        currentStepNumber: boundedIndex + 1,
        status: 'active',
      })
      setSessionStatus(session.status)
    } catch (error) {
      setMessage(`已经切换步骤，但进度暂时没保存。${error instanceof Error ? ` ${error.message}` : ''}`)
    } finally {
      setSaving(false)
    }
  }

  async function finishTutorial() {
    if (!bundle) return
    setMessage(null)

    if (!sessionId) {
      setSessionStatus('completed')
      setMessage('完成啦。当前是离线预览，这次记录没有保存。')
      return
    }

    setSaving(true)
    try {
      const session = await updateCookingSession(sessionId, {
        currentStepNumber: bundle.steps.length,
        status: 'completed',
      })
      setSessionStatus(session.status)
      setMessage('完成啦，这次做饭已经记下来了。')
    } catch (error) {
      setMessage(`完成状态暂时没保存。${error instanceof Error ? ` ${error.message}` : ''}`)
    } finally {
      setSaving(false)
    }
  }

  async function leaveTutorial() {
    if (sessionId && sessionStatus === 'active') {
      try {
        await pauseCookingSession(sessionId)
      } catch {
        // Leaving should never trap the user when progress persistence fails.
      }
    }
    router.back()
  }

  if (status === 'loading') {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator color={COOKING_COLORS.accent} />
        <Text style={styles.stateTitle}>正在准备跟做步骤</Text>
        <Text style={styles.stateText}>马上就好，先把锅和食材放到手边。</Text>
      </View>
    )
  }

  if (status === 'error' || !bundle || !currentStep) {
    return (
      <View style={styles.centeredState}>
        <MaterialCommunityIcons name="chef-hat" size={38} color={COOKING_COLORS.accent} />
        <Text style={styles.stateTitle}>教程暂时没有准备好</Text>
        <Text style={styles.stateText}>{errorMessage}</Text>
        <Pressable onPress={() => router.back()} style={styles.stateButton}>
          <Text style={styles.stateButtonText}>返回菜谱详情</Text>
        </Pressable>
      </View>
    )
  }

  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === bundle.steps.length - 1
  const isCompleted = sessionStatus === 'completed'

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 18) + 24 }]}
      >
        <View style={styles.container}>
          <View style={[styles.topControls, { paddingTop: insets.top + 28 }]}>
            <FloatingTopButton
              accessibilityLabel="返回菜谱详情"
              iconName="arrow-back-outline"
              onPress={() => void leaveTutorial()}
            />

            <View style={styles.saveStatus}>
              <View style={[
                styles.statusDot,
                dataSource === 'fallback' && styles.statusDotLocal,
              ]} />
              <Text style={styles.saveStatusText}>
                {dataSource === 'fallback' ? '预览模式' : saving ? '保存中' : '进度已保存'}
              </Text>
            </View>

            <View style={styles.topSpacer} />
          </View>

          <TutorialStepCard
            step={currentStep}
            action={currentAction}
            totalSteps={bundle.steps.length}
            totalMinutes={bundle.recipe.totalTimeMinutes}
            recipeName={bundle.recipe.zhName}
          />

          <CookingSpeechControls
            recipeName={bundle.recipe.zhName}
            stepNumber={currentStep.stepNumber}
            totalSteps={bundle.steps.length}
            stepTitle={currentStep.title}
            stepBody={currentStep.body}
            disabled={dataSource !== 'supabase'}
          />

          <CookingStepTimer
            stepNumber={currentStep.stepNumber}
            timerSeconds={currentStep.timerSeconds}
            disabled={dataSource !== 'supabase'}
          />

          <CookingAssistantPanel
            context={{
              sessionId,
              recipeId: bundle.recipe.id,
              recipeKey: bundle.recipe.recipeKey,
              recipeTitle: bundle.recipe.zhName,
              stepNumber: currentStep.stepNumber,
              stepTitle: currentStep.title,
              stepBody: currentStep.body,
              assistantContext: currentStep.assistantContext,
              ingredientKeys: currentStep.ingredientKeys,
              equipmentKeys: currentStep.equipmentKeys,
            }}
            disabled={dataSource !== 'supabase' || !sessionId}
          />

          {message ? (
            <View style={styles.messageBanner}>
              <MaterialCommunityIcons name="information-outline" size={18} color={COOKING_COLORS.secondary} />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <View style={styles.navigation}>
            <Pressable
              accessibilityLabel="上一步"
              disabled={isFirstStep || saving}
              onPress={() => void moveToStep(currentStepIndex - 1)}
              style={({ pressed }) => [
                styles.secondaryButton,
                (isFirstStep || saving) && styles.disabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <MaterialCommunityIcons name="arrow-left" size={19} color={COOKING_COLORS.text} />
              <Text style={styles.secondaryButtonText}>上一步</Text>
            </Pressable>

            <Pressable
              accessibilityLabel={isLastStep ? '完成这道菜' : '下一步'}
              disabled={saving || isCompleted}
              onPress={() => void (isLastStep ? finishTutorial() : moveToStep(currentStepIndex + 1))}
              style={({ pressed }) => [
                styles.primaryButton,
                isLastStep && styles.completeButton,
                (saving || isCompleted) && styles.disabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isCompleted ? '已完成' : isLastStep ? '完成这道菜' : '下一步'}
              </Text>
              <MaterialCommunityIcons
                name={isLastStep ? 'check-circle-outline' : 'arrow-right'}
                size={19}
                color="#fff"
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COOKING_COLORS.pageBackground,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  container: {
    alignSelf: 'center',
    maxWidth: 760,
    paddingHorizontal: 20,
    width: '100%',
  },
  topControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 82,
  },
  topSpacer: {
    width: FLOATING_TOP_BUTTON_SIZE,
  },
  saveStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statusDot: {
    backgroundColor: COOKING_COLORS.secondary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusDotLocal: {
    backgroundColor: '#b88754',
  },
  saveStatusText: {
    color: COOKING_COLORS.mutedText,
    fontSize: 13,
    fontWeight: '800',
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 22,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.surface,
    borderRadius: COOKING_RADIUS,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: COOKING_CONTROL_SIZE,
    ...COOKING_SHADOW,
  },
  secondaryButtonText: {
    color: COOKING_COLORS.text,
    fontWeight: '900',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.accent,
    borderRadius: COOKING_RADIUS,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: COOKING_CONTROL_SIZE,
    ...COOKING_SHADOW,
  },
  completeButton: {
    backgroundColor: COOKING_COLORS.secondary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.35,
  },
  messageBanner: {
    alignItems: 'flex-start',
    backgroundColor: '#edf3ee',
    borderRadius: COOKING_RADIUS,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 13,
  },
  messageText: {
    color: '#31543a',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  centeredState: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.pageBackground,
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    padding: 28,
  },
  stateTitle: {
    color: COOKING_COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  stateText: {
    color: COOKING_COLORS.mutedText,
    lineHeight: 21,
    maxWidth: 420,
    textAlign: 'center',
  },
  stateButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.accent,
    borderRadius: COOKING_RADIUS,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: COOKING_CONTROL_SIZE,
    paddingHorizontal: 22,
  },
  stateButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
})
