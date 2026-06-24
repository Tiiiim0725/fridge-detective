import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useEffect, useMemo, useState, type ComponentProps } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import {
  COOKING_COLORS,
  COOKING_CONTROL_SIZE,
  COOKING_RADIUS,
  COOKING_SHADOW,
} from '@/constants/cookingUi'
import { useCookingVoiceAssistant } from '@/hooks/useCookingVoiceAssistant'
import { askCookingHelper } from '@/services/cookingAiService'
import {
  askWithCookingQuestionPhoto,
  pickCookingQuestionPhoto,
  type CookingQuestionPhotoSource,
  type PickedCookingQuestionPhoto,
} from '@/services/cookingQuestionPhotoService'
import type {
  AskCookingHelperInput,
  AskCookingHelperResult,
  CookingAiAnswerType,
} from '@/types/cookingAi'

type AskMode = CookingAiAnswerType

type CookingAssistantPanelProps = {
  context: Omit<
    AskCookingHelperInput,
    'answerType' | 'questionText' | 'questionImageUrl' | 'questionPhotoId'
  >
  disabled?: boolean
}

type ModeOption = {
  key: AskMode
  label: string
  icon: ComponentProps<typeof MaterialCommunityIcons>['name']
}

const DEFAULT_PHOTO_QUESTION = '帮我看看这一步做得对不对，下一步该注意什么？'

const modeOptions: ModeOption[] = [
  { key: 'text', label: '问一句', icon: 'message-text-outline' },
  { key: 'photo', label: '看图问', icon: 'image-search-outline' },
  { key: 'voice', label: '说一句', icon: 'microphone-outline' },
]

function getSuggestedActionLabel(result: AskCookingHelperResult): string {
  if (result.suggestedAction === 'continue_current_step') return '可以继续当前步骤'
  if (result.suggestedAction === 'stop_and_check') return '先停一下检查'
  return '调整一下再继续'
}

function getRiskLabel(result: AskCookingHelperResult): string {
  if (result.riskLevel === 'high') return '需要你重点确认'
  if (result.riskLevel === 'medium') return '有一点不确定'
  return '风险较低'
}

export function CookingAssistantPanel({
  context,
  disabled,
}: CookingAssistantPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<AskMode>('text')
  const [textQuestion, setTextQuestion] = useState('')
  const [photoQuestion, setPhotoQuestion] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [pickedPhoto, setPickedPhoto] = useState<PickedCookingQuestionPhoto | null>(null)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [answer, setAnswer] = useState<AskCookingHelperResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const voiceContextualStrings = useMemo(() => [
    context.recipeTitle,
    context.stepTitle,
    context.stepBody,
    context.assistantContext ?? '',
    ...context.ingredientKeys,
    ...context.equipmentKeys,
  ], [
    context.assistantContext,
    context.equipmentKeys,
    context.ingredientKeys,
    context.recipeTitle,
    context.stepBody,
    context.stepTitle,
  ])

  const voiceAssistant = useCookingVoiceAssistant({
    contextualStrings: voiceContextualStrings,
    disabled: disabled || loading,
    onTranscriptChange: setVoiceTranscript,
  })

  useEffect(() => {
    if (expanded && mode === 'voice') return
    voiceAssistant.resetVoiceAssistant()
  }, [expanded, mode, voiceAssistant.resetVoiceAssistant])

  function selectMode(nextMode: AskMode) {
    setError(null)
    if (expanded && mode === nextMode) {
      setExpanded(false)
      return
    }
    setMode(nextMode)
    setExpanded(true)
  }

  async function chooseQuestionPhoto(source: CookingQuestionPhotoSource) {
    setError(null)

    try {
      const photo = await pickCookingQuestionPhoto(source)
      if (!photo) return

      setPickedPhoto(photo)
      setImageUrl('')
      setAnswer(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  async function submitQuestion() {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'photo' && pickedPhoto) {
        const result = await askWithCookingQuestionPhoto({
          ...context,
          photo: pickedPhoto,
          questionText: photoQuestion || DEFAULT_PHOTO_QUESTION,
        })
        setAnswer(result.answer)
        return
      }

      const result = await askCookingHelper({
        ...context,
        answerType: mode,
        questionText: mode === 'text'
          ? textQuestion
          : mode === 'voice'
            ? voiceTranscript
            : photoQuestion || DEFAULT_PHOTO_QUESTION,
        questionImageUrl: mode === 'photo' ? imageUrl : null,
      })
      setAnswer(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !disabled
    && !loading
    && (
      (mode === 'text' && textQuestion.trim().length > 0)
      || (mode === 'voice' && voiceTranscript.trim().length > 0)
      || (mode === 'photo' && (pickedPhoto !== null || imageUrl.trim().length > 0))
    )

  return (
    <View style={styles.panel}>
      <View style={styles.compactBar}>
        {modeOptions.map((option) => {
          const active = expanded && mode === option.key
          return (
            <Pressable
              key={option.key}
              accessibilityLabel={option.label}
              disabled={disabled || loading}
              onPress={() => selectMode(option.key)}
              style={({ pressed }) => [
                styles.modeButton,
                active && styles.modeButtonActive,
                (disabled || loading) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={20}
                color={active ? '#fff' : COOKING_COLORS.text}
              />
              <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {expanded ? (
        <View style={styles.expandedPanel}>
          <View style={styles.headingRow}>
            <View style={styles.headingTitleRow}>
              <MaterialCommunityIcons name="chef-hat" size={20} color={COOKING_COLORS.secondary} />
              <Text style={styles.headingTitle}>做饭助手</Text>
            </View>
            <Pressable accessibilityLabel="收起做饭助手" onPress={() => setExpanded(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name="chevron-down" size={24} color={COOKING_COLORS.mutedText} />
            </Pressable>
          </View>

          {mode === 'text' ? (
            <TextInput
              value={textQuestion}
              onChangeText={setTextQuestion}
              editable={!disabled && !loading}
              placeholder="鸡蛋炒到什么程度可以盛出？"
              placeholderTextColor="#9a8d82"
              multiline
              style={styles.input}
            />
          ) : null}

          {mode === 'photo' ? (
            <View style={styles.fieldGroup}>
              <View style={styles.photoActionRow}>
                <Pressable
                  disabled={disabled || loading}
                  onPress={() => void chooseQuestionPhoto('library')}
                  style={({ pressed }) => [
                    styles.photoActionButton,
                    (disabled || loading) && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons name="image-plus-outline" size={18} color={COOKING_COLORS.text} />
                  <Text style={styles.photoActionButtonText}>选一张</Text>
                </Pressable>
                <Pressable
                  disabled={disabled || loading}
                  onPress={() => void chooseQuestionPhoto('camera')}
                  style={({ pressed }) => [
                    styles.photoActionButton,
                    (disabled || loading) && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons name="camera-outline" size={18} color={COOKING_COLORS.text} />
                  <Text style={styles.photoActionButtonText}>拍一下</Text>
                </Pressable>
              </View>

              {pickedPhoto ? (
                <View style={styles.photoPreviewCard}>
                  <Image source={{ uri: pickedPhoto.uri }} style={styles.photoPreview} />
                  <View style={styles.photoPreviewTextBlock}>
                    <Text style={styles.photoPreviewTitle}>已选择一张步骤照片</Text>
                    <Text style={styles.photoPreviewMeta}>
                      {pickedPhoto.width && pickedPhoto.height
                        ? `${pickedPhoto.width} x ${pickedPhoto.height}`
                        : '准备上传给做饭助手'}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="移除已选择照片"
                    onPress={() => setPickedPhoto(null)}
                    style={styles.removePhotoButton}
                  >
                    <MaterialCommunityIcons name="close" size={18} color={COOKING_COLORS.mutedText} />
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>或粘贴图片 URL</Text>
                <View style={styles.orLine} />
              </View>

              <TextInput
                value={imageUrl}
                onChangeText={(value) => {
                  setImageUrl(value)
                  if (value.trim()) setPickedPhoto(null)
                }}
                editable={!disabled && !loading}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="粘贴一张公网图片 URL"
                placeholderTextColor="#9a8d82"
                style={styles.input}
              />
              <TextInput
                value={photoQuestion}
                onChangeText={setPhotoQuestion}
                editable={!disabled && !loading}
                placeholder="想问什么？不填也可以直接让 AI 看图"
                placeholderTextColor="#9a8d82"
                multiline
                style={styles.input}
              />
            </View>
          ) : null}

          {mode === 'voice' ? (
            <View style={styles.fieldGroup}>
              <View style={styles.voiceTopRow}>
                <Pressable
                  disabled={disabled || loading}
                  onPress={() => (
                    voiceAssistant.status === 'listening'
                      ? voiceAssistant.stopListening()
                      : void voiceAssistant.startListening()
                  )}
                  style={({ pressed }) => [
                    styles.voiceMicButton,
                    voiceAssistant.status === 'listening' && styles.voiceMicButtonActive,
                    (disabled || loading) && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={voiceAssistant.status === 'listening' ? 'microphone' : 'microphone-outline'}
                    size={24}
                    color="#fff"
                  />
                </Pressable>
                <View style={styles.voiceCopy}>
                  <Text style={styles.voiceTitle}>
                    {voiceAssistant.status === 'listening' ? '正在听你说' : '点按说一句'}
                  </Text>
                  <Text style={styles.voiceHint}>
                    真实语音不可用时会自动变成模拟转写，发送后仍按 voice 类型问 AI。
                  </Text>
                </View>
              </View>

              {voiceAssistant.status === 'listening' ? (
                <View style={styles.voiceMeterTrack}>
                  <View style={[styles.voiceMeterFill, { width: `${Math.round(voiceAssistant.volume * 100)}%` }]} />
                </View>
              ) : null}

              {voiceAssistant.message ? (
                <Text style={styles.voiceMessage}>{voiceAssistant.message}</Text>
              ) : null}

              {voiceAssistant.interimTranscript ? (
                <Text style={styles.interimTranscript}>{voiceAssistant.interimTranscript}</Text>
              ) : null}

              <TextInput
                value={voiceTranscript}
                onChangeText={setVoiceTranscript}
                editable={!disabled && !loading && voiceAssistant.status !== 'listening'}
                placeholder="比如：我没有葱怎么办？"
                placeholderTextColor="#9a8d82"
                multiline
                style={styles.input}
              />

              {voiceAssistant.status !== 'listening' ? (
                <Pressable
                  disabled={disabled || loading}
                  onPress={voiceAssistant.openSimulatedInput}
                  style={({ pressed }) => [
                    styles.simulatedVoiceButton,
                    (disabled || loading) && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons name="keyboard-outline" size={18} color={COOKING_COLORS.text} />
                  <Text style={styles.simulatedVoiceButtonText}>先用打字模拟语音</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            disabled={!canSubmit}
            onPress={() => void submitQuestion()}
            style={({ pressed }) => [
              styles.sendButton,
              !canSubmit && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send-outline" size={18} color="#fff" />
                <Text style={styles.sendButtonText}>
                  {mode === 'photo' ? '看图回答' : mode === 'voice' ? '发送这句话' : '发送'}
                </Text>
              </>
            )}
          </Pressable>

          {answer ? (
            <View style={styles.answerBubble}>
              <View style={styles.answerMetaRow}>
                <Text style={styles.answerLabel}>做饭助手</Text>
                <Text style={styles.answerMeta}>
                  {getSuggestedActionLabel(answer)} · {getRiskLabel(answer)}
                </Text>
              </View>
              <Text style={styles.answerText}>{answer.answerText}</Text>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      ) : null}

      {disabled ? (
        <Text style={styles.disabledHint}>
          做饭助手需要真实教程和已保存进度；预览模式下暂不可用。
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    gap: 10,
    paddingTop: 18,
  },
  compactBar: {
    flexDirection: 'row',
    gap: 10,
    minHeight: COOKING_CONTROL_SIZE,
  },
  modeButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.surface,
    borderRadius: COOKING_RADIUS,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minWidth: 0,
    ...COOKING_SHADOW,
  },
  modeButtonActive: {
    backgroundColor: COOKING_COLORS.accent,
  },
  modeButtonText: {
    color: COOKING_COLORS.text,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  expandedPanel: {
    backgroundColor: COOKING_COLORS.surface,
    borderRadius: COOKING_RADIUS,
    gap: 11,
    padding: 16,
    ...COOKING_SHADOW,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  headingTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  headingTitle: {
    color: COOKING_COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 36,
  },
  fieldGroup: {
    gap: 9,
  },
  input: {
    backgroundColor: COOKING_COLORS.surface,
    borderColor: COOKING_COLORS.border,
    borderRadius: COOKING_RADIUS,
    borderWidth: 1,
    color: COOKING_COLORS.text,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActionButton: {
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderColor: COOKING_COLORS.border,
    borderRadius: COOKING_RADIUS,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: COOKING_CONTROL_SIZE,
  },
  photoActionButtonText: {
    color: COOKING_COLORS.text,
    fontWeight: '900',
  },
  photoPreviewCard: {
    alignItems: 'center',
    backgroundColor: '#f6efe7',
    borderRadius: COOKING_RADIUS,
    flexDirection: 'row',
    gap: 10,
    padding: 8,
  },
  photoPreview: {
    backgroundColor: COOKING_COLORS.border,
    borderRadius: Math.max(12, COOKING_RADIUS - 6),
    height: 64,
    width: 64,
  },
  photoPreviewTextBlock: {
    flex: 1,
    gap: 3,
  },
  photoPreviewTitle: {
    color: COOKING_COLORS.text,
    fontWeight: '900',
  },
  photoPreviewMeta: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
  },
  removePhotoButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  orRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingVertical: 2,
  },
  orLine: {
    backgroundColor: COOKING_COLORS.border,
    flex: 1,
    height: 1,
  },
  orText: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  voiceTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  voiceMicButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.secondary,
    borderRadius: COOKING_CONTROL_SIZE / 2,
    height: COOKING_CONTROL_SIZE,
    justifyContent: 'center',
    width: COOKING_CONTROL_SIZE,
  },
  voiceMicButtonActive: {
    backgroundColor: COOKING_COLORS.accent,
  },
  voiceCopy: {
    flex: 1,
    gap: 3,
  },
  voiceTitle: {
    color: COOKING_COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  voiceHint: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  voiceMeterTrack: {
    backgroundColor: COOKING_COLORS.border,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  voiceMeterFill: {
    backgroundColor: COOKING_COLORS.secondary,
    borderRadius: 999,
    height: '100%',
  },
  voiceMessage: {
    color: COOKING_COLORS.secondary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  interimTranscript: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  simulatedVoiceButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff7ed',
    borderColor: COOKING_COLORS.border,
    borderRadius: COOKING_RADIUS,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 13,
  },
  simulatedVoiceButtonText: {
    color: COOKING_COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.secondary,
    borderRadius: COOKING_RADIUS,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: COOKING_CONTROL_SIZE,
    ...COOKING_SHADOW,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  answerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0e9',
    borderRadius: COOKING_RADIUS,
    gap: 5,
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  answerMetaRow: {
    gap: 3,
  },
  answerLabel: {
    color: COOKING_COLORS.secondary,
    fontSize: 12,
    fontWeight: '900',
  },
  answerMeta: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
  },
  answerText: {
    color: '#294535',
    lineHeight: 22,
  },
  errorText: {
    color: COOKING_COLORS.errorText,
    lineHeight: 20,
  },
  disabledHint: {
    color: COOKING_COLORS.mutedText,
    fontSize: 12,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.42,
  },
  pressed: {
    opacity: 0.78,
  },
})
