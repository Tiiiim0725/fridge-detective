# Ingredient Dictionary v0.2

本文件定义 Fridge Detective 的 Content v0.2 食材词表地基。目标是让 200 道菜品库、Fridge Recognition、Recipe Foundation 共用稳定的 `ingredient_key`。

## Principles

- 每个食材必须有稳定 `ingredient_key`。
- `ingredient_key` 使用英文 snake_case。
- P0 / P1 / P2 是内容建设优先级，不是推荐算法字段。
- 推荐算法不应因为 P0 / P1 / P2 直接区别对待食材。
- v0.2 seed 会写入 `ingredients` 公共知识库表，不写用户私有数据，不写 recipes。
- v0.1 旧 key 不删除，避免破坏现有 Recipe Foundation；未来如要合并旧 key，需要单独迁移。

## v0.2 Metadata

`006_content_v0_2.sql` 为 `ingredients` 新增以下可选字段：

| 字段 | 说明 |
| --- | --- |
| `content_tier` | `P0` / `P1` / `P2`，内容库建设优先级。 |
| `subcategory_key` | 内容侧二级分类，例如 `staple_carbs`、`asian_sauce`。 |
| `storage_type` | 默认储存方式：`fridge` / `freezer` / `pantry` / `canned` / `room_temp`。 |
| `is_basic_pantry` | 是否属于默认假设用户拥有的基础 pantry；v0.2 只有 `salt` / `sugar`。 |
| `is_fridge_recognition_target` | 是否适合作为拍照识别候选。 |

## Alias Matching v0.2

`ingredients.aliases` 用于用户自由输入 pantry / 食材，以及 AI `rawName` 标准化。菜谱、库存和识别草稿仍然必须落到标准 `ingredient_key`，不要把自由文本直接当作正式食材 key 保存。

建议匹配顺序：

1. `ingredient_key`
2. `zh_name`
3. `en_name`
4. `aliases`

如果匹配不到标准食材，不要直接写入正式 ingredient dictionary 或 `fridge_items`。前端应提示用户换个说法、手动选择已有食材，或暂时跳过。

Aliases 应尽量覆盖中文常见名、英文常见名、英文复数、北美超市叫法和用户口语叫法；同一个 alias 不应放到多个 `ingredient_key` 下。

## Pantry Basic Flag v0.2

`content_tier = P0` 只表示内容建设优先级，不表示用户默认拥有该食材。

`is_basic_pantry = true` 只用于默认不问用户的基础项：

- `salt`
- `sugar`

其他 pantry / 调味品即使是 P0，也不应标记为 `is_basic_pantry = true`。例如 `black_pepper` 属于快捷九宫格，`oyster_sauce` 通过自由输入匹配。

## 主食 / 碳水

### P0

| 中文 | ingredient_key |
| --- | --- |
| 大米 | `rice` |
| 面条 | `noodles` |
| 意大利面 | `pasta` |
| 面包 | `bread` |
| 土豆 | `potato` |
| 红薯 | `sweet_potato` |
| 面粉 | `flour` |

### P1

| 中文 | ingredient_key |
| --- | --- |
| 玉米饼 | `tortilla` |
| 燕麦 | `oats` |
| 拉面 | `ramen_noodles` |
| 乌冬面 | `udon_noodles` |

## 蛋白质 / 肉类 / 海鲜

### P0

| 中文 | ingredient_key |
| --- | --- |
| 鸡蛋 | `egg` |
| 豆腐 | `tofu` |
| 鸡胸肉 | `chicken_breast` |
| 鸡腿肉 | `chicken_thigh` |
| 牛肉碎 | `ground_beef` |
| 猪肉片 | `pork_slice` |
| 猪肉馅 | `ground_pork` |
| 白鱼 | `white_fish` |
| 虾 | `shrimp` |
| 罐头金枪鱼 | `canned_tuna` |

### P1

| 中文 | ingredient_key |
| --- | --- |
| 鸡翅 | `chicken_wings` |
| 鸡腿 / 鸡腿肉块 | `chicken_drumstick` |
| 牛肉片 | `beef_slice` |
| 牛腱 | `beef_shank` |
| 火鸡碎 | `ground_turkey` |
| 火鸡胸 | `turkey_breast` |
| 五花肉 | `pork_belly` |
| 培根 | `bacon` |
| 香肠 | `sausage` |
| 猪排 | `pork_chop` |
| 三文鱼 | `salmon` |
| 鳕鱼 | `cod` |
| 扇贝 | `scallops` |
| 蟹肉棒 | `imitation_crab` |

### P2

| 中文 | ingredient_key |
| --- | --- |
| 鸭胸 | `duck_breast` |
| 鸭腿 | `duck_leg` |
| 羊肉片 | `lamb_slice` |
| 海螺 | `whelk` |

## 蔬菜类

### P0

| 中文 | ingredient_key |
| --- | --- |
| 洋葱 | `onion` |
| 红洋葱 | `red_onion` |
| 大蒜 | `garlic` |
| 姜 | `ginger` |
| 小葱 | `scallion` |
| 番茄 | `tomato` |
| 胡萝卜 | `carrot` |
| 黄瓜 | `cucumber` |
| 生菜 | `lettuce` |
| 菠菜 | `spinach` |
| 卷心菜 | `cabbage` |
| 西兰花 | `broccoli` |
| 花椰菜 | `cauliflower` |
| 蘑菇 | `mushroom` |
| 玉米 | `corn` |
| 四季豆 | `green_beans` |

### P1

| 中文 | ingredient_key |
| --- | --- |
| 香菜 | `cilantro` |
| 欧芹 | `parsley` |
| 罗勒 | `basil` |
| 樱桃番茄 | `cherry_tomato` |
| 羽衣甘蓝 | `kale` |
| 大白菜 | `napa_cabbage` |
| 小白菜 | `bok_choy` |
| 彩椒 | `bell_pepper` |
| 西葫芦 | `zucchini` |
| 茄子 | `eggplant` |
| 芹菜 | `celery` |
| 豌豆 | `peas` |
| 毛豆 | `edamame` |
| 豆芽 | `bean_sprouts` |
| 牛油果 | `avocado` |

### P1 冷冻 / 罐装

| 中文 | ingredient_key |
| --- | --- |
| 冷冻混合蔬菜 | `frozen_mixed_vegetables` |
| 冷冻西兰花 | `frozen_broccoli` |
| 冷冻菠菜 | `frozen_spinach` |
| 冷冻玉米 | `frozen_corn` |
| 冷冻豌豆 | `frozen_peas` |
| 罐头玉米 | `canned_corn` |
| 罐头番茄 | `canned_tomato` |
| 罐头蘑菇 | `canned_mushroom` |

### P2

| 中文 | ingredient_key |
| --- | --- |
| 秋葵 | `okra` |
| 芦笋 | `asparagus` |
| 抱子甘蓝 | `brussels_sprouts` |
| 甜菜根 | `beetroot` |
| 南瓜 | `pumpkin` |
| 韭菜 | `garlic_chives` |
| 蒜苗 | `garlic_sprouts` |
| 莲藕 | `lotus_root` |
| 冬瓜 | `winter_melon` |
| 苦瓜 | `bitter_melon` |

## 水果 / 简单点心类

### P0

| 中文 | ingredient_key |
| --- | --- |
| 香蕉 | `banana` |
| 苹果 | `apple` |
| 橙子 | `orange` |

### P1

| 中文 | ingredient_key |
| --- | --- |
| 柠檬 | `lemon` |
| 酸橙 | `lime` |
| 葡萄 | `grapes` |
| 草莓 | `strawberry` |
| 蓝莓 | `blueberry` |
| 浆果混合 | `berries` |
| 芒果 | `mango` |
| 菠萝 | `pineapple` |
| 梨 | `pear` |
| 桃子 | `peach` |
| 冷冻浆果 | `frozen_berries` |
| 冷冻芒果 | `frozen_mango` |
| 罐头菠萝 | `canned_pineapple` |
| 罐头桃子 | `canned_peach` |
| 葡萄干 | `raisins` |
| 果干混合 | `dried_fruit` |
| 花生酱 | `peanut_butter` |
| 果酱 | `jam` |
| 坚果混合 | `mixed_nuts` |
| 格兰诺拉麦片 | `granola` |

## 调味 / Pantry

### P0 基础调味

| 中文 | ingredient_key |
| --- | --- |
| 盐 | `salt` |
| 黑胡椒 | `black_pepper` |
| 白胡椒 | `white_pepper` |
| 糖 | `sugar` |
| 蜂蜜 | `honey` |
| 烹饪油 | `cooking_oil` |
| 橄榄油 | `olive_oil` |
| 黄油 | `butter` |

### P0 中式 / 亚洲基础常用调味

| 中文 | ingredient_key |
| --- | --- |
| 酱油 | `soy_sauce` |
| 生抽 | `light_soy_sauce` |
| 老抽 | `dark_soy_sauce` |
| 米醋 | `rice_vinegar` |
| 醋 | `vinegar` |
| 香醋 | `black_vinegar` |
| 芝麻油 | `sesame_oil` |
| 蚝油 | `oyster_sauce` |
| 料酒 | `cooking_wine` |

### P1 中式 / 亚洲风味增强

| 中文 | ingredient_key |
| --- | --- |
| 辣椒油 | `chili_oil` |
| 辣酱 | `hot_sauce` |
| 蒜蓉辣酱 | `chili_garlic_sauce` |
| 豆瓣酱 | `doubanjiang` |
| 甜面酱 | `sweet_bean_sauce` |
| 海鲜酱 | `hoisin_sauce` |
| 味噌 | `miso` |
| 韩式辣酱 | `gochujang` |
| 照烧酱 | `teriyaki_sauce` |
| 鱼露 | `fish_sauce` |
| 咖喱块 | `curry_blocks` |

### P1 西餐简餐 / 常见酱料

| 中文 | ingredient_key |
| --- | --- |
| 番茄酱 | `ketchup` |
| 蛋黄酱 | `mayonnaise` |
| 芥末 | `mustard` |
| 黄芥末 | `yellow_mustard` |
| 第戎芥末 | `dijon_mustard` |
| 辣椒酱 | `sriracha` |
| 烧烤酱 | `bbq_sauce` |
| 沙拉酱 | `salad_dressing` |
| 意面酱 | `pasta_sauce` |
| 番茄膏 | `tomato_paste` |
| 罐头番茄碎 | `crushed_tomatoes` |
| 椰奶 | `coconut_milk` |
| 奶油 | `cream` |
| 酸奶油 | `sour_cream` |
| 牛奶 | `milk` |
| 酸奶 | `yogurt` |
| 奶酪 | `cheese` |

### P1 香料 / 干料

| 中文 | ingredient_key |
| --- | --- |
| 蒜粉 | `garlic_powder` |
| 洋葱粉 | `onion_powder` |
| 辣椒粉 | `paprika` |
| 辣椒碎 | `chili_flakes` |
| 孜然 | `cumin` |
| 咖喱粉 | `curry_powder` |
| 五香粉 | `five_spice_powder` |
| 花椒粉 | `sichuan_peppercorn_powder` |
| 意大利综合香草 | `italian_seasoning` |
| 牛至 | `oregano` |
| 百里香 | `thyme` |
| 迷迭香 | `rosemary` |
| 肉桂粉 | `cinnamon` |
| 月桂叶 | `bay_leaf` |

### P1 增稠 / 烘焙 / 辅助材料

| 中文 | ingredient_key |
| --- | --- |
| 玉米淀粉 | `cornstarch` |
| 面粉 | `flour` |
| 面包糠 | `breadcrumbs` |
| 泡打粉 | `baking_powder` |
| 小苏打 | `baking_soda` |
| 酵母 | `yeast` |

### P1 汤底 / 罐头 / 快速 pantry

| 中文 | ingredient_key |
| --- | --- |
| 高汤块 | `stock_cube` |
| 鸡汤 | `chicken_broth` |
| 蔬菜汤 | `vegetable_broth` |
| 牛肉汤 | `beef_broth` |
| 罐头鹰嘴豆 | `canned_chickpeas` |
| 罐头黑豆 | `canned_black_beans` |
| 罐头红腰豆 | `canned_kidney_beans` |

## Legacy Compatibility

v0.1 seed 中已有一些更细粒度或旧命名 key，例如：

- `green_onion`
- `rolled_oats`
- `green_bean`
- `salmon_fillet`
- `cod_fillet`
- `spaghetti`
- `cooked_rice`

v0.2 seed 不删除这些 key。后续如要统一到 `scallion`、`oats`、`green_beans`、`salmon`、`cod`、`pasta` 等，需要单独设计 recipe 迁移，避免破坏已有测试菜谱。
