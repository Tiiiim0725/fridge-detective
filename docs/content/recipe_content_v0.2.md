# 冰箱侦探正式菜品库 200 道 v0.2 摘要

生成日期：2026-06-12

来源文档：

- `菜品生成/冰箱侦探_项目上下文文档(2).md`
- `菜品生成/用户偏好＋食材.md`
- `Recipe_Ingredient_Foundation_v0.2_草案.md`

## 校验结果

- 菜品总数：200
- 30 分钟内菜品：189
- beginner / normal 菜品：198
- 不依赖 oven 菜品：200
- minimum_required_ingredients 不超过 8 个：200
- P2 食材作为最低必需食材的菜品数：2
- 中式/亚洲家常且 30 分钟内 beginner/normal 菜品：116

## 用户习惯推荐链条字段

每道菜都包含 `preference_match`，供后续推荐算法使用：

- `dietary_rule_keys`：匹配 `dietaryRules`，用于素食、纯素、清真友好等过滤。
- `avoid_ingredient_hard_filter_keys`：匹配 `avoidIngredientKeys`，命中后应直接排除。
- `avoid_ingredient_soft_conflict_keys`：可选食材冲突，不直接排除，可隐藏可选项或降低排序。
- `cuisine_preference_keys`：匹配 `cuisinePreferences`；鲁/川/粤/淮扬会同时命中 `chinese_home`。
- `max_cook_time_fit`：匹配用户默认做饭时间。
- `cooking_skill_fit`：匹配用户做饭熟练度。
- `required_equipment_keys`：匹配用户厨具条件。
- `fridge_core_match_keys` / `fridge_optional_boost_keys`：用于冰箱食材覆盖度打分。
- `pantry_match_keys`：用于常备调料覆盖度打分。

## cuisine_key 分布

- cantonese: 14
- chinese_home: 97
- huaiyang: 4
- shandong: 4
- sichuan: 4
- western_simple: 77

## meal_type 分布

- air_fryer: 4
- blender_breakfast: 1
- breakfast: 9
- fridge_cleanout: 2
- fried_rice: 9
- microwave: 6
- noodle: 21
- pasta: 12
- rice_bowl: 32
- rice_cooker: 5
- salad_light: 9
- sandwich_wrap: 15
- side: 5
- soup_stew: 13
- stir_fry: 57

## difficulty 分布

- beginner: 123
- confident: 2
- normal: 75

## 200 道菜品索引

| # | recipe_key | 菜名 | cuisine_key | meal_type | difficulty | 分钟 | minimum_required_ingredients |
| - | - | - | - | - | - | -: | - |
| 1 | `tomato_egg_stir_fry` | 番茄炒蛋 | chinese_home | stir_fry | beginner | 15 | `tomato`, `egg` |
| 2 | `scallion_egg_fried_rice` | 葱花鸡蛋炒饭 | chinese_home | fried_rice | beginner | 15 | `rice`, `egg`, `scallion` |
| 3 | `garlic_broccoli` | 蒜香西兰花 | chinese_home | side | beginner | 12 | `broccoli`, `garlic` |
| 4 | `cabbage_egg_stir_fry` | 卷心菜炒蛋 | chinese_home | stir_fry | beginner | 15 | `cabbage`, `egg` |
| 5 | `mushroom_spinach_egg` | 蘑菇菠菜炒蛋 | chinese_home | stir_fry | beginner | 15 | `mushroom`, `spinach`, `egg` |
| 6 | `tofu_mushroom_stir_fry` | 蘑菇烧豆腐 | chinese_home | stir_fry | normal | 20 | `tofu`, `mushroom`, `garlic` |
| 7 | `chicken_broccoli_stir_fry` | 鸡胸西兰花快炒 | chinese_home | stir_fry | normal | 25 | `chicken_breast`, `broccoli`, `garlic` |
| 8 | `ginger_scallion_chicken_thigh` | 姜葱鸡腿肉 | chinese_home | stir_fry | normal | 25 | `chicken_thigh`, `ginger`, `scallion` |
| 9 | `beef_onion_stir_fry` | 洋葱牛肉片 | chinese_home | stir_fry | normal | 20 | `beef_slice`, `onion` |
| 10 | `ground_beef_tomato_tofu` | 番茄牛肉碎豆腐 | chinese_home | stir_fry | normal | 25 | `ground_beef`, `tomato`, `tofu` |
| 11 | `pork_cabbage_stir_fry` | 猪肉片炒卷心菜 | chinese_home | stir_fry | normal | 20 | `pork_slice`, `cabbage`, `garlic` |
| 12 | `shrimp_egg_stir_fry` | 虾仁滑蛋 | cantonese | stir_fry | normal | 18 | `shrimp`, `egg`, `scallion` |
| 13 | `white_fish_ginger_scallion` | 姜葱白鱼 | cantonese | stir_fry | normal | 25 | `white_fish`, `ginger`, `scallion` |
| 14 | `tofu_bok_choy` | 小白菜豆腐 | cantonese | stir_fry | beginner | 18 | `tofu`, `bok_choy`, `garlic` |
| 15 | `green_beans_ground_pork` | 肉末四季豆 | sichuan | stir_fry | normal | 25 | `green_beans`, `ground_pork`, `garlic` |
| 16 | `mapo_tofu_student` | 留学生版麻婆豆腐 | sichuan | stir_fry | normal | 25 | `tofu`, `ground_pork`, `doubanjiang` |
| 17 | `spicy_eggplant_tofu` | 豆瓣茄子豆腐 | sichuan | stir_fry | normal | 28 | `eggplant`, `tofu`, `doubanjiang` |
| 18 | `celery_beef_slice` | 芹菜牛肉片 | shandong | stir_fry | normal | 22 | `beef_slice`, `celery`, `garlic` |
| 19 | `shandong_garlic_cabbage` | 醋香蒜炒卷心菜 | shandong | side | beginner | 12 | `cabbage`, `garlic` |
| 20 | `huaiyang_tofu_pea_mushroom` | 豆腐豌豆蘑菇 | huaiyang | stir_fry | normal | 20 | `tofu`, `peas`, `mushroom` |
| 21 | `huaiyang_shrimp_tofu` | 虾仁豆腐 | huaiyang | stir_fry | normal | 20 | `shrimp`, `tofu`, `peas` |
| 22 | `garlic_spinach` | 蒜蓉菠菜 | chinese_home | side | beginner | 10 | `spinach`, `garlic` |
| 23 | `cauliflower_ground_turkey` | 火鸡碎炒花椰菜 | chinese_home | stir_fry | normal | 25 | `cauliflower`, `ground_turkey`, `garlic` |
| 24 | `cabbage_chicken_thigh` | 鸡腿肉炒大白菜 | chinese_home | stir_fry | normal | 25 | `chicken_thigh`, `napa_cabbage`, `ginger` |
| 25 | `carrot_potato_chicken` | 胡萝卜土豆鸡块 | chinese_home | stir_fry | normal | 30 | `chicken_thigh`, `potato`, `carrot` |
| 26 | `tomato_cauliflower_egg` | 番茄花菜炒蛋 | chinese_home | stir_fry | beginner | 18 | `tomato`, `cauliflower`, `egg` |
| 27 | `mushroom_chicken_breast` | 蘑菇鸡胸肉 | chinese_home | stir_fry | normal | 22 | `chicken_breast`, `mushroom`, `garlic` |
| 28 | `shrimp_broccoli_garlic` | 蒜香虾仁西兰花 | cantonese | stir_fry | normal | 20 | `shrimp`, `broccoli`, `garlic` |
| 29 | `cucumber_egg_light_stir` | 黄瓜炒蛋 | chinese_home | stir_fry | beginner | 12 | `cucumber`, `egg` |
| 30 | `bok_choy_mushroom` | 小白菜炒蘑菇 | cantonese | side | beginner | 15 | `bok_choy`, `mushroom`, `garlic` |
| 31 | `spicy_cabbage_tofu` | 辣油卷心菜豆腐 | sichuan | stir_fry | beginner | 20 | `cabbage`, `tofu`, `chili_oil` |
| 32 | `pork_belly_napa_cabbage` | 五花肉大白菜 | chinese_home | stir_fry | normal | 28 | `pork_belly`, `napa_cabbage`, `garlic` |
| 33 | `zucchini_egg_stir_fry` | 西葫芦炒蛋 | chinese_home | stir_fry | beginner | 15 | `zucchini`, `egg`, `garlic` |
| 34 | `tomato_white_fish_pan` | 番茄白鱼锅 | cantonese | stir_fry | normal | 25 | `white_fish`, `tomato`, `ginger` |
| 35 | `edamame_corn_tofu` | 毛豆玉米豆腐 | chinese_home | stir_fry | beginner | 18 | `edamame`, `corn`, `tofu` |
| 36 | `chicken_egg_rice_bowl` | 鸡蛋鸡胸饭 | chinese_home | rice_bowl | beginner | 25 | `rice`, `chicken_breast`, `egg` |
| 37 | `beef_tomato_rice_bowl` | 番茄牛肉碎盖饭 | chinese_home | rice_bowl | normal | 30 | `rice`, `ground_beef`, `tomato`, `onion` |
| 38 | `tofu_vegetable_rice_bowl` | 豆腐蔬菜饭 | chinese_home | rice_bowl | beginner | 25 | `rice`, `tofu`, `broccoli`, `carrot` |
| 39 | `shrimp_corn_fried_rice` | 虾仁玉米炒饭 | chinese_home | fried_rice | beginner | 18 | `rice`, `shrimp`, `corn`, `egg` |
| 40 | `tuna_cucumber_rice_bowl` | 金枪鱼黄瓜饭 | western_simple | rice_bowl | beginner | 12 | `rice`, `canned_tuna`, `cucumber` |
| 41 | `mushroom_spinach_noodles` | 蘑菇菠菜拌面 | chinese_home | noodle | beginner | 18 | `noodles`, `mushroom`, `spinach` |
| 42 | `chicken_broccoli_noodles` | 鸡胸西兰花炒面 | chinese_home | noodle | normal | 25 | `noodles`, `chicken_breast`, `broccoli` |
| 43 | `beef_onion_udon` | 洋葱牛肉乌冬 | chinese_home | noodle | normal | 25 | `udon_noodles`, `beef_slice`, `onion` |
| 44 | `tomato_egg_noodle_soup` | 番茄鸡蛋汤面 | chinese_home | noodle | beginner | 18 | `noodles`, `tomato`, `egg` |
| 45 | `cabbage_pork_noodles` | 卷心菜肉片炒面 | chinese_home | noodle | normal | 25 | `noodles`, `pork_slice`, `cabbage` |
| 46 | `sesame_tofu_noodle_bowl` | 芝麻豆腐黄瓜面 | chinese_home | noodle | beginner | 15 | `noodles`, `tofu`, `cucumber` |
| 47 | `curry_chicken_rice` | 咖喱鸡肉饭 | western_simple | rice_bowl | normal | 35 | `rice`, `chicken_thigh`, `potato`, `carrot`, `curry_blocks` |
| 48 | `vegetable_curry_rice` | 蔬菜咖喱饭 | western_simple | rice_bowl | beginner | 30 | `rice`, `potato`, `carrot`, `curry_blocks` |
| 49 | `canned_tuna_fried_rice` | 金枪鱼鸡蛋炒饭 | western_simple | fried_rice | beginner | 15 | `rice`, `canned_tuna`, `egg` |
| 50 | `ground_pork_corn_rice_bowl` | 肉末玉米盖饭 | chinese_home | rice_bowl | normal | 25 | `rice`, `ground_pork`, `corn`, `onion` |
| 51 | `ramen_egg_spinach` | 菠菜鸡蛋拉面 | chinese_home | noodle | beginner | 12 | `ramen_noodles`, `egg`, `spinach` |
| 52 | `shrimp_tomato_noodles` | 番茄虾仁面 | chinese_home | noodle | normal | 22 | `noodles`, `shrimp`, `tomato` |
| 53 | `chicken_thigh_rice_cooker_pilaf` | 电饭煲鸡腿蔬菜饭 | western_simple | rice_cooker | normal | 40 | `rice`, `chicken_thigh`, `carrot`, `onion` |
| 54 | `tofu_bok_choy_rice_bowl` | 小白菜豆腐盖饭 | cantonese | rice_bowl | beginner | 25 | `rice`, `tofu`, `bok_choy` |
| 55 | `beef_shank_noodle_soup` | 牛腱汤面 | shandong | noodle | confident | 60 | `noodles`, `beef_shank`, `ginger`, `scallion` |
| 56 | `tomato_mushroom_pasta` | 番茄蘑菇意面 | western_simple | pasta | beginner | 25 | `pasta`, `tomato`, `mushroom` |
| 57 | `tuna_tomato_pasta` | 金枪鱼番茄意面 | western_simple | pasta | beginner | 20 | `pasta`, `canned_tuna`, `canned_tomato` |
| 58 | `ground_beef_pasta_skillet` | 牛肉碎意面锅 | western_simple | pasta | normal | 30 | `pasta`, `ground_beef`, `pasta_sauce`, `onion` |
| 59 | `chicken_broccoli_pasta` | 鸡胸西兰花意面 | western_simple | pasta | normal | 30 | `pasta`, `chicken_breast`, `broccoli` |
| 60 | `spinach_egg_toast` | 菠菜鸡蛋吐司 | western_simple | breakfast | beginner | 12 | `bread`, `egg`, `spinach` |
| 61 | `peanut_butter_banana_toast` | 花生酱香蕉吐司 | western_simple | sandwich_wrap | beginner | 5 | `bread`, `banana`, `peanut_butter` |
| 62 | `tuna_cucumber_sandwich` | 金枪鱼黄瓜三明治 | western_simple | sandwich_wrap | beginner | 10 | `bread`, `canned_tuna`, `cucumber` |
| 63 | `egg_tomato_sandwich` | 鸡蛋番茄三明治 | western_simple | sandwich_wrap | beginner | 12 | `bread`, `egg`, `tomato` |
| 64 | `chicken_avocado_wrap` | 鸡胸牛油果卷饼 | western_simple | sandwich_wrap | normal | 20 | `tortilla`, `chicken_breast`, `avocado` |
| 65 | `black_bean_corn_wrap` | 黑豆玉米卷饼 | western_simple | sandwich_wrap | beginner | 12 | `tortilla`, `canned_black_beans`, `corn` |
| 66 | `chickpea_cucumber_salad_wrap` | 鹰嘴豆黄瓜卷饼 | western_simple | sandwich_wrap | beginner | 12 | `tortilla`, `canned_chickpeas`, `cucumber` |
| 67 | `salmon_potato_plate` | 三文鱼土豆盘 | western_simple | air_fryer | normal | 30 | `salmon`, `potato`, `broccoli` |
| 68 | `cod_tomato_pan` | 番茄鳕鱼锅 | western_simple | stir_fry | normal | 25 | `cod`, `canned_tomato`, `onion` |
| 69 | `turkey_mushroom_pasta` | 火鸡蘑菇意面 | western_simple | pasta | normal | 30 | `pasta`, `ground_turkey`, `mushroom`, `pasta_sauce` |
| 70 | `sausage_pepper_tortilla` | 香肠彩椒卷饼 | western_simple | sandwich_wrap | normal | 20 | `tortilla`, `sausage`, `bell_pepper`, `onion` |
| 71 | `banana_oat_pancake` | 香蕉燕麦煎饼 | western_simple | breakfast | beginner | 15 | `banana`, `oats`, `egg` |
| 72 | `apple_oat_bowl` | 苹果燕麦碗 | western_simple | microwave | beginner | 8 | `oats`, `apple` |
| 73 | `berry_granola_bowl` | 浆果格兰诺拉碗 | western_simple | salad_light | beginner | 5 | `granola`, `berries` |
| 74 | `peanut_butter_apple_oats` | 花生酱苹果燕麦 | western_simple | microwave | beginner | 8 | `oats`, `apple`, `peanut_butter` |
| 75 | `sweet_potato_egg_hash` | 红薯鸡蛋早餐锅 | western_simple | breakfast | normal | 25 | `sweet_potato`, `egg`, `onion` |
| 76 | `avocado_egg_bread` | 牛油果鸡蛋面包 | western_simple | breakfast | beginner | 12 | `bread`, `avocado`, `egg` |
| 77 | `mango_oat_smoothie_bowl` | 芒果燕麦奶昔碗 | western_simple | blender_breakfast | beginner | 8 | `oats`, `mango`, `banana` |
| 78 | `egg_corn_cucumber_salad` | 鸡蛋玉米黄瓜沙拉 | chinese_home | salad_light | beginner | 10 | `egg`, `corn`, `cucumber` |
| 79 | `tuna_apple_salad_bread` | 金枪鱼苹果沙拉配面包 | western_simple | salad_light | beginner | 10 | `canned_tuna`, `apple`, `bread` |
| 80 | `mixed_nuts_fruit_toast` | 坚果水果吐司 | western_simple | sandwich_wrap | beginner | 7 | `bread`, `banana`, `mixed_nuts` |
| 81 | `tomato_tofu_soup` | 番茄豆腐蛋汤 | chinese_home | soup_stew | beginner | 18 | `tomato`, `tofu`, `egg` |
| 82 | `cabbage_pork_soup` | 卷心菜肉片汤 | chinese_home | soup_stew | normal | 30 | `cabbage`, `pork_slice`, `ginger` |
| 83 | `chicken_corn_potato_soup` | 鸡肉玉米土豆汤 | western_simple | soup_stew | normal | 35 | `chicken_thigh`, `potato`, `corn` |
| 84 | `chickpea_tomato_stew` | 鹰嘴豆番茄炖菜 | western_simple | soup_stew | beginner | 25 | `canned_chickpeas`, `canned_tomato`, `onion` |
| 85 | `white_fish_tofu_soup` | 白鱼豆腐汤 | cantonese | soup_stew | normal | 25 | `white_fish`, `tofu`, `ginger` |
| 86 | `shrimp_corn_egg_soup` | 虾仁玉米蛋花汤 | huaiyang | soup_stew | beginner | 18 | `shrimp`, `corn`, `egg` |
| 87 | `beef_potato_carrot_stew` | 牛腱土豆胡萝卜汤 | shandong | soup_stew | confident | 60 | `beef_shank`, `potato`, `carrot`, `onion` |
| 88 | `curry_tofu_vegetable_stew` | 咖喱豆腐蔬菜煲 | western_simple | soup_stew | beginner | 30 | `tofu`, `potato`, `curry_blocks` |
| 89 | `pumpkin_chickpea_soup` | 南瓜鹰嘴豆汤 | western_simple | soup_stew | normal | 35 | `pumpkin`, `canned_chickpeas`, `onion` |
| 90 | `winter_melon_shrimp_soup` | 冬瓜虾仁汤 | huaiyang | soup_stew | normal | 30 | `winter_melon`, `shrimp`, `ginger` |
| 91 | `fridge_cleanout_fried_rice` | 冰箱清理炒饭 | chinese_home | fridge_cleanout | beginner | 18 | `rice`, `egg`, `frozen_mixed_vegetables` |
| 92 | `frozen_broccoli_chicken_bowl` | 冷冻西兰花鸡胸饭 | chinese_home | rice_bowl | beginner | 25 | `rice`, `chicken_breast`, `frozen_broccoli` |
| 93 | `canned_tomato_pasta_cleanout` | 罐头番茄清冰箱意面 | western_simple | pasta | beginner | 20 | `pasta`, `canned_tomato`, `onion` |
| 94 | `frozen_spinach_egg_noodles` | 冷冻菠菜鸡蛋面 | chinese_home | noodle | beginner | 15 | `noodles`, `frozen_spinach`, `egg` |
| 95 | `tortilla_breakfast_wrap` | 冷冻蔬菜鸡蛋卷饼 | western_simple | sandwich_wrap | beginner | 12 | `tortilla`, `egg`, `frozen_mixed_vegetables` |
| 96 | `canned_black_bean_rice_bowl` | 黑豆玉米饭碗 | western_simple | rice_bowl | beginner | 18 | `rice`, `canned_black_beans`, `canned_corn` |
| 97 | `tofu_frozen_pea_curry_rice` | 豆腐冷冻豌豆咖喱饭 | western_simple | rice_bowl | beginner | 30 | `rice`, `tofu`, `frozen_peas`, `curry_blocks` |
| 98 | `one_pot_udon_cleanout` | 一锅清冰箱乌冬 | chinese_home | fridge_cleanout | beginner | 20 | `udon_noodles`, `frozen_mixed_vegetables`, `egg` |
| 99 | `tomato_mushroom_toast` | 番茄蘑菇烤吐司 | western_simple | sandwich_wrap | beginner | 12 | `bread`, `tomato_paste`, `mushroom` |
| 100 | `microwave_sweet_potato_tuna` | 微波红薯金枪鱼 | western_simple | microwave | beginner | 12 | `sweet_potato`, `canned_tuna`, `corn` |
| 101 | `onion_egg_stir_fry` | 洋葱炒蛋 | chinese_home | stir_fry | beginner | 12 | `onion`, `egg` |
| 102 | `carrot_egg_stir_fry` | 胡萝卜炒蛋 | chinese_home | stir_fry | beginner | 15 | `carrot`, `egg` |
| 103 | `broccoli_egg_stir_fry` | 西兰花炒蛋 | chinese_home | stir_fry | beginner | 16 | `broccoli`, `egg` |
| 104 | `tomato_cabbage_egg` | 番茄卷心菜炒蛋 | chinese_home | stir_fry | beginner | 18 | `tomato`, `cabbage`, `egg` |
| 105 | `garlic_cauliflower` | 蒜香花椰菜 | chinese_home | side | beginner | 15 | `cauliflower`, `garlic` |
| 106 | `mushroom_egg_stir_fry` | 蘑菇炒蛋 | chinese_home | stir_fry | beginner | 14 | `mushroom`, `egg` |
| 107 | `pan_fried_scallion_tofu` | 葱香煎豆腐 | chinese_home | stir_fry | beginner | 18 | `tofu`, `scallion` |
| 108 | `soy_sauce_tofu_rice_bowl` | 酱油豆腐盖饭 | chinese_home | rice_bowl | beginner | 18 | `rice`, `tofu`, `scallion` |
| 109 | `tomato_tofu_rice_bowl` | 番茄豆腐盖饭 | chinese_home | rice_bowl | beginner | 22 | `rice`, `tomato`, `tofu` |
| 110 | `ground_pork_tofu_rice_bowl` | 肉末豆腐盖饭 | chinese_home | rice_bowl | normal | 25 | `rice`, `ground_pork`, `tofu` |
| 111 | `ground_beef_potato_stir_fry` | 牛肉碎炒土豆丁 | chinese_home | stir_fry | normal | 25 | `ground_beef`, `potato`, `onion` |
| 112 | `chicken_thigh_onion_stir_fry` | 洋葱鸡腿肉 | chinese_home | stir_fry | normal | 25 | `chicken_thigh`, `onion` |
| 113 | `tomato_chicken_breast` | 番茄鸡胸肉 | chinese_home | stir_fry | normal | 22 | `chicken_breast`, `tomato` |
| 114 | `cucumber_chicken_breast` | 黄瓜鸡胸肉 | chinese_home | stir_fry | normal | 18 | `chicken_breast`, `cucumber` |
| 115 | `bell_pepper_pork_slice` | 彩椒猪肉片 | chinese_home | stir_fry | normal | 22 | `pork_slice`, `bell_pepper`, `onion` |
| 116 | `bell_pepper_beef_slice` | 彩椒牛肉片 | chinese_home | stir_fry | normal | 20 | `beef_slice`, `bell_pepper` |
| 117 | `shrimp_cucumber_stir_fry` | 黄瓜虾仁 | cantonese | stir_fry | beginner | 16 | `shrimp`, `cucumber` |
| 118 | `shrimp_cabbage_stir_fry` | 虾仁炒卷心菜 | chinese_home | stir_fry | beginner | 18 | `shrimp`, `cabbage`, `garlic` |
| 119 | `white_fish_tomato_tofu_pan` | 番茄豆腐白鱼 | cantonese | stir_fry | normal | 25 | `white_fish`, `tomato`, `tofu` |
| 120 | `canned_tuna_cabbage_stir_fry` | 金枪鱼炒卷心菜 | chinese_home | stir_fry | beginner | 15 | `canned_tuna`, `cabbage` |
| 121 | `bacon_cabbage_stir_fry` | 培根炒卷心菜 | western_simple | stir_fry | beginner | 15 | `bacon`, `cabbage` |
| 122 | `sausage_potato_pan` | 香肠土豆锅 | western_simple | stir_fry | normal | 25 | `sausage`, `potato`, `onion` |
| 123 | `ground_turkey_tomato_egg` | 火鸡碎番茄蛋 | chinese_home | stir_fry | normal | 22 | `ground_turkey`, `tomato`, `egg` |
| 124 | `edamame_egg_fried_rice` | 毛豆鸡蛋炒饭 | chinese_home | fried_rice | beginner | 16 | `rice`, `edamame`, `egg` |
| 125 | `carrot_pea_fried_rice` | 胡萝卜豌豆炒饭 | chinese_home | fried_rice | beginner | 15 | `rice`, `carrot`, `peas` |
| 126 | `broccoli_egg_fried_rice` | 西兰花鸡蛋炒饭 | chinese_home | fried_rice | beginner | 18 | `rice`, `broccoli`, `egg` |
| 127 | `cabbage_egg_noodles` | 卷心菜鸡蛋面 | chinese_home | noodle | beginner | 16 | `noodles`, `cabbage`, `egg` |
| 128 | `tomato_tofu_noodles` | 番茄豆腐面 | chinese_home | noodle | beginner | 18 | `noodles`, `tomato`, `tofu` |
| 129 | `mushroom_pork_noodles` | 蘑菇肉片面 | chinese_home | noodle | normal | 22 | `noodles`, `pork_slice`, `mushroom` |
| 130 | `beef_spinach_noodles` | 牛肉菠菜面 | chinese_home | noodle | normal | 22 | `noodles`, `beef_slice`, `spinach` |
| 131 | `shrimp_spinach_noodles` | 虾仁菠菜面 | cantonese | noodle | beginner | 18 | `noodles`, `shrimp`, `spinach` |
| 132 | `tuna_corn_noodles` | 金枪鱼玉米拌面 | western_simple | noodle | beginner | 14 | `noodles`, `canned_tuna`, `corn` |
| 133 | `cabbage_carrot_ramen` | 卷心菜胡萝卜拉面 | chinese_home | noodle | beginner | 12 | `ramen_noodles`, `cabbage`, `carrot` |
| 134 | `tofu_mushroom_udon` | 豆腐蘑菇乌冬 | chinese_home | noodle | beginner | 18 | `udon_noodles`, `tofu`, `mushroom` |
| 135 | `potato_egg_rice_bowl` | 土豆鸡蛋盖饭 | chinese_home | rice_bowl | beginner | 22 | `rice`, `potato`, `egg` |
| 136 | `sweet_potato_egg_bowl` | 红薯鸡蛋饭碗 | western_simple | rice_bowl | beginner | 20 | `rice`, `sweet_potato`, `egg` |
| 137 | `tomato_chicken_rice_bowl` | 番茄鸡肉盖饭 | chinese_home | rice_bowl | normal | 25 | `rice`, `chicken_breast`, `tomato` |
| 138 | `cabbage_tofu_rice_bowl` | 卷心菜豆腐盖饭 | chinese_home | rice_bowl | beginner | 20 | `rice`, `cabbage`, `tofu` |
| 139 | `broccoli_tofu_rice_bowl` | 西兰花豆腐饭 | chinese_home | rice_bowl | beginner | 22 | `rice`, `broccoli`, `tofu` |
| 140 | `spinach_egg_rice_bowl` | 菠菜鸡蛋饭 | chinese_home | rice_bowl | beginner | 15 | `rice`, `spinach`, `egg` |
| 141 | `mushroom_beef_rice_bowl` | 蘑菇牛肉盖饭 | chinese_home | rice_bowl | normal | 25 | `rice`, `beef_slice`, `mushroom` |
| 142 | `onion_pork_rice_bowl` | 洋葱猪肉盖饭 | chinese_home | rice_bowl | normal | 22 | `rice`, `pork_slice`, `onion` |
| 143 | `scallion_egg_udon` | 葱花鸡蛋乌冬 | chinese_home | noodle | beginner | 14 | `udon_noodles`, `egg`, `scallion` |
| 144 | `green_bean_chicken` | 四季豆鸡胸肉 | chinese_home | stir_fry | normal | 24 | `green_beans`, `chicken_breast`, `garlic` |
| 145 | `green_bean_beef` | 四季豆牛肉片 | chinese_home | stir_fry | normal | 24 | `green_beans`, `beef_slice`, `garlic` |
| 146 | `cauliflower_egg_stir_fry` | 花椰菜炒蛋 | chinese_home | stir_fry | beginner | 18 | `cauliflower`, `egg` |
| 147 | `corn_egg_pancake` | 玉米鸡蛋饼 | chinese_home | breakfast | beginner | 15 | `corn`, `egg`, `flour` |
| 148 | `scallion_flour_pancake` | 简易葱花饼 | chinese_home | breakfast | normal | 25 | `flour`, `scallion` |
| 149 | `cabbage_egg_pancake` | 卷心菜鸡蛋饼 | chinese_home | breakfast | beginner | 18 | `cabbage`, `egg`, `flour` |
| 150 | `potato_egg_pancake` | 土豆鸡蛋饼 | chinese_home | breakfast | normal | 22 | `potato`, `egg`, `flour` |
| 151 | `sweet_potato_oat_pancake` | 红薯燕麦饼 | western_simple | breakfast | beginner | 20 | `sweet_potato`, `oats`, `egg` |
| 152 | `steamed_egg_custard` | 家常蒸蛋 | cantonese | soup_stew | beginner | 18 | `egg` |
| 153 | `microwave_tofu_egg` | 微波豆腐蒸蛋 | chinese_home | microwave | beginner | 10 | `tofu`, `egg` |
| 154 | `rice_cooker_tomato_rice` | 电饭煲番茄饭 | chinese_home | rice_cooker | beginner | 35 | `rice`, `tomato`, `frozen_mixed_vegetables` |
| 155 | `rice_cooker_mushroom_chicken` | 电饭煲蘑菇鸡肉饭 | chinese_home | rice_cooker | normal | 40 | `rice`, `chicken_thigh`, `mushroom` |
| 156 | `rice_cooker_corn_egg_rice` | 电饭煲玉米鸡蛋饭 | chinese_home | rice_cooker | beginner | 35 | `rice`, `corn`, `egg` |
| 157 | `bok_choy_noodle_soup` | 小白菜汤面 | chinese_home | noodle | beginner | 15 | `noodles`, `bok_choy` |
| 158 | `miso_tofu_noodles` | 味噌豆腐面 | western_simple | noodle | beginner | 18 | `noodles`, `tofu`, `miso` |
| 159 | `gochujang_tofu_rice_bowl` | 辣酱豆腐饭 | western_simple | rice_bowl | beginner | 18 | `rice`, `tofu`, `gochujang` |
| 160 | `curry_egg_fried_rice` | 咖喱鸡蛋炒饭 | western_simple | fried_rice | beginner | 16 | `rice`, `egg`, `curry_blocks` |
| 161 | `air_fryer_chicken_potato` | 空气炸锅鸡肉土豆 | western_simple | air_fryer | normal | 28 | `chicken_thigh`, `potato` |
| 162 | `air_fryer_tofu_broccoli` | 空气炸锅豆腐西兰花 | western_simple | air_fryer | beginner | 22 | `tofu`, `broccoli` |
| 163 | `air_fryer_sweet_potato_egg` | 空气炸锅红薯鸡蛋盘 | western_simple | air_fryer | beginner | 25 | `sweet_potato`, `egg` |
| 164 | `tuna_potato_salad` | 金枪鱼土豆沙拉 | western_simple | salad_light | beginner | 20 | `canned_tuna`, `potato`, `cucumber` |
| 165 | `cold_tofu_cucumber_salad` | 黄瓜拌豆腐 | chinese_home | salad_light | beginner | 8 | `tofu`, `cucumber` |
| 166 | `tomato_cucumber_salad` | 番茄黄瓜沙拉 | chinese_home | salad_light | beginner | 6 | `tomato`, `cucumber` |
| 167 | `avocado_egg_salad_toast` | 牛油果鸡蛋沙拉吐司 | western_simple | sandwich_wrap | beginner | 12 | `bread`, `avocado`, `egg` |
| 168 | `chickpea_spinach_stew` | 鹰嘴豆菠菜炖菜 | western_simple | soup_stew | beginner | 22 | `canned_chickpeas`, `spinach`, `canned_tomato` |
| 169 | `black_bean_tomato_rice` | 黑豆番茄饭 | western_simple | rice_bowl | beginner | 20 | `rice`, `canned_black_beans`, `tomato` |
| 170 | `kidney_bean_corn_rice_bowl` | 红腰豆玉米饭碗 | western_simple | rice_bowl | beginner | 18 | `rice`, `canned_kidney_beans`, `canned_corn` |
| 171 | `canned_mushroom_pasta` | 罐头蘑菇意面 | western_simple | pasta | beginner | 18 | `pasta`, `canned_mushroom`, `pasta_sauce` |
| 172 | `spinach_garlic_pasta` | 蒜香菠菜意面 | western_simple | pasta | beginner | 18 | `pasta`, `spinach`, `garlic` |
| 173 | `eggplant_tomato_pasta` | 茄子番茄意面 | western_simple | pasta | normal | 25 | `pasta`, `eggplant`, `canned_tomato` |
| 174 | `zucchini_tomato_pasta` | 西葫芦番茄意面 | western_simple | pasta | beginner | 22 | `pasta`, `zucchini`, `tomato` |
| 175 | `tuna_spinach_pasta` | 金枪鱼菠菜意面 | western_simple | pasta | beginner | 20 | `pasta`, `canned_tuna`, `spinach` |
| 176 | `chicken_tomato_pasta` | 鸡肉番茄意面 | western_simple | pasta | normal | 28 | `pasta`, `chicken_breast`, `canned_tomato` |
| 177 | `salmon_rice_bowl` | 三文鱼饭碗 | western_simple | rice_bowl | normal | 22 | `rice`, `salmon`, `cucumber` |
| 178 | `shrimp_avocado_wrap` | 虾仁牛油果卷饼 | western_simple | sandwich_wrap | beginner | 18 | `tortilla`, `shrimp`, `avocado` |
| 179 | `tofu_lettuce_wrap` | 豆腐生菜卷 | western_simple | sandwich_wrap | beginner | 15 | `tortilla`, `tofu`, `lettuce` |
| 180 | `egg_lettuce_toast` | 鸡蛋生菜吐司 | western_simple | sandwich_wrap | beginner | 10 | `bread`, `egg`, `lettuce` |
| 181 | `banana_apple_oat_bowl` | 香蕉苹果燕麦碗 | western_simple | microwave | beginner | 8 | `oats`, `banana`, `apple` |
| 182 | `peanut_raisin_oats` | 花生酱葡萄干燕麦 | western_simple | microwave | beginner | 7 | `oats`, `peanut_butter`, `raisins` |
| 183 | `orange_chicken_salad` | 橙香鸡胸沙拉 | western_simple | salad_light | normal | 20 | `chicken_breast`, `orange`, `lettuce` |
| 184 | `grape_chicken_salad` | 葡萄鸡胸沙拉 | western_simple | salad_light | normal | 20 | `chicken_breast`, `grapes`, `lettuce` |
| 185 | `pear_tuna_salad` | 梨子金枪鱼沙拉 | western_simple | salad_light | beginner | 10 | `canned_tuna`, `pear`, `lettuce` |
| 186 | `pineapple_chicken_rice` | 菠萝鸡肉饭 | western_simple | rice_bowl | normal | 25 | `rice`, `chicken_breast`, `canned_pineapple` |
| 187 | `cabbage_sausage_rice` | 卷心菜香肠饭 | western_simple | rice_bowl | beginner | 20 | `rice`, `sausage`, `cabbage` |
| 188 | `bacon_egg_fried_rice` | 培根鸡蛋炒饭 | western_simple | fried_rice | beginner | 15 | `rice`, `bacon`, `egg` |
| 189 | `chicken_wings_potato_pan` | 鸡翅土豆锅 | chinese_home | stir_fry | normal | 35 | `chicken_wings`, `potato` |
| 190 | `rice_cooker_drumstick_soy_chicken` | 电饭煲酱油鸡腿饭 | chinese_home | rice_cooker | normal | 45 | `rice`, `chicken_drumstick`, `ginger` |
| 191 | `pork_chop_onion_pan` | 洋葱猪排饭 | western_simple | rice_bowl | normal | 30 | `rice`, `pork_chop`, `onion` |
| 192 | `turkey_breast_cucumber_wrap` | 火鸡胸黄瓜卷饼 | western_simple | sandwich_wrap | beginner | 15 | `tortilla`, `turkey_breast`, `cucumber` |
| 193 | `scallop_corn_egg_stir_fry` | 扇贝玉米滑蛋 | cantonese | stir_fry | normal | 18 | `scallops`, `corn`, `egg` |
| 194 | `imitation_crab_cucumber_egg_bowl` | 蟹肉棒黄瓜鸡蛋饭 | cantonese | rice_bowl | beginner | 15 | `rice`, `imitation_crab`, `cucumber`, `egg` |
| 195 | `cod_broccoli_rice_bowl` | 鳕鱼西兰花饭 | western_simple | rice_bowl | normal | 25 | `rice`, `cod`, `broccoli` |
| 196 | `frozen_corn_egg_soup` | 冷冻玉米蛋花汤 | chinese_home | soup_stew | beginner | 12 | `frozen_corn`, `egg` |
| 197 | `frozen_mixed_vegetable_tofu` | 冷冻杂蔬炒豆腐 | chinese_home | stir_fry | beginner | 15 | `frozen_mixed_vegetables`, `tofu` |
| 198 | `frozen_pea_chicken_fried_rice` | 冷冻豌豆鸡肉炒饭 | chinese_home | fried_rice | beginner | 18 | `rice`, `frozen_peas`, `chicken_breast` |
| 199 | `canned_mushroom_tofu_rice` | 罐头蘑菇豆腐饭 | chinese_home | rice_bowl | beginner | 18 | `rice`, `canned_mushroom`, `tofu` |
| 200 | `lemon_garlic_white_fish` | 柠檬蒜香白鱼 | western_simple | stir_fry | normal | 20 | `white_fish`, `lemon`, `garlic` |
