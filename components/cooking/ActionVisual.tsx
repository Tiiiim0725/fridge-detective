import { Image } from 'expo-image'
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  COOKING_ACTION_MEDIA_CAPABILITIES,
  getCookingActionVisual,
  type CookingActionVisualVariant,
} from '@/constants/cookingActionVisuals'
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

function MiniTile({
  color,
  label,
  rotate = '0deg',
}: {
  color: string
  label: string
  rotate?: `${number}deg`
}) {
  return (
    <View style={[
      styles.miniTile,
      {
        backgroundColor: color,
        transform: [{ rotate }],
      },
    ]}>
      <Text style={styles.miniTileLabel}>{label}</Text>
    </View>
  )
}

function MotionGlyph({
  action,
  visual,
}: {
  action: CookingActionAsset | null
  visual: CookingActionVisualVariant
}) {
  if (visual.pattern === 'gather') {
    return (
      <View style={styles.glyphStage}>
        <MiniTile color={visual.secondary} label="菜" rotate="-8deg" />
        <MiniTile color="#fff8ee" label="碗" rotate="6deg" />
        <MiniTile color={visual.accent} label="锅" rotate="0deg" />
      </View>
    )
  }

  if (visual.pattern === 'wash') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.waterDrop, { backgroundColor: visual.secondary }]} />
        <View style={[styles.waterStream, { backgroundColor: visual.accent }]} />
        <View style={[styles.waterStream, styles.waterStreamSmall, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'cut') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.knifeBlade, { backgroundColor: visual.accent }]} />
        <View style={styles.knifeHandle} />
        <View style={[styles.cutBoard, { backgroundColor: visual.secondary }]} />
        <View style={styles.cutPiece} />
      </View>
    )
  }

  if (visual.pattern === 'whisk') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.bowl, { borderColor: visual.accent, backgroundColor: '#fff8ed' }]} />
        <View style={[styles.whiskLine, { backgroundColor: visual.accent, transform: [{ rotate: '-28deg' }] }]} />
        <View style={[styles.whiskLine, { backgroundColor: visual.accent, transform: [{ rotate: '28deg' }] }]} />
        <Text style={styles.motionIcon}>{action?.fallbackIcon ?? '🥚'}</Text>
      </View>
    )
  }

  if (visual.pattern === 'mix') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.bowl, { borderColor: visual.accent, backgroundColor: '#fff8ed' }]} />
        <View style={[styles.mixSpoon, { backgroundColor: visual.accent }]} />
        <View style={[styles.mixSwoosh, { borderColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'pour') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.pourCup, { borderColor: visual.accent }]} />
        <View style={[styles.pourStream, { backgroundColor: visual.secondary }]} />
        <View style={[styles.waterDrop, styles.pourDrop, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'heat') {
    return (
      <View style={styles.glyphStage}>
        <View style={styles.pan} />
        <View style={styles.panHandle} />
        <View style={[styles.flame, { backgroundColor: visual.accent }]} />
        <View style={[styles.flame, styles.flameSmall, { backgroundColor: visual.secondary }]} />
      </View>
    )
  }

  if (visual.pattern === 'simmer') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.pot, { backgroundColor: visual.secondary }]} />
        <View style={[styles.bubble, { backgroundColor: visual.accent }]} />
        <View style={[styles.bubble, styles.bubbleTwo, { backgroundColor: visual.accent }]} />
        <View style={[styles.bubble, styles.bubbleThree, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'steam') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.pot, { backgroundColor: visual.secondary }]} />
        <View style={[styles.steamWisp, { borderColor: visual.accent }]} />
        <View style={[styles.steamWisp, styles.steamWispTwo, { borderColor: visual.accent }]} />
        <View style={[styles.steamWisp, styles.steamWispThree, { borderColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'oven') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.ovenBox, { borderColor: visual.accent }]}>
          <View style={[styles.ovenTray, { backgroundColor: visual.secondary }]} />
          <View style={[styles.ovenHeatLine, { backgroundColor: visual.accent }]} />
          <View style={[styles.ovenHeatLine, styles.ovenHeatLineTwo, { backgroundColor: visual.accent }]} />
        </View>
      </View>
    )
  }

  if (visual.pattern === 'plate') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.plate, { borderColor: visual.accent }]} />
        <View style={[styles.foodBlob, { backgroundColor: visual.secondary }]} />
        <View style={[styles.foodBlob, styles.foodBlobSmall, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'rest') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.plate, { borderColor: visual.accent }]} />
        <View style={[styles.foodBlob, { backgroundColor: visual.secondary }]} />
        <View style={[styles.clockHand, { backgroundColor: visual.accent }]} />
        <View style={[styles.clockHand, styles.clockHandShort, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  return (
    <View style={styles.glyphStage}>
      <View style={[styles.stirPan, { borderColor: visual.accent }]}>
        <Text style={styles.motionIcon}>{action?.fallbackIcon ?? '🍳'}</Text>
      </View>
      <View style={[styles.stirSwoosh, { borderColor: visual.accent }]} />
      <View style={[styles.stirSwoosh, styles.stirSwooshTwo, { borderColor: visual.accent }]} />
    </View>
  )
}

function PlaceholderMedia({
  action,
  visual,
}: {
  action: CookingActionAsset | null
  visual: CookingActionVisualVariant
}) {
  return (
    <View style={styles.placeholderWrap}>
      <View style={[styles.motionRing, { borderColor: visual.accent }]}>
        <MotionGlyph action={action} visual={visual} />
      </View>
      <View style={[styles.gesturePill, { backgroundColor: visual.accent }]}>
        <Text style={styles.gesturePillText}>{visual.gestureLabel}</Text>
      </View>
    </View>
  )
}

function PendingPlayer({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <View style={styles.pendingPlayer}>
      <Text style={styles.pendingTitle}>{label}</Text>
      <Text style={styles.pendingHint}>{description}</Text>
    </View>
  )
}

function getMediaCapability(assetType: CookingActionAsset['assetType']) {
  return COOKING_ACTION_MEDIA_CAPABILITIES.find((item) => item.assetType === assetType)
}

function ActionMediaPlayer({
  action,
  visual,
}: {
  action: CookingActionAsset | null
  visual: CookingActionVisualVariant
}) {
  if (!action?.assetUrl || action.assetType === 'placeholder') {
    return <PlaceholderMedia action={action} visual={visual} />
  }

  if (action.assetType === 'image' || action.assetType === 'gif' || action.assetType === 'svg') {
    return (
      <View style={styles.mediaFrame}>
        <Image source={{ uri: action.assetUrl }} contentFit="cover" style={styles.image} />
      </View>
    )
  }

  if (action.assetType === 'lottie') {
    const capability = getMediaCapability(action.assetType)
    return (
      <PendingPlayer
        label={capability?.label ?? 'Lottie 动效'}
        description="动作素材已经有 URL，等待接入 Lottie 播放器后即可替换当前占位。"
      />
    )
  }

  if (action.assetType === 'video') {
    const capability = getMediaCapability(action.assetType)
    return (
      <PendingPlayer
        label={capability?.label ?? '短视频'}
        description="动作素材已经有 URL，等待接入视频播放器后即可播放。"
      />
    )
  }

  return <PlaceholderMedia action={action} visual={visual} />
}

export function ActionVisual({ action, instruction, progress }: ActionVisualProps) {
  const visual = getCookingActionVisual(action?.actionKey)
  const media: ReactNode = <ActionMediaPlayer action={action} visual={visual} />

  return (
    <View style={[styles.frame, { backgroundColor: visual.background }]}>
      <View style={styles.topLine}>
        <View style={[styles.actionTypeBadge, { backgroundColor: visual.secondary }]}>
          <Text style={[styles.actionTypeText, { color: visual.accent }]}>
            {!action || action.assetType === 'placeholder' ? '动作卡片' : '动作素材'}
          </Text>
        </View>
        <Text style={[styles.motionLabel, { color: visual.accent }]}>{visual.motionLabel}</Text>
      </View>

      <View style={styles.actionBlock}>
        {media}
        <Text style={[styles.actionName, { color: visual.accent }]}>
          {action?.zhName ?? '动作示意'}
        </Text>
        {action?.shortHint ? <Text style={styles.shortHint}>{action.shortHint}</Text> : null}
      </View>

      <Text style={styles.instruction}>{instruction}</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: visual.accent,
              width: `${Math.round(progress * 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    borderRadius: COOKING_RADIUS,
    gap: 18,
    justifyContent: 'space-between',
    minHeight: 390,
    overflow: 'hidden',
    paddingBottom: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
    width: '100%',
    ...COOKING_SHADOW,
  },
  topLine: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionTypeBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  actionTypeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  motionLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  actionBlock: {
    alignItems: 'center',
    gap: 9,
  },
  placeholderWrap: {
    alignItems: 'center',
    gap: 10,
  },
  motionRing: {
    alignItems: 'center',
    borderRadius: 82,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 164,
    justifyContent: 'center',
    width: 164,
  },
  glyphStage: {
    alignItems: 'center',
    height: 116,
    justifyContent: 'center',
    width: 116,
  },
  motionIcon: {
    fontSize: 36,
  },
  miniTile: {
    alignItems: 'center',
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    width: 48,
  },
  miniTileLabel: {
    color: '#4a3930',
    fontWeight: '900',
  },
  waterDrop: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    height: 54,
    transform: [{ rotate: '45deg' }],
    width: 54,
  },
  waterStream: {
    borderRadius: 999,
    height: 72,
    position: 'absolute',
    right: 28,
    transform: [{ rotate: '24deg' }],
    width: 9,
  },
  waterStreamSmall: {
    height: 48,
    left: 30,
  },
  knifeBlade: {
    borderRadius: 8,
    height: 14,
    position: 'absolute',
    top: 36,
    transform: [{ rotate: '-28deg' }],
    width: 82,
  },
  knifeHandle: {
    backgroundColor: '#5c463a',
    borderRadius: 8,
    height: 18,
    position: 'absolute',
    right: 20,
    top: 26,
    transform: [{ rotate: '-28deg' }],
    width: 28,
  },
  cutBoard: {
    borderRadius: 18,
    bottom: 26,
    height: 45,
    position: 'absolute',
    width: 86,
  },
  cutPiece: {
    backgroundColor: '#fff6e8',
    borderRadius: 9,
    bottom: 43,
    height: 18,
    left: 31,
    position: 'absolute',
    width: 18,
  },
  bowl: {
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 3,
    bottom: 22,
    height: 46,
    position: 'absolute',
    width: 82,
  },
  whiskLine: {
    borderRadius: 999,
    height: 80,
    position: 'absolute',
    top: 10,
    width: 7,
  },
  mixSpoon: {
    borderRadius: 999,
    height: 86,
    position: 'absolute',
    top: 12,
    transform: [{ rotate: '32deg' }],
    width: 8,
  },
  mixSwoosh: {
    borderBottomWidth: 4,
    borderRadius: 40,
    borderRightWidth: 4,
    height: 64,
    position: 'absolute',
    transform: [{ rotate: '-18deg' }],
    width: 70,
  },
  pourCup: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 4,
    height: 52,
    left: 20,
    position: 'absolute',
    top: 16,
    transform: [{ rotate: '-26deg' }],
    width: 52,
  },
  pourStream: {
    borderRadius: 999,
    height: 70,
    position: 'absolute',
    right: 33,
    top: 35,
    transform: [{ rotate: '26deg' }],
    width: 9,
  },
  pourDrop: {
    bottom: 14,
    height: 28,
    position: 'absolute',
    right: 25,
    width: 28,
  },
  pan: {
    backgroundColor: '#4f443f',
    borderRadius: 38,
    height: 68,
    position: 'absolute',
    top: 35,
    width: 86,
  },
  panHandle: {
    backgroundColor: '#4f443f',
    borderRadius: 999,
    height: 10,
    position: 'absolute',
    right: 3,
    top: 64,
    width: 38,
  },
  flame: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 6,
    height: 34,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 28,
  },
  flameSmall: {
    bottom: 12,
    height: 22,
    width: 18,
  },
  pot: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    bottom: 22,
    height: 58,
    position: 'absolute',
    width: 86,
  },
  bubble: {
    borderRadius: 999,
    height: 14,
    position: 'absolute',
    top: 14,
    width: 14,
  },
  bubbleTwo: {
    left: 29,
    top: 35,
  },
  bubbleThree: {
    right: 25,
    top: 42,
  },
  steamWisp: {
    borderLeftWidth: 4,
    borderRadius: 18,
    borderTopWidth: 4,
    height: 42,
    position: 'absolute',
    top: 10,
    transform: [{ rotate: '22deg' }],
    width: 22,
  },
  steamWispTwo: {
    left: 40,
    top: 2,
  },
  steamWispThree: {
    right: 32,
    top: 9,
  },
  ovenBox: {
    borderRadius: 18,
    borderWidth: 4,
    height: 82,
    justifyContent: 'center',
    padding: 10,
    width: 100,
  },
  ovenTray: {
    borderRadius: 10,
    height: 28,
    width: '100%',
  },
  ovenHeatLine: {
    borderRadius: 999,
    height: 5,
    left: 18,
    position: 'absolute',
    top: 15,
    width: 48,
  },
  ovenHeatLineTwo: {
    top: 62,
  },
  plate: {
    borderRadius: 48,
    borderWidth: 5,
    height: 96,
    position: 'absolute',
    width: 96,
  },
  foodBlob: {
    borderRadius: 22,
    height: 44,
    position: 'absolute',
    width: 58,
  },
  foodBlobSmall: {
    height: 24,
    right: 32,
    top: 34,
    width: 30,
  },
  clockHand: {
    borderRadius: 999,
    height: 42,
    position: 'absolute',
    transform: [{ rotate: '16deg' }],
    width: 5,
  },
  clockHandShort: {
    height: 28,
    transform: [{ rotate: '88deg' }],
  },
  stirPan: {
    alignItems: 'center',
    borderRadius: 48,
    borderWidth: 4,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  stirSwoosh: {
    borderLeftWidth: 4,
    borderRadius: 36,
    borderTopWidth: 4,
    height: 64,
    position: 'absolute',
    transform: [{ rotate: '38deg' }],
    width: 64,
  },
  stirSwooshTwo: {
    height: 88,
    opacity: 0.45,
    transform: [{ rotate: '-18deg' }],
    width: 88,
  },
  gesturePill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  gesturePillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  actionName: {
    fontSize: 24,
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
    height: 190,
    maxWidth: '100%',
    overflow: 'hidden',
    width: 320,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  pendingPlayer: {
    alignItems: 'center',
    height: 170,
    justifyContent: 'center',
    maxWidth: '100%',
    width: 320,
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
    maxWidth: 300,
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
    borderRadius: 3,
    height: '100%',
  },
})
