// types/profile.ts
// User Profile / Onboarding Foundation v0.2 - Domain Types
// 职责：定义业务层类型，不依赖 types/index.ts

// ============================================================================
// 5.1 Key Union Types
// ============================================================================

export type PortionSizeKey = 'small' | 'normal' | 'large'

export type SpiceLevelKey = 'none' | 'mild' | 'medium' | 'hot'

export type SaltinessKey = 'light' | 'normal' | 'salty'

export type CuisinePreferenceKey =
  | 'chinese_home'
  | 'western_simple'
  | 'shandong'
  | 'sichuan'
  | 'cantonese'
  | 'huaiyang'

export type LegacyCuisineKey =
  | 'chinese'
  | 'western'
  | 'korean'
  | 'japanese'
  | 'italian'
  | 'mexican'
  | 'southeast_asian'
  | 'no_preference'

export type CuisineKey = CuisinePreferenceKey | LegacyCuisineKey

export type MealStyleKey =
  | 'quick_easy'
  | 'budget'
  | 'healthy_light'
  | 'high_protein'
  | 'one_pot'
  | 'low_cleanup'
  | 'comfort_food'
  | 'meal_prep'

export type DietaryRuleKey =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'halal_friendly'

export type DietTagKey = DietaryRuleKey

export type AvoidIngredientKey = string

export type DislikedIngredientKey = AvoidIngredientKey

export type AllergenKey =
  | 'peanut'
  | 'tree_nut'
  | 'shellfish'
  | 'fish'
  | 'egg'
  | 'milk'
  | 'soy'
  | 'wheat'
  | 'sesame'

export const COOK_TIME_PREFERENCE_KEYS = [
  'under_15',
  'under_30',
  'under_45',
  'over_45_ok',
] as const

export type CookTimePreferenceKey = (typeof COOK_TIME_PREFERENCE_KEYS)[number]

/**
 * @deprecated Use CookTimePreferenceKey for User Preference v0.2.
 */
export type LegacyMaxCookTimeMinutes = 15 | 30 | 45 | 60

export type CookingSkillKey = 'beginner' | 'normal' | 'confident'

export type KitchenEquipmentKey =
  | 'knife'
  | 'cutting_board'
  | 'bowl'
  | 'plate'
  | 'spoon'
  | 'chopsticks_or_fork'
  | 'spatula'
  | 'basic_storage_container'
  | 'stove_or_hotplate'
  | 'frying_pan_or_wok'
  | 'pot'
  | 'rice_cooker'
  | 'microwave'
  | 'oven'
  | 'air_fryer'
  | 'electric_kettle'
  | 'steamer'
  | 'blender'
  | 'pressure_cooker'
  | 'toaster'
  // Legacy recipe/equipment keys kept for Recipe Foundation v0.1 compatibility.
  | 'pan'
  | 'wok'
  | 'saucepan'
  | 'baking_tray'
  | 'ladle'
  | 'tongs'
  | 'mixing_bowl'
  | 'peeler'
  | 'measuring_cup'

export type PantryCategoryKey =
  | 'oil'
  | 'basic_seasoning'
  | 'sauce'
  | 'spice'
  | 'asian_paste'
  | 'starch_dry_good'
  | 'canned_frozen_basic'

export type PantryItemKey =
  | 'cooking_oil'
  | 'olive_oil'
  | 'sesame_oil'
  | 'butter'
  | 'salt'
  | 'sugar'
  | 'black_pepper'
  | 'white_pepper'
  | 'soy_sauce'
  | 'light_soy_sauce'
  | 'dark_soy_sauce'
  | 'vinegar'
  | 'black_vinegar'
  | 'oyster_sauce'
  | 'cooking_wine'
  | 'ketchup'
  | 'mayonnaise'
  | 'mustard'
  | 'hot_sauce'
  | 'chili_flakes'
  | 'chili_oil'
  | 'cumin'
  | 'curry_powder'
  | 'garlic_powder'
  | 'paprika'
  | 'doubanjiang'
  | 'gochujang'
  | 'miso'
  | 'chili_crisp'
  | 'pasta_sauce'
  | 'curry_blocks'
  | 'rice'
  | 'pasta'
  | 'noodles'
  | 'instant_noodles'
  | 'flour'
  | 'cornstarch'
  | 'breadcrumbs'
  | 'canned_tuna'
  | 'canned_corn'
  | 'canned_tomato'
  | 'frozen_vegetables'
  | 'frozen_dumplings'

// ============================================================================
// 5.2 Domain Types (camelCase)
// ============================================================================

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed'

export interface Profile {
  id: string
  displayName: string | null
  avatarUrl: string | null
  onboardingStatus: OnboardingStatus
  onboardingCompletedAt: Date | null
  isAnonymousSnapshot: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  id: string
  userId: string
  portionSize: PortionSizeKey | null
  spiceLevel: SpiceLevelKey | null
  saltiness: SaltinessKey | null
  cuisinePreferences: CuisinePreferenceKey[]
  mealStylePreferences: MealStyleKey[]
  dietaryRules: DietaryRuleKey[]
  avoidIngredientKeys: AvoidIngredientKey[]
  allergenKeys: AllergenKey[]
  cookTimePreferenceKey: CookTimePreferenceKey
  cookingSkill: CookingSkillKey
  createdAt: Date
  updatedAt: Date

  /**
   * @deprecated Use dietaryRules.
   */
  dietTags?: DietaryRuleKey[]
  /**
   * @deprecated Use avoidIngredientKeys.
   */
  dislikedIngredientKeys?: AvoidIngredientKey[]
}

export interface KitchenEquipmentItem {
  id: string
  userId: string
  equipmentKey: KitchenEquipmentKey
  createdAt: Date
  updatedAt: Date
}

export interface PantryItem {
  id: string
  userId: string
  pantryItemKey: PantryItemKey
  createdAt: Date
  updatedAt: Date
}

export interface OnboardingContext {
  profile: Profile
  preferences: UserPreferences | null
  equipmentKeys: KitchenEquipmentKey[]
  pantryItemKeys: PantryItemKey[]
}

// ============================================================================
// 5.3 Input Types
// ============================================================================

export interface UpdateProfileInput {
  displayName?: string | null
  avatarUrl?: string | null
  onboardingStatus?: OnboardingStatus
  onboardingCompletedAt?: Date | null
}

export interface SaveUserPreferencesInput {
  portionSize?: PortionSizeKey | null
  spiceLevel?: SpiceLevelKey | null
  saltiness?: SaltinessKey | null
  cuisinePreferences: CuisineKey[]
  mealStylePreferences: MealStyleKey[]
  dietaryRules?: DietaryRuleKey[]
  avoidIngredientKeys?: AvoidIngredientKey[]
  allergenKeys: AllergenKey[]
  cookTimePreferenceKey?: CookTimePreferenceKey | null
  cookingSkill?: CookingSkillKey | null

  /**
   * @deprecated Use dietaryRules.
   */
  dietTags?: DietaryRuleKey[]
  /**
   * @deprecated Use avoidIngredientKeys.
   */
  dislikedIngredientKeys?: AvoidIngredientKey[]
}

export interface SaveKitchenEquipmentInput {
  equipmentKeys: KitchenEquipmentKey[]
}

export interface SavePantryItemsInput {
  pantryItemKeys: PantryItemKey[]
}

export interface AddPantryItemsInput {
  pantryItemKeys: PantryItemKey[]
}

// ============================================================================
// 5.4 Option Dictionary Types
// ============================================================================

export interface ProfileOption<T extends string> {
  key: T
  zhLabel: string
  enLabel: string
}

export interface ProfileOptionWithDescription<T extends string> extends ProfileOption<T> {
  zhDescription: string
  enDescription: string
}

export interface ScoredProfileOption<T extends string> extends ProfileOption<T> {
  score: number
}

export interface CookTimePreferenceOption extends ProfileOptionWithDescription<CookTimePreferenceKey> {
  label: string
}

export interface LegacyMaxCookTimeOption {
  key: LegacyMaxCookTimeMinutes
  zhLabel: string
  enLabel: string
  zhDescription: string
  enDescription: string
}

export interface KitchenEquipmentOption extends ProfileOption<KitchenEquipmentKey> {
  category: string
  isDefaultAssumed?: boolean
  isUserSelectable?: boolean
  isMvpDefault?: boolean
}

export interface PantryItemOption extends ProfileOption<PantryItemKey> {
  category: string
}

// ============================================================================
// Option Constants
// ============================================================================

export const PORTION_SIZE_OPTIONS: ProfileOption<PortionSizeKey>[] = [
  { key: 'small', zhLabel: '小份', enLabel: 'Small' },
  { key: 'normal', zhLabel: '正常', enLabel: 'Normal' },
  { key: 'large', zhLabel: '大份', enLabel: 'Large' },
]

export const SPICE_LEVEL_OPTIONS: ScoredProfileOption<SpiceLevelKey>[] = [
  { key: 'none', zhLabel: '不辣', enLabel: 'None', score: 0 },
  { key: 'mild', zhLabel: '微辣', enLabel: 'Mild', score: 1 },
  { key: 'medium', zhLabel: '中辣', enLabel: 'Medium', score: 2 },
  { key: 'hot', zhLabel: '特辣', enLabel: 'Hot', score: 3 },
]

export const SALTINESS_OPTIONS: ScoredProfileOption<SaltinessKey>[] = [
  { key: 'light', zhLabel: '清淡', enLabel: 'Light', score: 0 },
  { key: 'normal', zhLabel: '正常', enLabel: 'Normal', score: 1 },
  { key: 'salty', zhLabel: '偏咸', enLabel: 'Salty', score: 2 },
]

export const CUISINE_PREFERENCE_OPTIONS: ProfileOption<CuisinePreferenceKey>[] = [
  { key: 'chinese_home', zhLabel: '中式家常菜', enLabel: 'Chinese Home Cooking' },
  { key: 'western_simple', zhLabel: '西餐简餐', enLabel: 'Simple Western' },
  { key: 'shandong', zhLabel: '鲁菜', enLabel: 'Shandong Cuisine' },
  { key: 'sichuan', zhLabel: '川菜', enLabel: 'Sichuan Cuisine' },
  { key: 'cantonese', zhLabel: '粤菜', enLabel: 'Cantonese Cuisine' },
  { key: 'huaiyang', zhLabel: '淮扬菜', enLabel: 'Huaiyang Cuisine' },
]

/**
 * @deprecated Use CUISINE_PREFERENCE_OPTIONS for User Preference v0.2.
 */
export const CUISINE_OPTIONS: ProfileOption<CuisineKey>[] = CUISINE_PREFERENCE_OPTIONS

export const DEFAULT_CUISINE_PREFERENCE_KEYS: CuisinePreferenceKey[] = [
  'chinese_home',
  'western_simple',
]

export const TRADITIONAL_CHINESE_CUISINE_KEYS: CuisinePreferenceKey[] = [
  'shandong',
  'sichuan',
  'cantonese',
  'huaiyang',
]

export const MEAL_STYLE_OPTIONS: ProfileOption<MealStyleKey>[] = [
  { key: 'quick_easy', zhLabel: '快速简便', enLabel: 'Quick & Easy' },
  { key: 'budget', zhLabel: '经济实惠', enLabel: 'Budget Friendly' },
  { key: 'healthy_light', zhLabel: '健康轻食', enLabel: 'Healthy & Light' },
  { key: 'high_protein', zhLabel: '高蛋白', enLabel: 'High Protein' },
  { key: 'one_pot', zhLabel: '一锅料理', enLabel: 'One Pot' },
  { key: 'low_cleanup', zhLabel: '少清理', enLabel: 'Low Cleanup' },
  { key: 'comfort_food', zhLabel: '治愈美食', enLabel: 'Comfort Food' },
  { key: 'meal_prep', zhLabel: '备餐', enLabel: 'Meal Prep' },
]

export const DIETARY_RULE_OPTIONS: ProfileOptionWithDescription<DietaryRuleKey>[] = [
  {
    key: 'none',
    zhLabel: '无特殊限制',
    enLabel: 'No Restriction',
    zhDescription: '默认选项，不做特殊饮食过滤。',
    enDescription: 'Default option without special dietary filtering.',
  },
  {
    key: 'vegetarian',
    zhLabel: '素食',
    enLabel: 'Vegetarian',
    zhDescription: '不吃肉类和海鲜，但可以吃蛋奶。',
    enDescription: 'Avoids meat and seafood; eggs and dairy are allowed.',
  },
  {
    key: 'vegan',
    zhLabel: '纯素',
    enLabel: 'Vegan',
    zhDescription: '不吃肉、海鲜、蛋、奶、奶酪、黄油等动物来源食材。',
    enDescription: 'Avoids meat, seafood, eggs, dairy, cheese, butter, and other animal-derived ingredients.',
  },
  {
    key: 'halal_friendly',
    zhLabel: '清真友好',
    enLabel: 'Halal Friendly',
    zhDescription: '避免猪肉和酒类/料酒类食材，但不承诺肉类都有清真认证。',
    enDescription: 'Avoids pork and alcohol/cooking-wine ingredients, without certifying all meats as halal.',
  },
]

/**
 * @deprecated Use DIETARY_RULE_OPTIONS.
 */
export const DIET_TAG_OPTIONS: ProfileOption<DietTagKey>[] = DIETARY_RULE_OPTIONS

export const COMMON_AVOID_INGREDIENT_OPTIONS: ProfileOption<AvoidIngredientKey>[] = [
  { key: 'cilantro', zhLabel: '香菜', enLabel: 'Cilantro' },
  { key: 'scallion', zhLabel: '小葱', enLabel: 'Scallion' },
  { key: 'garlic', zhLabel: '大蒜', enLabel: 'Garlic' },
  { key: 'onion', zhLabel: '洋葱', enLabel: 'Onion' },
  { key: 'ginger', zhLabel: '生姜', enLabel: 'Ginger' },
  { key: 'mushroom', zhLabel: '蘑菇', enLabel: 'Mushroom' },
  { key: 'eggplant', zhLabel: '茄子', enLabel: 'Eggplant' },
  { key: 'tomato', zhLabel: '番茄', enLabel: 'Tomato' },
  { key: 'egg', zhLabel: '鸡蛋', enLabel: 'Egg' },
  { key: 'tofu', zhLabel: '豆腐', enLabel: 'Tofu' },
  { key: 'cheese', zhLabel: '奶酪', enLabel: 'Cheese' },
  { key: 'seafood', zhLabel: '海鲜', enLabel: 'Seafood' },
  { key: 'spicy_food', zhLabel: '辛辣食物', enLabel: 'Spicy Food' },
]

/**
 * @deprecated Use COMMON_AVOID_INGREDIENT_OPTIONS.
 */
export const DISLIKED_INGREDIENT_OPTIONS: ProfileOption<DislikedIngredientKey>[] =
  COMMON_AVOID_INGREDIENT_OPTIONS

export const ALLERGEN_OPTIONS: ProfileOption<AllergenKey>[] = [
  { key: 'peanut', zhLabel: '花生', enLabel: 'Peanut' },
  { key: 'tree_nut', zhLabel: '坚果', enLabel: 'Tree Nut' },
  { key: 'shellfish', zhLabel: '甲壳类', enLabel: 'Shellfish' },
  { key: 'fish', zhLabel: '鱼类', enLabel: 'Fish' },
  { key: 'egg', zhLabel: '鸡蛋', enLabel: 'Egg' },
  { key: 'milk', zhLabel: '牛奶', enLabel: 'Milk' },
  { key: 'soy', zhLabel: '大豆', enLabel: 'Soy' },
  { key: 'wheat', zhLabel: '小麦', enLabel: 'Wheat' },
  { key: 'sesame', zhLabel: '芝麻', enLabel: 'Sesame' },
]

export const COOK_TIME_PREFERENCE_OPTIONS = [
  {
    key: 'under_15',
    label: '15 分钟以内',
    zhLabel: '15 分钟以内',
    enLabel: 'Under 15 min',
    zhDescription: '包含备菜、腌制、等待时间。',
    enDescription: 'Includes prep, marinating, and waiting time.',
  },
  {
    key: 'under_30',
    label: '30 分钟以内',
    zhLabel: '30 分钟以内',
    enLabel: 'Under 30 min',
    zhDescription: 'MVP 默认建议。',
    enDescription: 'Recommended MVP default.',
  },
  {
    key: 'under_45',
    label: '45 分钟以内',
    zhLabel: '45 分钟以内',
    enLabel: 'Under 45 min',
    zhDescription: '适合稍完整的一餐。',
    enDescription: 'Good for a fuller meal.',
  },
  {
    key: 'over_45_ok',
    label: '45 分钟以上也可以',
    zhLabel: '45 分钟以上也可以',
    enLabel: '45+ min is OK',
    zhDescription: '愿意接受腌制、炖煮、提前处理等更长准备时间。',
    enDescription: 'Allows longer preparation such as marinating, stewing, or advance prep.',
  },
] as const

export const DEFAULT_COOK_TIME_PREFERENCE_KEY: CookTimePreferenceKey = 'under_30'

export const COOKING_SKILL_OPTIONS: ProfileOptionWithDescription<CookingSkillKey>[] = [
  {
    key: 'beginner',
    zhLabel: '新手',
    enLabel: 'Beginner',
    zhDescription: '能煎蛋、煮面、简单炒菜。',
    enDescription: 'Can fry eggs, cook noodles, and make simple stir-fries.',
  },
  {
    key: 'normal',
    zhLabel: '普通',
    enLabel: 'Normal',
    zhDescription: '会做大多数家常菜。',
    enDescription: 'Can cook most home-style dishes.',
  },
  {
    key: 'confident',
    zhLabel: '熟练',
    enLabel: 'Confident',
    zhDescription: '愿意处理复杂步骤和火候。',
    enDescription: 'Comfortable with more complex steps and heat control.',
  },
]

export const DEFAULT_COOKING_SKILL_KEY: CookingSkillKey = 'normal'

export const KITCHEN_EQUIPMENT_OPTIONS: KitchenEquipmentOption[] = [
  { key: 'knife', zhLabel: '刀', enLabel: 'Knife', category: 'assumed_basic', isDefaultAssumed: true },
  { key: 'cutting_board', zhLabel: '砧板', enLabel: 'Cutting Board', category: 'assumed_basic', isDefaultAssumed: true },
  { key: 'bowl', zhLabel: '碗', enLabel: 'Bowl', category: 'assumed_basic', isDefaultAssumed: true },
  { key: 'plate', zhLabel: '盘子', enLabel: 'Plate', category: 'assumed_basic', isDefaultAssumed: true },
  { key: 'spoon', zhLabel: '勺子', enLabel: 'Spoon', category: 'assumed_basic', isDefaultAssumed: true },
  {
    key: 'chopsticks_or_fork',
    zhLabel: '筷子或叉子',
    enLabel: 'Chopsticks or Fork',
    category: 'assumed_basic',
    isDefaultAssumed: true,
  },
  { key: 'spatula', zhLabel: '锅铲', enLabel: 'Spatula', category: 'assumed_basic', isDefaultAssumed: true },
  {
    key: 'basic_storage_container',
    zhLabel: '基础保鲜盒',
    enLabel: 'Basic Storage Container',
    category: 'assumed_basic',
    isDefaultAssumed: true,
  },
  {
    key: 'stove_or_hotplate',
    zhLabel: '炉灶 / 电磁炉',
    enLabel: 'Stove or Hotplate',
    category: 'cooking',
    isUserSelectable: true,
    isMvpDefault: true,
  },
  {
    key: 'frying_pan_or_wok',
    zhLabel: '平底锅 / 炒锅',
    enLabel: 'Frying Pan or Wok',
    category: 'cooking',
    isUserSelectable: true,
    isMvpDefault: true,
  },
  {
    key: 'pot',
    zhLabel: '汤锅',
    enLabel: 'Pot',
    category: 'cooking',
    isUserSelectable: true,
    isMvpDefault: true,
  },
  {
    key: 'rice_cooker',
    zhLabel: '电饭煲',
    enLabel: 'Rice Cooker',
    category: 'appliance',
    isUserSelectable: true,
    isMvpDefault: true,
  },
  {
    key: 'microwave',
    zhLabel: '微波炉',
    enLabel: 'Microwave',
    category: 'appliance',
    isUserSelectable: true,
    isMvpDefault: true,
  },
  { key: 'oven', zhLabel: '烤箱', enLabel: 'Oven', category: 'appliance', isUserSelectable: true },
  { key: 'air_fryer', zhLabel: '空气炸锅', enLabel: 'Air Fryer', category: 'appliance', isUserSelectable: true },
  {
    key: 'electric_kettle',
    zhLabel: '电热水壶',
    enLabel: 'Electric Kettle',
    category: 'appliance',
    isUserSelectable: true,
  },
  { key: 'steamer', zhLabel: '蒸锅', enLabel: 'Steamer', category: 'cooking', isUserSelectable: true },
  { key: 'blender', zhLabel: '搅拌机', enLabel: 'Blender', category: 'appliance', isUserSelectable: true },
  {
    key: 'pressure_cooker',
    zhLabel: '压力锅',
    enLabel: 'Pressure Cooker',
    category: 'appliance',
    isUserSelectable: true,
  },
  { key: 'toaster', zhLabel: '烤面包机', enLabel: 'Toaster', category: 'appliance', isUserSelectable: true },
  { key: 'pan', zhLabel: '平底锅', enLabel: 'Pan', category: 'legacy_recipe' },
  { key: 'wok', zhLabel: '炒锅', enLabel: 'Wok', category: 'legacy_recipe' },
  { key: 'saucepan', zhLabel: '小炖锅', enLabel: 'Saucepan', category: 'legacy_recipe' },
  { key: 'baking_tray', zhLabel: '烤盘', enLabel: 'Baking Tray', category: 'legacy_recipe' },
  { key: 'ladle', zhLabel: '汤勺', enLabel: 'Ladle', category: 'legacy_recipe' },
  { key: 'tongs', zhLabel: '夹子', enLabel: 'Tongs', category: 'legacy_recipe' },
  { key: 'mixing_bowl', zhLabel: '搅拌碗', enLabel: 'Mixing Bowl', category: 'legacy_recipe' },
  { key: 'peeler', zhLabel: '削皮器', enLabel: 'Peeler', category: 'legacy_recipe' },
  { key: 'measuring_cup', zhLabel: '量杯', enLabel: 'Measuring Cup', category: 'legacy_recipe' },
]

export const DEFAULT_ASSUMED_KITCHEN_EQUIPMENT_KEYS: KitchenEquipmentKey[] = [
  'knife',
  'cutting_board',
  'bowl',
  'plate',
  'spoon',
  'chopsticks_or_fork',
  'spatula',
  'basic_storage_container',
]

export const USER_SELECTABLE_KITCHEN_EQUIPMENT_KEYS: KitchenEquipmentKey[] = [
  'stove_or_hotplate',
  'frying_pan_or_wok',
  'pot',
  'rice_cooker',
  'microwave',
  'oven',
  'air_fryer',
  'electric_kettle',
  'steamer',
  'blender',
  'pressure_cooker',
  'toaster',
]

export const MVP_DEFAULT_KITCHEN_EQUIPMENT_KEYS: KitchenEquipmentKey[] = [
  'stove_or_hotplate',
  'frying_pan_or_wok',
  'pot',
  'rice_cooker',
  'microwave',
]

export const PANTRY_ITEM_OPTIONS: PantryItemOption[] = [
  { key: 'cooking_oil', zhLabel: '食用油', enLabel: 'Cooking Oil', category: 'oil' },
  { key: 'olive_oil', zhLabel: '橄榄油', enLabel: 'Olive Oil', category: 'oil' },
  { key: 'sesame_oil', zhLabel: '香油', enLabel: 'Sesame Oil', category: 'oil' },
  { key: 'butter', zhLabel: '黄油', enLabel: 'Butter', category: 'oil' },
  { key: 'salt', zhLabel: '盐', enLabel: 'Salt', category: 'basic_seasoning' },
  { key: 'sugar', zhLabel: '糖', enLabel: 'Sugar', category: 'basic_seasoning' },
  { key: 'black_pepper', zhLabel: '黑胡椒', enLabel: 'Black Pepper', category: 'spice' },
  { key: 'white_pepper', zhLabel: '白胡椒', enLabel: 'White Pepper', category: 'spice' },
  { key: 'soy_sauce', zhLabel: '酱油', enLabel: 'Soy Sauce', category: 'sauce' },
  { key: 'light_soy_sauce', zhLabel: '生抽', enLabel: 'Light Soy Sauce', category: 'sauce' },
  { key: 'dark_soy_sauce', zhLabel: '老抽', enLabel: 'Dark Soy Sauce', category: 'sauce' },
  { key: 'vinegar', zhLabel: '醋', enLabel: 'Vinegar', category: 'sauce' },
  { key: 'black_vinegar', zhLabel: '香醋', enLabel: 'Black Vinegar', category: 'sauce' },
  { key: 'oyster_sauce', zhLabel: '蚝油', enLabel: 'Oyster Sauce', category: 'sauce' },
  { key: 'cooking_wine', zhLabel: '料酒', enLabel: 'Cooking Wine', category: 'sauce' },
  { key: 'ketchup', zhLabel: '番茄酱', enLabel: 'Ketchup', category: 'sauce' },
  { key: 'mayonnaise', zhLabel: '蛋黄酱', enLabel: 'Mayonnaise', category: 'sauce' },
  { key: 'mustard', zhLabel: '芥末酱', enLabel: 'Mustard', category: 'sauce' },
  { key: 'hot_sauce', zhLabel: '辣酱', enLabel: 'Hot Sauce', category: 'sauce' },
  { key: 'chili_flakes', zhLabel: '辣椒碎', enLabel: 'Chili Flakes', category: 'spice' },
  { key: 'chili_oil', zhLabel: '辣椒油', enLabel: 'Chili Oil', category: 'oil' },
  { key: 'cumin', zhLabel: '孜然', enLabel: 'Cumin', category: 'spice' },
  { key: 'curry_powder', zhLabel: '咖喱粉', enLabel: 'Curry Powder', category: 'spice' },
  { key: 'garlic_powder', zhLabel: '蒜粉', enLabel: 'Garlic Powder', category: 'spice' },
  { key: 'paprika', zhLabel: '红椒粉', enLabel: 'Paprika', category: 'spice' },
  { key: 'doubanjiang', zhLabel: '豆瓣酱', enLabel: 'Doubanjiang', category: 'asian_paste' },
  { key: 'gochujang', zhLabel: '韩式辣酱', enLabel: 'Gochujang', category: 'asian_paste' },
  { key: 'miso', zhLabel: '味噌', enLabel: 'Miso', category: 'asian_paste' },
  { key: 'chili_crisp', zhLabel: '油泼辣子', enLabel: 'Chili Crisp', category: 'asian_paste' },
  { key: 'pasta_sauce', zhLabel: '意面酱', enLabel: 'Pasta Sauce', category: 'sauce' },
  { key: 'curry_blocks', zhLabel: '咖喱块', enLabel: 'Curry Blocks', category: 'asian_paste' },
  { key: 'rice', zhLabel: '大米', enLabel: 'Rice', category: 'starch_dry_good' },
  { key: 'pasta', zhLabel: '意大利面', enLabel: 'Pasta', category: 'starch_dry_good' },
  { key: 'noodles', zhLabel: '面条', enLabel: 'Noodles', category: 'starch_dry_good' },
  { key: 'instant_noodles', zhLabel: '方便面', enLabel: 'Instant Noodles', category: 'starch_dry_good' },
  { key: 'flour', zhLabel: '面粉', enLabel: 'Flour', category: 'starch_dry_good' },
  { key: 'cornstarch', zhLabel: '淀粉', enLabel: 'Cornstarch', category: 'starch_dry_good' },
  { key: 'breadcrumbs', zhLabel: '面包糠', enLabel: 'Breadcrumbs', category: 'starch_dry_good' },
  { key: 'canned_tuna', zhLabel: '金枪鱼罐头', enLabel: 'Canned Tuna', category: 'canned_frozen_basic' },
  { key: 'canned_corn', zhLabel: '玉米罐头', enLabel: 'Canned Corn', category: 'canned_frozen_basic' },
  { key: 'canned_tomato', zhLabel: '番茄罐头', enLabel: 'Canned Tomato', category: 'canned_frozen_basic' },
  { key: 'frozen_vegetables', zhLabel: '冷冻蔬菜', enLabel: 'Frozen Vegetables', category: 'canned_frozen_basic' },
  { key: 'frozen_dumplings', zhLabel: '冷冻饺子', enLabel: 'Frozen Dumplings', category: 'canned_frozen_basic' },
]

export const DEFAULT_ASSUMED_PANTRY_KEYS = [
  'salt',
  'sugar',
] as const

export const QUICK_PANTRY_ITEM_KEYS = [
  'soy_sauce',
  'vinegar',
  'black_pepper',
  'sesame_oil',
  'chili_oil',
  'cooking_wine',
  'cornstarch',
  'pasta_sauce',
  'curry_blocks',
] as const

// ============================================================================
// Runtime Key Sets
// ============================================================================

export const PORTION_SIZE_KEYS: PortionSizeKey[] = PORTION_SIZE_OPTIONS.map((o) => o.key)

export const SPICE_LEVEL_KEYS: SpiceLevelKey[] = SPICE_LEVEL_OPTIONS.map((o) => o.key)

export const SALTINESS_KEYS: SaltinessKey[] = SALTINESS_OPTIONS.map((o) => o.key)

export const CUISINE_PREFERENCE_KEYS: CuisinePreferenceKey[] = CUISINE_PREFERENCE_OPTIONS.map((o) => o.key)

/**
 * @deprecated Use CUISINE_PREFERENCE_KEYS for User Preference v0.2.
 */
export const CUISINE_KEYS: CuisineKey[] = CUISINE_PREFERENCE_KEYS

export const MEAL_STYLE_KEYS: MealStyleKey[] = MEAL_STYLE_OPTIONS.map((o) => o.key)

export const DIETARY_RULE_KEYS: DietaryRuleKey[] = DIETARY_RULE_OPTIONS.map((o) => o.key)

/**
 * @deprecated Use DIETARY_RULE_KEYS.
 */
export const DIET_TAG_KEYS: DietTagKey[] = DIETARY_RULE_KEYS

export const COMMON_AVOID_INGREDIENT_KEYS: AvoidIngredientKey[] =
  COMMON_AVOID_INGREDIENT_OPTIONS.map((o) => o.key)

/**
 * @deprecated Use COMMON_AVOID_INGREDIENT_KEYS or ingredient dictionary keys.
 */
export const DISLIKED_INGREDIENT_KEYS: DislikedIngredientKey[] = COMMON_AVOID_INGREDIENT_KEYS

export const ALLERGEN_KEYS: AllergenKey[] = ALLERGEN_OPTIONS.map((o) => o.key)

export const COOKING_SKILL_KEYS: CookingSkillKey[] = COOKING_SKILL_OPTIONS.map((o) => o.key)

export const KITCHEN_EQUIPMENT_KEYS: KitchenEquipmentKey[] = KITCHEN_EQUIPMENT_OPTIONS.map((o) => o.key)

export const PANTRY_ITEM_KEYS: PantryItemKey[] = PANTRY_ITEM_OPTIONS.map((o) => o.key)

// ============================================================================
// Validation Helpers
// ============================================================================

export function isValidPortionSizeKey(key: string): key is PortionSizeKey {
  return PORTION_SIZE_KEYS.includes(key as PortionSizeKey)
}

export function isValidSpiceLevelKey(key: string): key is SpiceLevelKey {
  return SPICE_LEVEL_KEYS.includes(key as SpiceLevelKey)
}

export function isValidSaltinessKey(key: string): key is SaltinessKey {
  return SALTINESS_KEYS.includes(key as SaltinessKey)
}

export function isValidCuisinePreferenceKey(key: string): key is CuisinePreferenceKey {
  return CUISINE_PREFERENCE_KEYS.includes(key as CuisinePreferenceKey)
}

/**
 * @deprecated Use isValidCuisinePreferenceKey for User Preference v0.2.
 */
export function isValidCuisineKey(key: string): key is CuisineKey {
  return isValidCuisinePreferenceKey(key)
}

export function isValidMealStyleKey(key: string): key is MealStyleKey {
  return MEAL_STYLE_KEYS.includes(key as MealStyleKey)
}

export function isValidDietaryRuleKey(key: string): key is DietaryRuleKey {
  return DIETARY_RULE_KEYS.includes(key as DietaryRuleKey)
}

/**
 * @deprecated Use isValidDietaryRuleKey.
 */
export function isValidDietTagKey(key: string): key is DietTagKey {
  return isValidDietaryRuleKey(key)
}

export function isValidAvoidIngredientKey(key: string): key is AvoidIngredientKey {
  return /^[a-z][a-z0-9_]*$/.test(key)
}

/**
 * @deprecated Use isValidAvoidIngredientKey.
 */
export function isValidDislikedIngredientKey(key: string): key is DislikedIngredientKey {
  return isValidAvoidIngredientKey(key)
}

export function isValidAllergenKey(key: string): key is AllergenKey {
  return ALLERGEN_KEYS.includes(key as AllergenKey)
}

export function isValidCookTimePreferenceKey(key: string): key is CookTimePreferenceKey {
  return COOK_TIME_PREFERENCE_KEYS.includes(key as CookTimePreferenceKey)
}

export function isValidCookingSkillKey(key: string): key is CookingSkillKey {
  return COOKING_SKILL_KEYS.includes(key as CookingSkillKey)
}

export function isValidKitchenEquipmentKey(key: string): key is KitchenEquipmentKey {
  return KITCHEN_EQUIPMENT_KEYS.includes(key as KitchenEquipmentKey)
}

export function isValidPantryItemKey(key: string): key is PantryItemKey {
  return PANTRY_ITEM_KEYS.includes(key as PantryItemKey)
}

export function isValidPantryCategoryKey(key: string): key is PantryCategoryKey {
  const keys: PantryCategoryKey[] = [
    'oil',
    'basic_seasoning',
    'sauce',
    'spice',
    'asian_paste',
    'starch_dry_good',
    'canned_frozen_basic',
  ]
  return keys.includes(key as PantryCategoryKey)
}
