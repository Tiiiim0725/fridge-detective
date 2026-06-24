import type { CookingActionAssetType } from '@/types/tutorial'

export type CookingActionVisualPattern =
  | 'gather'
  | 'wash'
  | 'cut'
  | 'whisk'
  | 'mix'
  | 'pour'
  | 'heat'
  | 'stir'
  | 'simmer'
  | 'steam'
  | 'oven'
  | 'plate'
  | 'rest'

export type CookingActionVisualVariant = {
  accent: string
  background: string
  secondary: string
  gestureLabel: string
  motionLabel: string
  pattern: CookingActionVisualPattern
}

export type CookingActionMediaCapability = {
  assetType: CookingActionAssetType
  label: string
  description: string
  playableNow: boolean
}

export const COOKING_ACTION_MEDIA_CAPABILITIES: CookingActionMediaCapability[] = [
  {
    assetType: 'placeholder',
    label: '程序化占位',
    description: '当前默认用程序化动作卡展示，不依赖外部素材。',
    playableNow: true,
  },
  {
    assetType: 'image',
    label: '静态步骤图',
    description: '可直接展示静态图片，适合切配完成状态或火候参考。',
    playableNow: true,
  },
  {
    assetType: 'gif',
    label: '短循环动图',
    description: '可直接展示短循环动作动图，适合搅拌、翻炒、切配手势。',
    playableNow: true,
  },
  {
    assetType: 'svg',
    label: '矢量动作图',
    description: '可展示轻量矢量图，适合极简动作示意。',
    playableNow: true,
  },
  {
    assetType: 'lottie',
    label: 'Lottie 动效',
    description: '数据层已支持，前端边界已预留；接入播放器依赖后即可替换占位。',
    playableNow: false,
  },
  {
    assetType: 'video',
    label: '短视频',
    description: '数据层已支持，前端边界已预留；接入视频播放器后即可播放。',
    playableNow: false,
  },
]

const fallbackVisual: CookingActionVisualVariant = {
  accent: '#c76532',
  background: '#f4e7dc',
  secondary: '#e6b68f',
  gestureLabel: '跟着这一步做',
  motionLabel: '动作提示',
  pattern: 'stir',
}

const actionVisuals: Record<string, CookingActionVisualVariant> = {
  prep_ingredients: {
    accent: '#9d6a34',
    background: '#f4ecdf',
    secondary: '#ead6b8',
    gestureLabel: '摆齐食材',
    motionLabel: '先把会用到的东西放在手边',
    pattern: 'gather',
  },
  gather_tools: {
    accent: '#80694f',
    background: '#f1ece5',
    secondary: '#ded1c0',
    gestureLabel: '备好工具',
    motionLabel: '把锅、碗、刀具和盛盘提前摆好',
    pattern: 'gather',
  },
  wash: {
    accent: '#3c7d87',
    background: '#eaf4f3',
    secondary: '#c5e2e0',
    gestureLabel: '轻轻冲洗',
    motionLabel: '用流动水带走表面杂质',
    pattern: 'wash',
  },
  peel: {
    accent: '#7c8550',
    background: '#eef1df',
    secondary: '#d7ddb7',
    gestureLabel: '削皮去壳',
    motionLabel: '去掉外皮，尽量保留可食用部分',
    pattern: 'cut',
  },
  trim: {
    accent: '#7b6a4a',
    background: '#f0ecdf',
    secondary: '#d9cda9',
    gestureLabel: '修整边角',
    motionLabel: '去掉硬根、坏点或多余边缘',
    pattern: 'cut',
  },
  cut_chunks: {
    accent: '#8a5a44',
    background: '#f0e8df',
    secondary: '#dec6b4',
    gestureLabel: '切成块',
    motionLabel: '让大小尽量接近，受热更均匀',
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
  mince: {
    accent: '#8a5a44',
    background: '#f0e8df',
    secondary: '#dec6b4',
    gestureLabel: '切碎',
    motionLabel: '反复下刀，切到细碎但不出泥',
    pattern: 'cut',
  },
  shred: {
    accent: '#8a5a44',
    background: '#f0e8df',
    secondary: '#dec6b4',
    gestureLabel: '切成丝',
    motionLabel: '先切片，再顺着方向切细丝',
    pattern: 'cut',
  },
  crush: {
    accent: '#795c45',
    background: '#eee5dc',
    secondary: '#d8c2af',
    gestureLabel: '压碎拍散',
    motionLabel: '轻压或拍散，让香味更容易出来',
    pattern: 'cut',
  },
  drain: {
    accent: '#3f7d75',
    background: '#e8f2ef',
    secondary: '#c7ded9',
    gestureLabel: '沥干水分',
    motionLabel: '让表面少一点水，入锅更稳',
    pattern: 'wash',
  },
  beat_eggs: {
    accent: '#d08a2d',
    background: '#fbf0d7',
    secondary: '#f2d495',
    gestureLabel: '顺向搅打',
    motionLabel: '搅到蛋清蛋黄融合',
    pattern: 'whisk',
  },
  whisk: {
    accent: '#d08a2d',
    background: '#fbf0d7',
    secondary: '#f2d495',
    gestureLabel: '快速搅拌',
    motionLabel: '用连续小圈让液体更均匀',
    pattern: 'whisk',
  },
  mix: {
    accent: '#7d6aa7',
    background: '#f0ecf6',
    secondary: '#d6cbe8',
    gestureLabel: '翻拌混合',
    motionLabel: '从底部把食材带上来',
    pattern: 'mix',
  },
  toss: {
    accent: '#6f7f45',
    background: '#edf1df',
    secondary: '#d0d9a8',
    gestureLabel: '轻轻拌匀',
    motionLabel: '让调味包住食材，不要压碎',
    pattern: 'mix',
  },
  marinate: {
    accent: '#8f5f56',
    background: '#f3e8e4',
    secondary: '#dfc0ba',
    gestureLabel: '静置入味',
    motionLabel: '拌匀后给食材一点吸收时间',
    pattern: 'rest',
  },
  coat: {
    accent: '#94704d',
    background: '#f2e8da',
    secondary: '#dec6a5',
    gestureLabel: '均匀裹上',
    motionLabel: '让表面薄薄挂一层粉或酱',
    pattern: 'mix',
  },
  preheat: {
    accent: '#b8563c',
    background: '#f7e8df',
    secondary: '#e8bca8',
    gestureLabel: '提前预热',
    motionLabel: '让锅具或设备先到合适温度',
    pattern: 'heat',
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
    pattern: 'pour',
  },
  melt: {
    accent: '#c3902f',
    background: '#f8efd9',
    secondary: '#ecd59c',
    gestureLabel: '小火融化',
    motionLabel: '让黄油或糖慢慢化开，不要焦',
    pattern: 'heat',
  },
  saute_aromatics: {
    accent: '#b46a35',
    background: '#f5e7dc',
    secondary: '#e5ba91',
    gestureLabel: '爆香底味',
    motionLabel: '闻到香味就进入下一步',
    pattern: 'stir',
  },
  stir_fry: {
    accent: '#c76532',
    background: '#f4e7dc',
    secondary: '#e6b68f',
    gestureLabel: '快速翻炒',
    motionLabel: '让食材持续移动，不要停在一处',
    pattern: 'stir',
  },
  sear: {
    accent: '#9c4d38',
    background: '#f2e3dd',
    secondary: '#d99f8d',
    gestureLabel: '贴锅煎香',
    motionLabel: '先别急着翻，给表面一点上色时间',
    pattern: 'heat',
  },
  pan_fry: {
    accent: '#a65a36',
    background: '#f4e5db',
    secondary: '#dfad8d',
    gestureLabel: '两面煎熟',
    motionLabel: '保持中小火，翻面前先定型',
    pattern: 'heat',
  },
  scramble: {
    accent: '#d08a2d',
    background: '#fbf0d7',
    secondary: '#f2d495',
    gestureLabel: '轻推成块',
    motionLabel: '边缘凝固后轻轻推开',
    pattern: 'stir',
  },
  boil: {
    accent: '#3f6f91',
    background: '#e7f0f4',
    secondary: '#c5ddea',
    gestureLabel: '煮到沸腾',
    motionLabel: '看到连续大泡后再计时',
    pattern: 'simmer',
  },
  blanch: {
    accent: '#4d7d68',
    background: '#e8f1eb',
    secondary: '#c8ddcf',
    gestureLabel: '短时间焯水',
    motionLabel: '入沸水后很快捞出，保持口感',
    pattern: 'simmer',
  },
  simmer: {
    accent: '#416f53',
    background: '#eaf1e9',
    secondary: '#c7ddca',
    gestureLabel: '小火慢煮',
    motionLabel: '保持轻微冒泡，不要大滚',
    pattern: 'simmer',
  },
  steam: {
    accent: '#5c7f7b',
    background: '#e9f2f1',
    secondary: '#cbdedc',
    gestureLabel: '上汽后蒸',
    motionLabel: '水开出蒸汽后再开始算时间',
    pattern: 'steam',
  },
  braise: {
    accent: '#6f5138',
    background: '#f0e8df',
    secondary: '#d7c1a8',
    gestureLabel: '盖盖慢炖',
    motionLabel: '保持小火，让味道慢慢进入食材',
    pattern: 'simmer',
  },
  reduce_sauce: {
    accent: '#8f563a',
    background: '#f1e4dc',
    secondary: '#ddb19b',
    gestureLabel: '收浓汤汁',
    motionLabel: '让酱汁变稠，能轻轻挂住食材',
    pattern: 'simmer',
  },
  thicken: {
    accent: '#8f563a',
    background: '#f1e4dc',
    secondary: '#ddb19b',
    gestureLabel: '勾芡收口',
    motionLabel: '边倒边搅，看到汤汁变亮即可',
    pattern: 'pour',
  },
  bake: {
    accent: '#9a6848',
    background: '#f1e7df',
    secondary: '#ddc2ad',
    gestureLabel: '送入烤箱',
    motionLabel: '让热空气均匀包住食物',
    pattern: 'oven',
  },
  roast: {
    accent: '#9a6848',
    background: '#f1e7df',
    secondary: '#ddc2ad',
    gestureLabel: '烤到上色',
    motionLabel: '观察边缘颜色和表面状态',
    pattern: 'oven',
  },
  air_fry: {
    accent: '#9a6848',
    background: '#f1e7df',
    secondary: '#ddc2ad',
    gestureLabel: '空气炸',
    motionLabel: '中途翻动一次，上色更均匀',
    pattern: 'oven',
  },
  microwave: {
    accent: '#7d6aa7',
    background: '#f0ecf6',
    secondary: '#d6cbe8',
    gestureLabel: '微波加热',
    motionLabel: '短时间多次加热，避免过头',
    pattern: 'oven',
  },
  combine: {
    accent: '#7d6aa7',
    background: '#f0ecf6',
    secondary: '#d6cbe8',
    gestureLabel: '合并食材',
    motionLabel: '把前面处理好的部分重新放到一起',
    pattern: 'mix',
  },
  season: {
    accent: '#a24f43',
    background: '#f5e8e3',
    secondary: '#e3bcb4',
    gestureLabel: '少量调味',
    motionLabel: '先少放，尝过再补',
    pattern: 'pour',
  },
  garnish: {
    accent: '#5e7f4d',
    background: '#edf2e6',
    secondary: '#cfdcbc',
    gestureLabel: '点缀增香',
    motionLabel: '最后少量撒上，不要盖过主体',
    pattern: 'plate',
  },
  plate: {
    accent: '#a24f43',
    background: '#f5e8e3',
    secondary: '#e3bcb4',
    gestureLabel: '整理装盘',
    motionLabel: '把主体放稳，再整理边缘',
    pattern: 'plate',
  },
  season_and_plate: {
    accent: '#a24f43',
    background: '#f5e8e3',
    secondary: '#e3bcb4',
    gestureLabel: '调味装盘',
    motionLabel: '少量多次调整味道',
    pattern: 'plate',
  },
  rest: {
    accent: '#6d6a5a',
    background: '#efeee7',
    secondary: '#d8d4c1',
    gestureLabel: '静置片刻',
    motionLabel: '离火后让温度和汁水稳定一下',
    pattern: 'rest',
  },
}

export function getCookingActionVisual(actionKey?: string | null): CookingActionVisualVariant {
  return actionKey ? actionVisuals[actionKey] ?? fallbackVisual : fallbackVisual
}
