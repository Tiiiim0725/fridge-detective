// 用户健康与偏好档案
export interface UserProfile {
  id?: string
  gender?: string
  weight?: number
  appetite?: 'small' | 'medium' | 'large'
  healthConditions: string[]   // 如 ['diabetes', 'gastritis']
  tastePreferences: {
    spicy: 1 | 2 | 3 | 4 | 5
    salty: 1 | 2 | 3 | 4 | 5
    dietStyle: string[]        // 如 ['vegetarian', 'low-oil']
  }
}

// 厨房装备档案
export interface KitchenProfile {
  equipment: string[]          // 如 ['wok', 'steamer', 'oven']
  condiments: string[]         // 如 ['salt', 'soy_sauce', 'vinegar']
}

// 食材
export interface Ingredient {
  id: string
  name: string
  quantity?: string
  unit?: string
}

// 菜品
export interface Recipe {
  id: string
  name: string
  coverImage?: string
  totalMinutes: number
  difficulty: 1 | 2 | 3       // 1 简单 2 中等 3 困难
  flavorTags: string[]
  requiredIngredients: Ingredient[]
  minIngredients: Ingredient[] // 最低食材集合
  substitutes?: Record<string, string[]>
  requiredEquipment: string[]
  requiredCondiments: string[]
  steps: RecipeStep[]
  suitableFor?: string[]       // 适合人群，如排除糖尿病
  matchScore?: number          // 匹配时动态计算
}

// 烹饪步骤
export interface RecipeStep {
  order: number
  description: string
  imageUrl?: string
  durationSeconds?: number
}

// 冰箱扫描结果
export interface FridgeScan {
  id: string
  scannedAt: string
  ingredients: Ingredient[]
  isConfirmed: boolean
}
