# User Preference v0.2

本文件定义短期用户偏好内容地基。目标是让 onboarding / profile UI、profileService、数据库 check constraint 使用同一套 key，避免推荐侧和内容侧各自发明偏好字段。

## Scope

v0.2 只收录 5 类偏好：

1. 饮食限制 / 不想吃
2. 口味 / 菜系偏好
3. 做饭时间偏好
4. 做饭熟练度
5. 厨具条件

## Dietary Rules

字段：

```ts
dietaryRules: Array<'none' | 'vegetarian' | 'vegan' | 'halal_friendly'>
```

| key | 中文 | 说明 |
| --- | --- | --- |
| `none` | 无特殊限制 | 默认选项，不做特殊饮食过滤。不能和其他 dietary rule 同时保存。 |
| `vegetarian` | 素食 | 不吃肉类和海鲜，但可以吃蛋奶。 |
| `vegan` | 纯素 | 不吃肉、海鲜、蛋、奶、奶酪、黄油等动物来源食材。 |
| `halal_friendly` | 清真友好 | 避免猪肉和酒类/料酒类食材；但不承诺肉类都有清真认证。 |

不再保留 `no_pork`、`no_beef`、`pescatarian` 等作为 dietary rule。具体不想吃某个食材统一进入 `avoidIngredientKeys`。

## Avoid Ingredient Keys

字段：

```ts
avoidIngredientKeys: string[]
```

规则：

- 值应使用 `ingredients.ingredient_key`。
- key 格式使用英文 snake_case，例如 `cilantro`、`pork_belly`、`cooking_wine`。
- 不用额外建固定枚举表；前端可以展示常见建议项，但最终应允许用户选择任意标准 ingredient key。

## Cuisine Preferences

字段：

```ts
cuisinePreferences: Array<
  | 'chinese_home'
  | 'western_simple'
  | 'shandong'
  | 'sichuan'
  | 'cantonese'
  | 'huaiyang'
>
```

默认建议勾选，可取消：

| key | 中文 | 说明 |
| --- | --- | --- |
| `chinese_home` | 中式家常菜 | 默认建议。 |
| `western_simple` | 西餐简餐 | 默认建议。 |

四大传统菜系可选，最多选 2 个：

| key | 中文 |
| --- | --- |
| `shandong` | 鲁菜 |
| `sichuan` | 川菜 |
| `cantonese` | 粤菜 |
| `huaiyang` | 淮扬菜 |

## Cook Time Preference

字段：

```ts
cookTimePreferenceKey:
  | 'under_15'
  | 'under_30'
  | 'under_45'
  | 'over_45_ok'
```

做饭时间包含备菜、腌制、等待时间。默认建议 `under_30`。

| key | 中文 | 说明 |
| --- | --- | --- |
| `under_15` | 15 分钟以内 | 只推荐极快手菜。 |
| `under_30` | 30 分钟以内 | 默认建议，适合多数日常场景。 |
| `under_45` | 45 分钟以内 | 可以接受稍完整的一餐。 |
| `over_45_ok` | 45 分钟以上也可以 | 不是 60 分钟以内，而是表示用户愿意接受腌制、炖煮、提前处理等更长准备时间。 |

## Cooking Skill

字段：

```ts
cookingSkill: 'beginner' | 'normal' | 'confident'
```

| key | 中文 | 说明 |
| --- | --- | --- |
| `beginner` | 新手 | 能煎蛋、煮面、简单炒菜。 |
| `normal` | 普通 | 会做大多数家常菜。 |
| `confident` | 熟练 | 愿意处理复杂步骤和火候。 |

## Kitchen Equipment

### 默认假设，不问用户

这些 key 默认认为用户具备：

- `knife`
- `cutting_board`
- `bowl`
- `plate`
- `spoon`
- `chopsticks_or_fork`
- `spatula`
- `basic_storage_container`

### 需要用户选择

- `stove_or_hotplate`
- `frying_pan_or_wok`
- `pot`
- `rice_cooker`
- `microwave`
- `oven`
- `air_fryer`
- `electric_kettle`
- `steamer`
- `blender`
- `pressure_cooker`
- `toaster`

MVP 默认建议勾选：

- `stove_or_hotplate`
- `frying_pan_or_wok`
- `pot`
- `rice_cooker`
- `microwave`

## Pantry Items 录入规则 v0.2

Pantry 录入不做大问卷，采用“基础默认 + 九宫格快捷选择 + 自由输入”的轻量方式。

### 基础默认，不问用户

- `salt`：盐
- `sugar`：糖

### 快捷九宫格

以下 9 个 pantry item 在 UI 中以小图标 + 文字展示，用户点亮表示拥有：

- `soy_sauce`：酱油
- `vinegar`：醋
- `black_pepper`：黑胡椒
- `sesame_oil`：芝麻油
- `chili_oil`：辣椒油
- `cooking_wine`：料酒
- `cornstarch`：玉米淀粉
- `pasta_sauce`：意面酱
- `curry_blocks`：咖喱块

### 自由输入

除九宫格外，用户可以手动输入其他常备调味 / pantry。输入内容需要通过 ingredient dictionary 的 `ingredient_key`、中文名、英文名、aliases 做匹配。

例如：

- “蚝油” → `oyster_sauce`
- “豆瓣酱 / 郫县豆瓣” → `doubanjiang`
- “韩式辣酱” → `gochujang`
- “味噌” → `miso`
- “番茄膏” → `tomato_paste`
- “蛋黄酱” → `mayonnaise`

匹配成功后加入 `pantry_items`。
匹配失败时不直接写入正式数据，提示用户换个说法或暂时跳过。

## Compatibility Notes

- 数据库仍复用 `user_preferences.cuisine_preferences` 保存 v0.2 cuisine keys。
- 数据库仍复用 `user_preferences.diet_tags` 保存 `dietaryRules`，避免一次性迁移历史数据列名。
- 数据库仍复用 `user_preferences.disliked_ingredient_keys` 保存 `avoidIngredientKeys`。
- 数据库使用 `user_preferences.cook_time_preference_key` 保存做饭时间偏好档位，不再使用数字型 `max_cook_time_minutes`。
- `services/profileService.ts` 兼容旧输入字段 `dietTags` / `dislikedIngredientKeys`，但新 UI 应使用 `dietaryRules` / `avoidIngredientKeys`。
- `recipe_tools.equipment_key` 与 `kitchen_equipment.equipment_key` 仍共用同一套 key；v0.1 recipe seed 中的旧厨具 key 暂时保留为 legacy compatibility。
