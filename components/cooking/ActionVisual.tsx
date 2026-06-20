import { Image, StyleSheet, Text, View } from 'react-native'

import {
  COOKING_COLORS,
  COOKING_RADIUS,
  COOKING_SHADOW,
} from '@/constants/cookingUi'
import type { CookingActionAsset } from '@/types/tutorial'

type ActionVisualProps = {
  action: CookingActionAsset | null
  instruction: string
  progress: number
}

function PlaceholderMedia({ action }: { action: CookingActionAsset | null }) {
  return (
    <View style={styles.motionRing}>
      <Text style={styles.icon}>{action?.fallbackIcon ?? '🍳'}</Text>
    </View>
  )
}

function PendingPlayer({ label }: { label: string }) {
  return (
    <View style={styles.pendingPlayer}>
      <Text style={styles.pendingTitle}>{label}</Text>
      <Text style={styles.pendingHint}>动作素材已经预留，播放器将在后续体验轮接入。</Text>
    </View>
  )
}

export function ActionVisual({ action, instruction, progress }: ActionVisualProps) {
  let media: React.ReactNode = <PlaceholderMedia action={action} />

  if (action?.assetUrl) {
    if (action.assetType === 'image' || action.assetType === 'gif' || action.assetType === 'svg') {
      media = (
        <View style={styles.mediaFrame}>
          <Image source={{ uri: action.assetUrl }} resizeMode="cover" style={styles.image} />
        </View>
      )
    } else if (action.assetType === 'lottie') {
      media = <PendingPlayer label="Lottie 动作" />
    } else if (action.assetType === 'video') {
      media = <PendingPlayer label="步骤视频" />
    }
  }

  return (
    <View style={styles.frame}>
      <View style={styles.actionBlock}>
        {media}
        <Text style={styles.actionName}>{action?.zhName ?? '动作示意'}</Text>
        {action?.shortHint ? <Text style={styles.shortHint}>{action.shortHint}</Text> : null}
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: COOKING_COLORS.actionSurface,
    borderRadius: COOKING_RADIUS,
    gap: 18,
    justifyContent: 'space-between',
    minHeight: 350,
    overflow: 'hidden',
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 30,
    width: '100%',
    ...COOKING_SHADOW,
  },
  actionBlock: {
    alignItems: 'center',
    gap: 9,
  },
  motionRing: {
    alignItems: 'center',
    borderColor: COOKING_COLORS.accent,
    borderRadius: 62,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 124,
    justifyContent: 'center',
    width: 124,
  },
  icon: {
    fontSize: 58,
  },
  actionName: {
    color: COOKING_COLORS.accent,
    fontSize: 22,
    fontWeight: '900',
  },
  shortHint: {
    color: COOKING_COLORS.mutedText,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 360,
    textAlign: 'center',
  },
  mediaFrame: {
    borderRadius: COOKING_RADIUS,
    height: 170,
    maxWidth: '100%',
    overflow: 'hidden',
    width: 300,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  pendingPlayer: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    maxWidth: '100%',
    width: 300,
  },
  pendingTitle: {
    color: COOKING_COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  pendingHint: {
    color: COOKING_COLORS.mutedText,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  instruction: {
    color: COOKING_COLORS.text,
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 560,
    textAlign: 'center',
    width: '100%',
  },
  progressTrack: {
    backgroundColor: COOKING_COLORS.surface,
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: COOKING_COLORS.accent,
    borderRadius: 3,
    height: '100%',
  },
})
