import type {
  CookingActionAsset,
  RecipeTutorialStep,
  TutorialBundle,
  TutorialRecipeSummary,
} from '@/types/tutorial'

const fallbackDate = new Date('2026-06-18T00:00:00.000Z')

const actionRows = [
  ['prep_ingredients', '准备食材', 'Prep Ingredients', '🧺', '先把本步骤需要的食材和工具放在手边。'],
  ['wash', '清洗', 'Wash', '💧', '用流动水轻柔清洗食材。'],
  ['cut_chunks', '切块', 'Cut Chunks', '🔪', '切成大小接近的块，受热会更均匀。'],
  ['slice', '切片', 'Slice', '🥒', '保持厚薄大致一致。'],
  ['dice', '切丁', 'Dice', '◻️', '先切条，再切成均匀小丁。'],
  ['beat_eggs', '打散鸡蛋', 'Beat Eggs', '🥚', '沿同一方向搅打到蛋清蛋黄混合。'],
  ['mix', '混合', 'Mix', '🥣', '从底部翻拌，让材料均匀混合。'],
  ['heat_pan', '热锅', 'Heat Pan', '♨️', '先把锅加热，再进行下一步。'],
  ['add_oil', '加油', 'Add Oil', '🫗', '沿锅边加入少量油并转动锅面。'],
  ['stir_fry', '翻炒', 'Stir Fry', '🍳', '保持食材移动，避免局部过热。'],
  ['simmer', '小火炖煮', 'Simmer', '🫕', '保持轻微冒泡，不要大火沸腾。'],
  ['season_and_plate', '调味装盘', 'Season and Plate', '🍽️', '先少量调味，尝味后再补充。'],
] as const

export const COOKING_ACTION_FALLBACKS: CookingActionAsset[] = actionRows.map((row, index) => ({
  id: `fallback-action-${row[0]}`,
  actionKey: row[0],
  zhName: row[1],
  enName: row[2],
  assetType: 'placeholder',
  assetUrl: null,
  fallbackIcon: row[3],
  shortHint: row[4],
  sortOrder: (index + 1) * 10,
  createdAt: fallbackDate,
  updatedAt: fallbackDate,
}))

const fallbackRecipe: TutorialRecipeSummary = {
  id: 'fallback-recipe-tomato-egg',
  recipeKey: 'tomato_egg_stir_fry',
  zhName: '番茄炒蛋',
  enName: 'Tomato Egg Stir Fry',
  totalTimeMinutes: 20,
  coverImageUrl: null,
}

const fallbackSteps: RecipeTutorialStep[] = [
  {
    id: 'fallback-step-1',
    recipeId: fallbackRecipe.id,
    stepNumber: 1,
    title: '准备食材',
    body: '准备 3 个鸡蛋、2 个番茄、食用油、盐和少量糖。把炒锅、碗、刀、砧板和锅铲放在手边。',
    actionKey: 'prep_ingredients',
    ingredientKeys: ['egg', 'tomato', 'cooking_oil', 'salt', 'sugar'],
    equipmentKeys: ['mixing_bowl', 'knife', 'cutting_board', 'frying_pan_or_wok', 'spatula'],
    estimatedMinutes: 2,
    timerSeconds: null,
    assistantContext: '确认用户已经备齐材料；缺少糖可以不放，缺少锅铲可用木勺。',
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: 'fallback-step-2',
    recipeId: fallbackRecipe.id,
    stepNumber: 2,
    title: '鸡蛋打散',
    body: '鸡蛋磕入碗中，加一小撮盐，沿同一方向搅打到蛋清和蛋黄完全混合。',
    actionKey: 'beat_eggs',
    ingredientKeys: ['egg', 'salt'],
    equipmentKeys: ['mixing_bowl', 'chopsticks_or_fork'],
    estimatedMinutes: 2,
    timerSeconds: 45,
    assistantContext: '蛋液应颜色均匀、没有明显透明蛋清；无需打发出大量泡沫。',
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: 'fallback-step-3',
    recipeId: fallbackRecipe.id,
    stepNumber: 3,
    title: '番茄切块',
    body: '番茄洗净后去蒂，切成大小接近的滚刀块或小块，流出的汁也保留。',
    actionKey: 'cut_chunks',
    ingredientKeys: ['tomato'],
    equipmentKeys: ['knife', 'cutting_board'],
    estimatedMinutes: 3,
    timerSeconds: null,
    assistantContext: '提醒用户注意刀具安全；番茄块约 2-3 厘米即可，不要求形状完全一致。',
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: 'fallback-step-4',
    recipeId: fallbackRecipe.id,
    stepNumber: 4,
    title: '热锅倒油并炒鸡蛋',
    body: '中火热锅后倒油，蛋液入锅。边缘凝固时用锅铲轻推成大块，刚熟就盛出。',
    actionKey: 'stir_fry',
    ingredientKeys: ['egg', 'cooking_oil'],
    equipmentKeys: ['frying_pan_or_wok', 'spatula', 'plate'],
    estimatedMinutes: 3,
    timerSeconds: 90,
    assistantContext: '鸡蛋保持嫩滑，不要炒到干硬；蛋液入锅后应有轻微滋滋声但不能迅速焦黄。',
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: 'fallback-step-5',
    recipeId: fallbackRecipe.id,
    stepNumber: 5,
    title: '加入番茄翻炒出汁',
    body: '原锅加入番茄，中火翻炒。番茄变软、锅底出现汁水后，把鸡蛋倒回锅中。',
    actionKey: 'stir_fry',
    ingredientKeys: ['tomato', 'egg'],
    equipmentKeys: ['frying_pan_or_wok', 'spatula'],
    estimatedMinutes: 5,
    timerSeconds: 180,
    assistantContext: '番茄不出汁时可加一小勺水并盖盖 30 秒；避免过度加水变成汤。',
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
  {
    id: 'fallback-step-6',
    recipeId: fallbackRecipe.id,
    stepNumber: 6,
    title: '调味并装盘',
    body: '加入盐和少量糖，快速翻匀。尝味后关火装盘，保留番茄汁包裹鸡蛋。',
    actionKey: 'season_and_plate',
    ingredientKeys: ['salt', 'sugar', 'tomato', 'egg'],
    equipmentKeys: ['spatula', 'plate'],
    estimatedMinutes: 2,
    timerSeconds: null,
    assistantContext: '先少量加盐和糖；糖用于平衡酸味，不应让成品明显发甜。',
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  },
]

const tomatoEggFallbackBundle: TutorialBundle = {
  recipe: fallbackRecipe,
  steps: fallbackSteps,
  actionAssets: COOKING_ACTION_FALLBACKS,
}

export function getTutorialFallback(recipeKey: string): TutorialBundle | null {
  return recipeKey === tomatoEggFallbackBundle.recipe.recipeKey
    ? tomatoEggFallbackBundle
    : null
}
