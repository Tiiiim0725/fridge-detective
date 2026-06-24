import type { CookingActionAssetType } from '@/types/tutorial'

export type CookingActionVisualVariant = {
  accent: string
  background: string
  secondary: string
  gestureLabel: string
  motionLabel: string
  pattern: 'gather' | 'wash' | 'cut' | 'whisk' | 'heat' | 'stir' | 'simmer' | 'plate'
}

export type CookingActionMediaCapability = {
  assetType: CookingActionAssetType
  label: string
  description: string
}

export const COOKING_ACTION_MEDIA_CAPABILITIES: CookingActionMediaCapability[] = [
  {
    assetType: 'placeholder',
    label: 'Placeholder',
    description: '当前用程序化动作卡片展示，不依赖外部素材。',
  },
  {
    assetType: 'image',
    label: 'Image',
    description: '可直接展示静态步骤图。',
  },
  {
    assetType: 'gif',
    label: 'GIF',
    description: '可展示短循环动作动图。',
  },
  {
    assetType: 'svg',
    label: 'SVG',
    description: '可展示轻量矢量动作图。',
  },
  {
    assetType: 'lottie',
    label: 'Lottie',
    description: '已预留 Lottie 分支，后续接播放器即可。',
  },
  {
    assetType: 'video',
    label: 'Video',
    description: '已预留视频分支，后续接播放器即可。',
  },
]

const fallbackVisual: CookingActionVisualVariant = {
  accent: '#c76532',
  background: '#f3f0ec',
  secondary: '#f7dfc8',
  gestureLabel: '看动作',
  motionLabel: '跟着当前步骤做',
  pattern: 'stir',
}

const actionVisuals: Record<string, CookingActionVisualVariant> = {
  prep_ingredients: {
    accent: '#9d6a34',
    background: '#f4ecdf',
    secondary: '#ead6b8',
    gestureLabel: '摆齐食材',
    motionLabel: '先把会用到的东西放到手边',
    pattern: 'gather',
  },
  wash: {
    accent: '#3c7d87',
    background: '#eaf4f3',
    secondary: '#c5e2e0',
    gestureLabel: '轻轻冲洗',
    motionLabel: '让水流带走表面杂质',
    pattern: 'wash',
  },
  cut_chunks: {
    accent: '#8a5a44',
    background: '#f0e8df',
    secondary: '#dec6b4',
    gestureLabel: '切成块',
    motionLabel: '让大小尽量接近',
    pattern: 'cut',
  },
  slice: {
    accent: '#8a5a44',
    background: '#f0e8df',
    secondary: '#dec6b4',
    gestureLabel: '切成片',
    motionLabel: '保持厚薄大致一致',
    pattern: 'cut',
  },
  dice: {
    accent: '#8a5a44',
    background: '#f0e8df',
    secondary: '#dec6b4',
    gestureLabel: '切成丁',
    motionLabel: '先切条，再切成小块',
    pattern: 'cut',
  },
  beat_eggs: {
    accent: '#d08a2d',
    background: '#fbf0d7',
    secondary: '#f2d495',
    gestureLabel: '顺向搅打',
    motionLabel: '搅到蛋清蛋黄融合',
    pattern: 'whisk',
  },
  mix: {
    accent: '#7d6aa7',
    background: '#f0ecf6',
    secondary: '#d6cbe8',
    gestureLabel: '翻拌混合',
    motionLabel: '从底部把食材带上来',
    pattern: 'stir',
  },
  heat_pan: {
    accent: '#b8563c',
    background: '#f7e8df',
    secondary: '#e8bca8',
    gestureLabel: '先热锅',
    motionLabel: '等锅面热起来再继续',
    pattern: 'heat',
  },
  add_oil: {
    accent: '#c3902f',
    background: '#f8efd9',
    secondary: '#ecd59c',
    gestureLabel: '沿边倒油',
    motionLabel: '转动锅面铺开一层薄油',
    pattern: 'heat',
  },
  stir_fry: {
    accent: '#c76532',
    background: '#f4e7dc',
    secondary: '#e6b68f',
    gestureLabel: '快速翻炒',
    motionLabel: '让食材持续移动，不要停在一处',
    pattern: 'stir',
  },
  simmer: {
    accent: '#416f53',
    background: '#eaf1e9',
    secondary: '#c7ddca',
    gestureLabel: '小火慢煮',
    motionLabel: '保持轻微冒泡，不要大滚',
    pattern: 'simmer',
  },
  season_and_plate: {
    accent: '#a24f43',
    background: '#f5e8e3',
    secondary: '#e3bcb4',
    gestureLabel: '调味装盘',
    motionLabel: '少量多次调整味道',
    pattern: 'plate',
  },
}

export function getCookingActionVisual(actionKey?: string | null): CookingActionVisualVariant {
  return actionKey ? actionVisuals[actionKey] ?? fallbackVisual : fallbackVisual
}
