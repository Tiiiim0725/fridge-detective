// types/profile.ts
// User Profile / Onboarding Foundation v0.1 - Domain Types
// 职责：定义业务层类型，不依赖 types/index.ts

// ============================================================================
// 5.1 Key Union Types
// ============================================================================

export type PortionSizeKey = 'small' | 'normal' | 'large'

export type SpiceLevelKey = 'none' | 'mild' | 'medium' | 'hot'

export type SaltinessKey = 'light' | 'normal' | 'salty'

export type CuisineKey =
  | 'chinese'
  | 'western'
  | 'korean'
  | 'japanese'
  | 'italian'
  | 'mexican'
  | 'southeast_asian'
  | 'no_preference'

export type MealStyleKey =
  | 'quick_easy'
  | 'budget'
  | 'healthy_light'
  | 'high_protein'
  | 'one_pot'
  | 'low_cleanup'
  | 'comfort_food'
  | 'meal_prep'

export type DietTagKey =
  | 'vegetarian'
  | 'vegan'
  | 'no_pork'
  | 'no_beef'
  | 'no_lamb'
  | 'no_seafood'
  | 'no_alcohol'

export type DislikedIngredientKey =
  | 'cilantro'
  | 'green_onion'
  | 'garlic'
  | 'onion'
  | 'ginger'
  | 'mushroom'
  | 'eggplant'
  | 'tomato'
  | 'egg'
  | 'tofu'
  | 'cheese'
  | 'seafood'
  | 'spicy_food'

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

export type KitchenEquipmentKey =
  | 'pot'
  | 'pan'
  | 'wok'
  | 'saucepan'
  | 'baking_tray'
  | 'rice_cooker'
  | 'air_fryer'
  | 'oven'
  | 'microwave'
  | 'blender'
  | 'toaster'
  | 'knife'
  | 'cutting_board'
  | 'spatula'
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
  | 'dark_soy_sauce'
  | 'vinegar'
  | 'oyster_sauce'
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
  cuisinePreferences: CuisineKey[]
  mealStylePreferences: MealStyleKey[]
  dietTags: DietTagKey[]
  dislikedIngredientKeys: DislikedIngredientKey[]
  allergenKeys: AllergenKey[]
  createdAt: Date
  updatedAt: Date
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
  dietTags: DietTagKey[]
  dislikedIngredientKeys: DislikedIngredientKey[]
  allergenKeys: AllergenKey[]
}

export interface SaveKitchenEquipmentInput {
  equipmentKeys: KitchenEquipmentKey[]
}

export interface SavePantryItemsInput {
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

export interface ScoredProfileOption<T extends string> extends ProfileOption<T> {
  score: number
}

export interface KitchenEquipmentOption extends ProfileOption<KitchenEquipmentKey> {
  category: string
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

export const CUISINE_OPTIONS: ProfileOption<CuisineKey>[] = [
  { key: 'chinese', zhLabel: '中餐', enLabel: 'Chinese' },
  { key: 'western', zhLabel: '西餐', enLabel: 'Western' },
  { key: 'korean', zhLabel: '韩餐', enLabel: 'Korean' },
  { key: 'japanese', zhLabel: '日餐', enLabel: 'Japanese' },
  { key: 'italian', zhLabel: '意大利餐', enLabel: 'Italian' },
  { key: 'mexican', zhLabel: '墨西哥餐', enLabel: 'Mexican' },
  { key: 'southeast_asian', zhLabel: '东南亚菜', enLabel: 'Southeast Asian' },
  { key: 'no_preference', zhLabel: '无偏好', enLabel: 'No Preference' },
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

export const DIET_TAG_OPTIONS: ProfileOption<DietTagKey>[] = [
  { key: 'vegetarian', zhLabel: '素食', enLabel: 'Vegetarian' },
  { key: 'vegan', zhLabel: '纯素', enLabel: 'Vegan' },
  { key: 'no_pork', zhLabel: '不吃猪肉', enLabel: 'No Pork' },
  { key: 'no_beef', zhLabel: '不吃牛肉', enLabel: 'No Beef' },
  { key: 'no_lamb', zhLabel: '不吃羊肉', enLabel: 'No Lamb' },
  { key: 'no_seafood', zhLabel: '不吃海鲜', enLabel: 'No Seafood' },
  { key: 'no_alcohol', zhLabel: '不饮酒', enLabel: 'No Alcohol' },
]

export const DISLIKED_INGREDIENT_OPTIONS: ProfileOption<DislikedIngredientKey>[] = [
  { key: 'cilantro', zhLabel: '香菜', enLabel: 'Cilantro' },
  { key: 'green_onion', zhLabel: '葱', enLabel: 'Green Onion' },
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

export const KITCHEN_EQUIPMENT_OPTIONS: KitchenEquipmentOption[] = [
  { key: 'pot', zhLabel: '汤锅', enLabel: 'Pot', category: 'cooking' },
  { key: 'pan', zhLabel: '平底锅', enLabel: 'Pan', category: 'cooking' },
  { key: 'wok', zhLabel: '炒锅', enLabel: 'Wok', category: 'cooking' },
  { key: 'saucepan', zhLabel: '小炖锅', enLabel: 'Saucepan', category: 'cooking' },
  { key: 'baking_tray', zhLabel: '烤盘', enLabel: 'Baking Tray', category: 'baking' },
  { key: 'rice_cooker', zhLabel: '电饭煲', enLabel: 'Rice Cooker', category: 'appliance' },
  { key: 'air_fryer', zhLabel: '空气炸锅', enLabel: 'Air Fryer', category: 'appliance' },
  { key: 'oven', zhLabel: '烤箱', enLabel: 'Oven', category: 'appliance' },
  { key: 'microwave', zhLabel: '微波炉', enLabel: 'Microwave', category: 'appliance' },
  { key: 'blender', zhLabel: '搅拌机', enLabel: 'Blender', category: 'appliance' },
  { key: 'toaster', zhLabel: '烤面包机', enLabel: 'Toaster', category: 'appliance' },
  { key: 'knife', zhLabel: '刀', enLabel: 'Knife', category: 'prep' },
  { key: 'cutting_board', zhLabel: '砧板', enLabel: 'Cutting Board', category: 'prep' },
  { key: 'spatula', zhLabel: '锅铲', enLabel: 'Spatula', category: 'prep' },
  { key: 'ladle', zhLabel: '汤勺', enLabel: 'Ladle', category: 'prep' },
  { key: 'tongs', zhLabel: '夹子', enLabel: 'Tongs', category: 'prep' },
  { key: 'mixing_bowl', zhLabel: '搅拌碗', enLabel: 'Mixing Bowl', category: 'prep' },
  { key: 'peeler', zhLabel: '削皮器', enLabel: 'Peeler', category: 'prep' },
  { key: 'measuring_cup', zhLabel: '量杯', enLabel: 'Measuring Cup', category: 'prep' },
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
  { key: 'dark_soy_sauce', zhLabel: '老抽', enLabel: 'Dark Soy Sauce', category: 'sauce' },
  { key: 'vinegar', zhLabel: '醋', enLabel: 'Vinegar', category: 'sauce' },
  { key: 'oyster_sauce', zhLabel: '蚝油', enLabel: 'Oyster Sauce', category: 'sauce' },
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

// ============================================================================
// Runtime Key Sets
// ============================================================================

export const PORTION_SIZE_KEYS: PortionSizeKey[] = PORTION_SIZE_OPTIONS.map((o) => o.key)

export const SPICE_LEVEL_KEYS: SpiceLevelKey[] = SPICE_LEVEL_OPTIONS.map((o) => o.key)

export const SALTINESS_KEYS: SaltinessKey[] = SALTINESS_OPTIONS.map((o) => o.key)

export const CUISINE_KEYS: CuisineKey[] = CUISINE_OPTIONS.map((o) => o.key)

export const MEAL_STYLE_KEYS: MealStyleKey[] = MEAL_STYLE_OPTIONS.map((o) => o.key)

export const DIET_TAG_KEYS: DietTagKey[] = DIET_TAG_OPTIONS.map((o) => o.key)

export const DISLIKED_INGREDIENT_KEYS: DislikedIngredientKey[] = DISLIKED_INGREDIENT_OPTIONS.map((o) => o.key)

export const ALLERGEN_KEYS: AllergenKey[] = ALLERGEN_OPTIONS.map((o) => o.key)

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

export function isValidCuisineKey(key: string): key is CuisineKey {
  return CUISINE_KEYS.includes(key as CuisineKey)
}

export function isValidMealStyleKey(key: string): key is MealStyleKey {
  return MEAL_STYLE_KEYS.includes(key as MealStyleKey)
}

export function isValidDietTagKey(key: string): key is DietTagKey {
  return DIET_TAG_KEYS.includes(key as DietTagKey)
}

export function isValidDislikedIngredientKey(key: string): key is DislikedIngredientKey {
  return DISLIKED_INGREDIENT_KEYS.includes(key as DislikedIngredientKey)
}

export function isValidAllergenKey(key: string): key is AllergenKey {
  return ALLERGEN_KEYS.includes(key as AllergenKey)
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
