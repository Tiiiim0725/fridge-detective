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
  rotate = '0deg',
}: {
  color: string
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
      <View style={styles.miniTileMark} />
      <View style={styles.miniTileShine} />
    </View>
  )
}

function MotionGlyph({
  visual,
}: {
  visual: CookingActionVisualVariant
}) {
  if (visual.pattern === 'gather') {
    return (
      <View style={styles.glyphStage}>
        <MiniTile color={visual.secondary} rotate="-8deg" />
        <MiniTile color="#fff8ee" rotate="6deg" />
        <MiniTile color={visual.accent} rotate="0deg" />
        <View style={[styles.gatherBowl, { borderColor: visual.accent }]} />
        <View style={[styles.gatherLeaf, { backgroundColor: visual.secondary }]} />
      </View>
    )
  }

  if (visual.pattern === 'wash') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.faucetStem, { backgroundColor: visual.accent }]} />
        <View style={[styles.faucetSpout, { backgroundColor: visual.accent }]} />
        <View style={[styles.waterDrop, { backgroundColor: visual.secondary }]} />
        <View style={[styles.waterStream, { backgroundColor: visual.accent }]} />
        <View style={[styles.waterStream, styles.waterStreamSmall, { backgroundColor: visual.accent }]} />
        <View style={[styles.washBasin, { borderColor: visual.secondary }]} />
        <View style={[styles.washLeaf, { backgroundColor: visual.secondary }]} />
        <View style={[styles.washSplash, { backgroundColor: visual.accent }]} />
        <View style={[styles.washSplash, styles.washSplashTwo, { backgroundColor: visual.accent }]} />
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
        <View style={[styles.cutPiece, styles.cutPieceTwo]} />
        <View style={[styles.cutPiece, styles.cutPieceThree]} />
        <View style={[styles.cutGuideLine, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'whisk') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.bowl, { borderColor: visual.accent, backgroundColor: '#fff8ed' }]} />
        <View style={[styles.bowlFill, { backgroundColor: visual.secondary }]} />
        <View style={[styles.whiskLine, { backgroundColor: visual.accent, transform: [{ rotate: '-28deg' }] }]} />
        <View style={[styles.whiskLine, { backgroundColor: visual.accent, transform: [{ rotate: '28deg' }] }]} />
        <View style={[styles.whiskHandle, { backgroundColor: visual.accent }]} />
        <View style={[styles.mixSwoosh, styles.whiskSwoosh, { borderColor: visual.accent }]} />
        <View style={[styles.eggOval, { backgroundColor: visual.secondary }]} />
        <View style={[styles.eggYolk, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'mix') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.bowl, { borderColor: visual.accent, backgroundColor: '#fff8ed' }]} />
        <View style={[styles.bowlFill, { backgroundColor: visual.secondary }]} />
        <View style={[styles.mixSpoon, { backgroundColor: visual.accent }]} />
        <View style={[styles.mixSwoosh, { borderColor: visual.accent }]} />
        <View style={[styles.mixDot, { backgroundColor: visual.accent }]} />
        <View style={[styles.mixDot, styles.mixDotTwo, { backgroundColor: visual.secondary }]} />
        <View style={[styles.mixDot, styles.mixDotThree, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'pour') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.pourCup, { borderColor: visual.accent }]} />
        <View style={[styles.pourStream, { backgroundColor: visual.secondary }]} />
        <View style={[styles.waterDrop, styles.pourDrop, { backgroundColor: visual.accent }]} />
        <View style={[styles.pourTargetBowl, { borderColor: visual.accent }]} />
        <View style={[styles.pourTargetFill, { backgroundColor: visual.secondary }]} />
      </View>
    )
  }

  if (visual.pattern === 'heat') {
    return (
      <View style={styles.glyphStage}>
        <View style={styles.pan} />
        <View style={styles.panShine} />
        <View style={styles.panHandle} />
        <View style={[styles.panIngredient, { backgroundColor: visual.secondary }]} />
        <View style={[styles.panIngredient, styles.panIngredientTwo, { backgroundColor: visual.accent }]} />
        <View style={[styles.heatWave, { borderColor: visual.accent }]} />
        <View style={[styles.heatWave, styles.heatWaveTwo, { borderColor: visual.secondary }]} />
        <View style={[styles.flame, { backgroundColor: visual.accent }]} />
        <View style={[styles.flame, styles.flameSmall, { backgroundColor: visual.secondary }]} />
      </View>
    )
  }

  if (visual.pattern === 'simmer') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.potLid, { backgroundColor: visual.accent }]} />
        <View style={[styles.pot, { backgroundColor: visual.secondary }]} />
        <View style={styles.potShine} />
        <View style={[styles.potLiquidLine, { backgroundColor: visual.accent }]} />
        <View style={[styles.potHandle, { backgroundColor: visual.accent }]} />
        <View style={[styles.potHandle, styles.potHandleRight, { backgroundColor: visual.accent }]} />
        <View style={[styles.bubble, { backgroundColor: visual.accent }]} />
        <View style={[styles.bubble, styles.bubbleTwo, { backgroundColor: visual.accent }]} />
        <View style={[styles.bubble, styles.bubbleThree, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  if (visual.pattern === 'steam') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.steamerLayer, { borderColor: visual.accent }]} />
        <View style={[styles.pot, { backgroundColor: visual.secondary }]} />
        <View style={[styles.steamerDot, { backgroundColor: visual.accent }]} />
        <View style={[styles.steamerDot, styles.steamerDotTwo, { backgroundColor: visual.accent }]} />
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
          <View style={[styles.ovenWindow, { borderColor: visual.secondary }]} />
          <View style={[styles.ovenTray, { backgroundColor: visual.secondary }]} />
          <View style={[styles.ovenFood, { backgroundColor: visual.accent }]} />
          <View style={[styles.ovenHeatLine, { backgroundColor: visual.accent }]} />
          <View style={[styles.ovenHeatLine, styles.ovenHeatLineTwo, { backgroundColor: visual.accent }]} />
          <View style={[styles.ovenKnob, { backgroundColor: visual.accent }]} />
        </View>
      </View>
    )
  }

  if (visual.pattern === 'plate') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.plate, { borderColor: visual.accent }]} />
        <View style={styles.plateShine} />
        <View style={[styles.plateInner, { borderColor: visual.secondary }]} />
        <View style={[styles.foodBlob, { backgroundColor: visual.secondary }]} />
        <View style={[styles.foodBlob, styles.foodBlobSmall, { backgroundColor: visual.accent }]} />
        <View style={[styles.plateSauce, { borderColor: visual.accent }]} />
        <View style={[styles.garnishDot, { backgroundColor: visual.secondary }]} />
      </View>
    )
  }

  if (visual.pattern === 'rest') {
    return (
      <View style={styles.glyphStage}>
        <View style={[styles.plate, { borderColor: visual.accent }]} />
        <View style={[styles.foodBlob, { backgroundColor: visual.secondary }]} />
        <View style={[styles.clockCircle, { borderColor: visual.accent }]} />
        <View style={[styles.clockHand, { backgroundColor: visual.accent }]} />
        <View style={[styles.clockHand, styles.clockHandShort, { backgroundColor: visual.accent }]} />
      </View>
    )
  }

  return (
    <View style={styles.glyphStage}>
      <View style={[styles.stirPan, { borderColor: visual.accent }]}>
        <View style={styles.stirPanShine} />
        <View style={[styles.panFood, { backgroundColor: visual.secondary }]} />
        <View style={[styles.panFood, styles.panFoodSmall, { backgroundColor: visual.accent }]} />
        <View style={[styles.stirFoodDot, { backgroundColor: visual.accent }]} />
      </View>
      <View style={[styles.spatulaHandle, { backgroundColor: visual.accent }]} />
      <View style={[styles.spatulaHead, { borderColor: visual.accent }]} />
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
      <View style={[styles.cartoonStage, { backgroundColor: visual.background }]}>
        <View style={[styles.cartoonHalo, { backgroundColor: visual.secondary }]} />
        <View style={[styles.cartoonDot, styles.cartoonDotLeft, { backgroundColor: visual.accent }]} />
        <View style={[styles.cartoonDot, styles.cartoonDotRight, { backgroundColor: visual.secondary }]} />
        <View style={[styles.counterTop, { backgroundColor: visual.secondary }]} />
        <View style={[styles.motionRing, { borderColor: visual.accent }]}>
          <View style={[styles.sceneGlow, { backgroundColor: visual.secondary }]} />
          <MotionGlyph visual={visual} />
        </View>
        <View style={styles.floorShadow} />
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
    <View style={[styles.frame, { borderColor: visual.secondary }]}>
      <View style={styles.topLine}>
        <View style={[styles.actionTypeBadge, { backgroundColor: visual.secondary }]}>
          <Text style={[styles.actionTypeText, { color: visual.accent }]}>
            {!action || action.assetType === 'placeholder' ? '动作卡片' : '动作素材'}
          </Text>
        </View>
        <Text style={[styles.motionLabel, { color: visual.accent }]}>{visual.motionLabel}</Text>
      </View>

      <View style={[styles.visualStageShell, { backgroundColor: visual.background }]}>
        {media}
      </View>

      <View style={styles.actionBlock}>
        <Text style={[styles.actionName, { color: visual.accent }]}>
          {action?.zhName ?? '动作示意'}
        </Text>
        {action?.shortHint ? <Text style={styles.shortHint}>{action.shortHint}</Text> : null}
      </View>

      <View style={styles.instructionPanel}>
        <Text style={styles.instruction}>{instruction}</Text>
      </View>

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
    backgroundColor: '#fffdf9',
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 372,
    overflow: 'hidden',
    padding: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    lineHeight: 17,
    textAlign: 'right',
  },
  visualStageShell: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 226,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  actionBlock: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  placeholderWrap: {
    alignItems: 'center',
    gap: 10,
  },
  cartoonStage: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 28,
    borderWidth: 1,
    height: 186,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 244,
  },
  cartoonHalo: {
    borderRadius: 94,
    height: 188,
    opacity: 0.34,
    position: 'absolute',
    right: -48,
    top: -42,
    width: 188,
  },
  cartoonDot: {
    borderRadius: 999,
    opacity: 0.7,
    position: 'absolute',
  },
  cartoonDotLeft: {
    height: 12,
    left: 27,
    top: 30,
    width: 12,
  },
  cartoonDotRight: {
    bottom: 45,
    height: 18,
    right: 31,
    width: 18,
  },
  counterTop: {
    borderRadius: 999,
    bottom: 28,
    height: 18,
    opacity: 0.42,
    position: 'absolute',
    width: 158,
  },
  motionRing: {
    alignItems: 'center',
    backgroundColor: '#fffaf2',
    borderRadius: 76,
    borderWidth: 2,
    height: 152,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 152,
    ...COOKING_SHADOW,
  },
  sceneGlow: {
    borderRadius: 60,
    height: 120,
    opacity: 0.22,
    position: 'absolute',
    width: 120,
  },
  floorShadow: {
    backgroundColor: 'rgba(80, 61, 44, 0.16)',
    borderRadius: 999,
    bottom: 20,
    height: 14,
    position: 'absolute',
    width: 110,
  },
  glyphStage: {
    alignItems: 'center',
    height: 122,
    justifyContent: 'center',
    width: 122,
  },
  miniTile: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.74)',
    borderRadius: 20,
    borderWidth: 2,
    height: 54,
    justifyContent: 'center',
    position: 'absolute',
    width: 54,
    ...COOKING_SHADOW,
  },
  miniTileMark: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderRadius: 999,
    height: 18,
    width: 18,
  },
  miniTileShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
    borderRadius: 999,
    height: 8,
    left: 13,
    position: 'absolute',
    top: 11,
    width: 18,
  },
  gatherBowl: {
    backgroundColor: '#fff8ee',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 3,
    bottom: 20,
    height: 36,
    position: 'absolute',
    width: 76,
    ...COOKING_SHADOW,
  },
  gatherLeaf: {
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 31,
    left: 20,
    position: 'absolute',
    top: 27,
    transform: [{ rotate: '-32deg' }],
    width: 22,
  },
  waterDrop: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    height: 58,
    transform: [{ rotate: '45deg' }],
    width: 58,
    ...COOKING_SHADOW,
  },
  faucetStem: {
    borderRadius: 999,
    height: 36,
    left: 28,
    position: 'absolute',
    top: 8,
    width: 8,
  },
  faucetSpout: {
    borderRadius: 999,
    height: 8,
    left: 28,
    position: 'absolute',
    top: 8,
    width: 48,
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
  washBasin: {
    backgroundColor: '#fffaf2',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    bottom: 18,
    height: 38,
    position: 'absolute',
    width: 84,
    ...COOKING_SHADOW,
  },
  washLeaf: {
    borderBottomLeftRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 18,
    bottom: 30,
    height: 24,
    position: 'absolute',
    transform: [{ rotate: '-24deg' }],
    width: 18,
  },
  washSplash: {
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    right: 28,
    top: 42,
    width: 8,
  },
  washSplashTwo: {
    left: 46,
    top: 36,
  },
  knifeBlade: {
    borderRadius: 10,
    height: 16,
    position: 'absolute',
    top: 33,
    transform: [{ rotate: '-28deg' }],
    width: 90,
    ...COOKING_SHADOW,
  },
  knifeHandle: {
    backgroundColor: '#5c463a',
    borderRadius: 10,
    height: 21,
    position: 'absolute',
    right: 17,
    top: 22,
    transform: [{ rotate: '-28deg' }],
    width: 33,
  },
  cutBoard: {
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 22,
    borderWidth: 2,
    bottom: 26,
    height: 49,
    position: 'absolute',
    width: 96,
    ...COOKING_SHADOW,
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
  cutPieceTwo: {
    bottom: 43,
    left: 55,
    transform: [{ rotate: '14deg' }],
  },
  cutPieceThree: {
    bottom: 34,
    height: 14,
    left: 43,
    transform: [{ rotate: '-10deg' }],
    width: 14,
  },
  cutGuideLine: {
    borderRadius: 999,
    bottom: 38,
    height: 3,
    position: 'absolute',
    transform: [{ rotate: '-18deg' }],
    width: 48,
  },
  bowl: {
    backgroundColor: '#fffaf2',
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 3,
    bottom: 22,
    height: 50,
    position: 'absolute',
    width: 90,
    ...COOKING_SHADOW,
  },
  bowlFill: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    bottom: 28,
    height: 18,
    opacity: 0.45,
    position: 'absolute',
    width: 72,
  },
  whiskLine: {
    borderRadius: 999,
    height: 80,
    position: 'absolute',
    top: 10,
    width: 7,
  },
  whiskHandle: {
    borderRadius: 999,
    height: 62,
    position: 'absolute',
    top: 6,
    transform: [{ rotate: '8deg' }],
    width: 5,
  },
  whiskSwoosh: {
    height: 50,
    opacity: 0.38,
    top: 34,
    transform: [{ rotate: '28deg' }],
    width: 58,
  },
  eggOval: {
    borderRadius: 999,
    height: 34,
    left: 30,
    position: 'absolute',
    top: 54,
    transform: [{ rotate: '-14deg' }],
    width: 44,
  },
  eggYolk: {
    borderRadius: 999,
    height: 17,
    left: 43,
    position: 'absolute',
    top: 62,
    width: 17,
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
  mixDot: {
    borderRadius: 999,
    bottom: 38,
    height: 9,
    left: 36,
    position: 'absolute',
    width: 9,
  },
  mixDotTwo: {
    bottom: 45,
    left: 55,
    opacity: 0.82,
  },
  mixDotThree: {
    bottom: 34,
    left: 66,
    opacity: 0.7,
  },
  pourCup: {
    backgroundColor: '#fffaf2',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 4,
    height: 56,
    left: 16,
    position: 'absolute',
    top: 13,
    transform: [{ rotate: '-26deg' }],
    width: 58,
    ...COOKING_SHADOW,
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
  pourTargetBowl: {
    backgroundColor: '#fffaf2',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 3,
    bottom: 18,
    height: 37,
    position: 'absolute',
    right: 18,
    width: 66,
    ...COOKING_SHADOW,
  },
  pourTargetFill: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    bottom: 24,
    height: 12,
    opacity: 0.5,
    position: 'absolute',
    right: 29,
    width: 44,
  },
  pan: {
    backgroundColor: '#4f443f',
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 42,
    borderWidth: 2,
    height: 74,
    position: 'absolute',
    top: 35,
    width: 94,
    ...COOKING_SHADOW,
  },
  panIngredient: {
    borderRadius: 999,
    height: 15,
    left: 36,
    position: 'absolute',
    top: 52,
    width: 22,
  },
  panShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 999,
    height: 8,
    left: 30,
    position: 'absolute',
    top: 49,
    width: 36,
  },
  panIngredientTwo: {
    height: 13,
    left: 57,
    top: 57,
    width: 13,
  },
  heatWave: {
    borderLeftWidth: 3,
    borderRadius: 18,
    borderTopWidth: 3,
    height: 30,
    left: 32,
    position: 'absolute',
    top: 12,
    transform: [{ rotate: '42deg' }],
    width: 14,
  },
  heatWaveTwo: {
    left: 55,
    opacity: 0.85,
    top: 9,
  },
  panHandle: {
    backgroundColor: '#4f443f',
    borderRadius: 999,
    height: 10,
    position: 'absolute',
    right: -2,
    top: 67,
    width: 43,
  },
  flame: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 6,
    height: 38,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 31,
  },
  flameSmall: {
    bottom: 12,
    height: 22,
    width: 18,
  },
  pot: {
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    bottom: 22,
    height: 63,
    position: 'absolute',
    width: 94,
    ...COOKING_SHADOW,
  },
  potLid: {
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    top: 44,
    width: 82,
  },
  potLiquidLine: {
    borderRadius: 999,
    bottom: 52,
    height: 4,
    opacity: 0.75,
    position: 'absolute',
    width: 68,
  },
  potShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderRadius: 999,
    bottom: 59,
    height: 7,
    left: 31,
    position: 'absolute',
    width: 38,
  },
  potHandle: {
    borderRadius: 999,
    bottom: 47,
    height: 11,
    left: 6,
    position: 'absolute',
    width: 17,
  },
  potHandleRight: {
    left: undefined,
    right: 6,
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
  steamerLayer: {
    backgroundColor: '#fffaf2',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderRadius: 12,
    bottom: 76,
    height: 22,
    position: 'absolute',
    width: 82,
    ...COOKING_SHADOW,
  },
  steamerDot: {
    borderRadius: 999,
    bottom: 82,
    height: 8,
    left: 35,
    position: 'absolute',
    width: 8,
  },
  steamerDotTwo: {
    left: 58,
  },
  ovenBox: {
    backgroundColor: '#fffaf2',
    borderRadius: 18,
    borderWidth: 4,
    height: 88,
    justifyContent: 'center',
    padding: 10,
    width: 106,
    ...COOKING_SHADOW,
  },
  ovenWindow: {
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 13,
    borderWidth: 3,
    height: 48,
    left: 13,
    position: 'absolute',
    top: 20,
    width: 64,
  },
  ovenTray: {
    borderRadius: 10,
    height: 28,
    width: '100%',
  },
  ovenFood: {
    borderRadius: 999,
    bottom: 24,
    height: 14,
    left: 34,
    position: 'absolute',
    width: 28,
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
  ovenKnob: {
    borderRadius: 999,
    height: 9,
    position: 'absolute',
    right: 10,
    top: 14,
    width: 9,
  },
  plate: {
    backgroundColor: '#fffaf2',
    borderRadius: 48,
    borderWidth: 5,
    height: 102,
    position: 'absolute',
    width: 102,
    ...COOKING_SHADOW,
  },
  plateInner: {
    borderRadius: 36,
    borderWidth: 2,
    height: 70,
    opacity: 0.6,
    position: 'absolute',
    width: 70,
  },
  plateShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderRadius: 999,
    height: 10,
    left: 35,
    position: 'absolute',
    top: 28,
    transform: [{ rotate: '-18deg' }],
    width: 34,
  },
  foodBlob: {
    borderRadius: 22,
    height: 46,
    position: 'absolute',
    width: 62,
  },
  foodBlobSmall: {
    height: 24,
    right: 32,
    top: 34,
    width: 30,
  },
  plateSauce: {
    borderBottomWidth: 4,
    borderRadius: 26,
    height: 36,
    opacity: 0.55,
    position: 'absolute',
    top: 43,
    transform: [{ rotate: '-18deg' }],
    width: 54,
  },
  garnishDot: {
    borderRadius: 999,
    height: 10,
    position: 'absolute',
    right: 31,
    top: 30,
    width: 10,
  },
  clockCircle: {
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    position: 'absolute',
    right: 24,
    top: 21,
    width: 36,
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
    backgroundColor: '#fffaf2',
    borderRadius: 48,
    borderWidth: 4,
    height: 102,
    justifyContent: 'center',
    width: 102,
    ...COOKING_SHADOW,
  },
  panFood: {
    borderRadius: 20,
    height: 32,
    transform: [{ rotate: '-18deg' }],
    width: 42,
  },
  stirPanShine: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 999,
    height: 9,
    left: 25,
    position: 'absolute',
    top: 26,
    transform: [{ rotate: '-16deg' }],
    width: 42,
  },
  panFoodSmall: {
    height: 18,
    marginLeft: -8,
    marginTop: -8,
    opacity: 0.82,
    transform: [{ rotate: '22deg' }],
    width: 26,
  },
  stirFoodDot: {
    borderRadius: 999,
    height: 11,
    position: 'absolute',
    right: 23,
    top: 25,
    width: 11,
  },
  spatulaHandle: {
    borderRadius: 999,
    height: 72,
    position: 'absolute',
    right: 22,
    top: 15,
    transform: [{ rotate: '42deg' }],
    width: 6,
  },
  spatulaHead: {
    borderRadius: 9,
    borderWidth: 3,
    height: 24,
    position: 'absolute',
    right: 48,
    top: 54,
    transform: [{ rotate: '42deg' }],
    width: 30,
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
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  gesturePillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  actionName: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  shortHint: {
    color: COOKING_COLORS.mutedText,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 360,
    textAlign: 'center',
  },
  mediaFrame: {
    borderRadius: 22,
    height: 184,
    maxWidth: '100%',
    overflow: 'hidden',
    width: 304,
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
  instructionPanel: {
    alignSelf: 'stretch',
    backgroundColor: '#fffaf2',
    borderColor: '#eee4d7',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  instruction: {
    color: COOKING_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
    maxWidth: 560,
    textAlign: 'center',
    width: '100%',
  },
  progressTrack: {
    backgroundColor: '#efe8de',
    borderRadius: 3,
    height: 5,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    borderRadius: 3,
    height: '100%',
  },
})
