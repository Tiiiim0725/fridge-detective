-- Recipe / Ingredient Foundation v0.1 seed data
-- Seven diverse test recipes for schema, service, recommendation candidate, and tutorial validation.

insert into public.ingredients (
  ingredient_key,
  zh_name,
  en_name,
  category_key,
  aliases,
  default_unit_key,
  is_fresh,
  is_pantry_item,
  is_active,
  sort_order
)
values
  ('tomato', '番茄', 'Tomato', 'vegetable', array['西红柿', '番茄', 'tomato', 'tomatoes']::text[], 'piece', true, false, true, 10),
  ('egg', '鸡蛋', 'Egg', 'protein', array['鸡蛋', 'egg', 'eggs']::text[], 'piece', true, false, true, 20),
  ('green_onion', '小葱', 'Green Onion', 'vegetable', array['小葱', '葱花', '青葱', 'scallion', 'spring onion']::text[], 'piece', true, false, true, 30),
  ('cooking_oil', '食用油', 'Cooking Oil', 'pantry', array['食用油', '植物油', 'cooking oil', 'vegetable oil']::text[], 'tbsp', false, true, true, 40),
  ('salt', '盐', 'Salt', 'seasoning', array['盐', '食盐', 'salt']::text[], 'pinch', false, true, true, 50),
  ('sugar', '糖', 'Sugar', 'sweetener', array['糖', '白糖', 'sugar']::text[], 'tsp', false, true, true, 60),
  ('broccoli', '西兰花', 'Broccoli', 'vegetable', array['西兰花', 'broccoli']::text[], 'gram', true, false, true, 70),
  ('garlic', '大蒜', 'Garlic', 'vegetable', array['大蒜', '蒜', 'garlic']::text[], 'piece', true, false, true, 80),
  ('oyster_sauce', '蚝油', 'Oyster Sauce', 'sauce', array['蚝油', 'oyster sauce']::text[], 'tbsp', false, true, true, 90),
  ('soy_sauce', '酱油', 'Soy Sauce', 'sauce', array['酱油', '生抽', 'soy sauce']::text[], 'tbsp', false, true, true, 100),
  ('chicken_thigh', '鸡腿肉', 'Chicken Thigh', 'protein', array['鸡腿肉', '去骨鸡腿肉', 'chicken thigh']::text[], 'gram', true, false, true, 110),
  ('cooked_rice', '熟米饭', 'Cooked Rice', 'grain', array['米饭', '剩米饭', '熟米饭', 'cooked rice', 'leftover rice']::text[], 'cup', true, false, true, 120),
  ('mirin', '味醂', 'Mirin', 'sauce', array['味醂', 'mirin']::text[], 'tbsp', false, true, true, 130),
  ('sesame_seed', '芝麻', 'Sesame Seed', 'seasoning', array['芝麻', '白芝麻', 'sesame seed']::text[], 'tsp', false, true, true, 140),
  ('salmon_fillet', '三文鱼柳', 'Salmon Fillet', 'seafood', array['三文鱼', '三文鱼柳', 'salmon', 'salmon fillet']::text[], 'gram', true, false, true, 150),
  ('lemon', '柠檬', 'Lemon', 'fruit', array['柠檬', 'lemon']::text[], 'piece', true, false, true, 160),
  ('butter', '黄油', 'Butter', 'dairy', array['黄油', 'butter']::text[], 'tbsp', false, true, true, 170),
  ('black_pepper', '黑胡椒', 'Black Pepper', 'seasoning', array['黑胡椒', 'black pepper']::text[], 'pinch', false, true, true, 180),
  ('asparagus', '芦笋', 'Asparagus', 'vegetable', array['芦笋', 'asparagus']::text[], 'gram', true, false, true, 190),
  ('kimchi', '泡菜', 'Kimchi', 'vegetable', array['泡菜', '韩式泡菜', 'kimchi']::text[], 'gram', true, false, true, 200),
  ('sesame_oil', '香油', 'Sesame Oil', 'pantry', array['香油', '芝麻油', 'sesame oil']::text[], 'tsp', false, true, true, 210),
  ('gochujang', '韩式辣酱', 'Gochujang', 'sauce', array['韩式辣酱', 'gochujang']::text[], 'tbsp', false, true, true, 220),
  ('noodles', '面条', 'Noodles', 'grain', array['面条', 'noodles']::text[], 'serving', false, true, true, 230),
  ('bell_pepper', '彩椒', 'Bell Pepper', 'vegetable', array['彩椒', '甜椒', 'bell pepper']::text[], 'piece', true, false, true, 240),
  ('carrot', '胡萝卜', 'Carrot', 'vegetable', array['胡萝卜', 'carrot']::text[], 'piece', true, false, true, 250),
  ('cabbage', '卷心菜', 'Cabbage', 'vegetable', array['卷心菜', '包菜', 'cabbage']::text[], 'gram', true, false, true, 260),
  ('banana', '香蕉', 'Banana', 'fruit', array['香蕉', 'banana']::text[], 'piece', true, false, true, 270),
  ('rolled_oats', '燕麦片', 'Rolled Oats', 'grain', array['燕麦片', '燕麦', 'rolled oats', 'oats']::text[], 'cup', false, true, true, 280),
  ('milk', '牛奶', 'Milk', 'dairy', array['牛奶', 'milk']::text[], 'ml', true, false, true, 290),
  ('baking_powder', '泡打粉', 'Baking Powder', 'pantry', array['泡打粉', 'baking powder']::text[], 'tsp', false, true, true, 300),
  ('honey', '蜂蜜', 'Honey', 'sweetener', array['蜂蜜', 'honey']::text[], 'tbsp', false, true, true, 310),
  ('green_bean', '四季豆', 'Green Bean', 'vegetable', array['四季豆', 'green bean', 'green beans']::text[], 'gram', true, false, true, 320),
  ('cod_fillet', '鳕鱼柳', 'Cod Fillet', 'seafood', array['鳕鱼', '鳕鱼柳', 'cod', 'cod fillet']::text[], 'gram', true, false, true, 330),
  ('spaghetti', '意大利面', 'Spaghetti', 'grain', array['意大利面', 'spaghetti']::text[], 'serving', false, true, true, 340),
  ('soy_milk', '豆奶', 'Soy Milk', 'dairy', array['豆奶', '豆浆', 'soy milk']::text[], 'ml', true, false, true, 350)
on conflict (ingredient_key) do update set
  zh_name = excluded.zh_name,
  en_name = excluded.en_name,
  category_key = excluded.category_key,
  aliases = excluded.aliases,
  default_unit_key = excluded.default_unit_key,
  is_fresh = excluded.is_fresh,
  is_pantry_item = excluded.is_pantry_item,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.recipes (
  recipe_key,
  zh_name,
  en_name,
  description,
  cuisine_key,
  difficulty_key,
  total_time_minutes,
  prep_time_minutes,
  cook_time_minutes,
  serving_count,
  estimated_cost_level,
  meal_style_keys,
  flavor_profile_keys,
  scene_keys,
  is_active,
  sort_order
)
values
  ('tomato_egg_stir_fry', '番茄炒蛋', 'Tomato Egg Stir Fry', '酸甜开胃的快手家常菜，用番茄和鸡蛋就能完成。', 'chinese', 'easy', 15, 5, 10, 1, 'low', array['quick_easy', 'budget']::text[], array['savory', 'slightly_sweet', 'tangy']::text[], array['lunch', 'dinner', 'student_budget']::text[], true, 10),
  ('garlic_broccoli', '蒜蓉西兰花', 'Garlic Broccoli', '清爽低成本的蔬菜菜，适合作为主食或肉菜旁边的快手配菜。', 'chinese', 'easy', 12, 5, 7, 1, 'low', array['quick_easy', 'healthy_light', 'budget']::text[], array['garlicky', 'light', 'savory']::text[], array['lunch', 'dinner', 'student_budget']::text[], true, 20),
  ('teriyaki_chicken_rice_bowl', '照烧鸡肉饭', 'Teriyaki Chicken Rice Bowl', '鸡腿肉和米饭组成的一碗饭，适合想吃肉又不想复杂做饭的时候。', 'japanese', 'medium', 25, 10, 15, 1, 'medium', array['high_protein', 'comfort_food', 'meal_prep']::text[], array['savory', 'slightly_sweet', 'umami']::text[], array['lunch', 'dinner']::text[], true, 30),
  ('pan_seared_salmon', '香煎三文鱼', 'Pan Seared Salmon', '高蛋白鱼类测试菜，搭配柠檬和黑胡椒，步骤少但风格不同。', 'western', 'medium', 18, 6, 12, 1, 'high', array['high_protein', 'healthy_light', 'quick_easy']::text[], array['savory', 'fresh', 'light']::text[], array['dinner']::text[], true, 40),
  ('kimchi_fried_rice', '韩式泡菜炒饭', 'Kimchi Fried Rice', '适合处理剩米饭的韩式快手饭，味道明确，也方便测试调味和主食匹配。', 'korean', 'easy', 18, 6, 12, 1, 'low', array['quick_easy', 'budget', 'comfort_food']::text[], array['spicy', 'savory', 'umami']::text[], array['lunch', 'dinner', 'leftover']::text[], true, 50),
  ('simple_vegetable_chow_mein', '简单炒面', 'Simple Vegetable Chow Mein', '用面条和彩椒、胡萝卜、卷心菜做的快手主食，适合测试可替代食材。', 'chinese', 'easy', 20, 8, 12, 1, 'low', array['quick_easy', 'budget', 'low_cleanup']::text[], array['savory', 'umami']::text[], array['lunch', 'dinner', 'student_budget']::text[], true, 60),
  ('banana_oat_pancake', '香蕉燕麦煎饼', 'Banana Oat Pancake', '偏甜的早餐/轻甜品测试菜，用香蕉、燕麦和鸡蛋做出低负担煎饼。', 'western', 'easy', 15, 5, 10, 1, 'low', array['healthy_light', 'quick_easy', 'budget']::text[], array['sweet', 'light']::text[], array['breakfast', 'dessert', 'student_budget']::text[], true, 70)
on conflict (recipe_key) do update set
  zh_name = excluded.zh_name,
  en_name = excluded.en_name,
  description = excluded.description,
  cuisine_key = excluded.cuisine_key,
  difficulty_key = excluded.difficulty_key,
  total_time_minutes = excluded.total_time_minutes,
  prep_time_minutes = excluded.prep_time_minutes,
  cook_time_minutes = excluded.cook_time_minutes,
  serving_count = excluded.serving_count,
  estimated_cost_level = excluded.estimated_cost_level,
  meal_style_keys = excluded.meal_style_keys,
  flavor_profile_keys = excluded.flavor_profile_keys,
  scene_keys = excluded.scene_keys,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.recipe_ingredients (
  recipe_id,
  ingredient_key,
  role_key,
  necessity_key,
  is_minimum_required,
  quantity_text,
  quantity_value,
  unit_key,
  sort_order,
  note
)
select
  r.id,
  v.ingredient_key,
  v.role_key,
  v.necessity_key,
  v.is_minimum_required,
  v.quantity_text,
  v.quantity_value,
  v.unit_key,
  v.sort_order,
  v.note
from public.recipes r
join (
  values
    ('tomato_egg_stir_fry', 'tomato', 'main', 'required', true, '1-2 个', 2, 'piece', 10, null),
    ('tomato_egg_stir_fry', 'egg', 'main', 'required', true, '2 个', 2, 'piece', 20, null),
    ('tomato_egg_stir_fry', 'cooking_oil', 'seasoning', 'required', true, '1 汤匙', 1, 'tbsp', 30, null),
    ('tomato_egg_stir_fry', 'salt', 'seasoning', 'required', true, '少许', null, 'pinch', 40, null),
    ('tomato_egg_stir_fry', 'sugar', 'seasoning', 'optional', false, '少许', null, 'pinch', 50, '可平衡番茄酸味'),
    ('tomato_egg_stir_fry', 'green_onion', 'garnish', 'optional', false, '少许', null, 'pinch', 60, null),

    ('garlic_broccoli', 'broccoli', 'main', 'required', true, '250 克', 250, 'gram', 10, null),
    ('garlic_broccoli', 'garlic', 'seasoning', 'required', false, '2 瓣', 2, 'piece', 20, null),
    ('garlic_broccoli', 'cooking_oil', 'seasoning', 'required', true, '1 汤匙', 1, 'tbsp', 30, null),
    ('garlic_broccoli', 'salt', 'seasoning', 'required', false, '少许', null, 'pinch', 40, null),
    ('garlic_broccoli', 'oyster_sauce', 'seasoning', 'recommended', false, '1 茶匙', 1, 'tsp', 50, '没有也可以清炒'),

    ('teriyaki_chicken_rice_bowl', 'chicken_thigh', 'main', 'required', true, '200 克', 200, 'gram', 10, null),
    ('teriyaki_chicken_rice_bowl', 'cooked_rice', 'main', 'required', true, '1 碗', 1, 'serving', 20, null),
    ('teriyaki_chicken_rice_bowl', 'soy_sauce', 'seasoning', 'required', false, '1 汤匙', 1, 'tbsp', 30, null),
    ('teriyaki_chicken_rice_bowl', 'sugar', 'seasoning', 'recommended', false, '1 茶匙', 1, 'tsp', 40, null),
    ('teriyaki_chicken_rice_bowl', 'mirin', 'seasoning', 'recommended', false, '1 汤匙', 1, 'tbsp', 50, '没有味醂可用少许糖补甜味'),
    ('teriyaki_chicken_rice_bowl', 'sesame_seed', 'garnish', 'optional', false, '少许', null, 'pinch', 60, null),

    ('pan_seared_salmon', 'salmon_fillet', 'main', 'required', true, '1 块', 1, 'piece', 10, null),
    ('pan_seared_salmon', 'lemon', 'side', 'recommended', false, '1/4 个', null, 'piece', 20, null),
    ('pan_seared_salmon', 'butter', 'seasoning', 'recommended', false, '1 小块', 1, 'tbsp', 30, null),
    ('pan_seared_salmon', 'black_pepper', 'seasoning', 'recommended', false, '少许', null, 'pinch', 40, null),
    ('pan_seared_salmon', 'salt', 'seasoning', 'required', false, '少许', null, 'pinch', 50, null),
    ('pan_seared_salmon', 'asparagus', 'side', 'optional', false, '一小把', null, 'serving', 60, null),

    ('kimchi_fried_rice', 'kimchi', 'main', 'required', true, '100 克', 100, 'gram', 10, null),
    ('kimchi_fried_rice', 'cooked_rice', 'main', 'required', true, '1 碗', 1, 'serving', 20, null),
    ('kimchi_fried_rice', 'egg', 'side', 'recommended', false, '1 个', 1, 'piece', 30, null),
    ('kimchi_fried_rice', 'cooking_oil', 'seasoning', 'required', true, '1 汤匙', 1, 'tbsp', 40, null),
    ('kimchi_fried_rice', 'sesame_oil', 'seasoning', 'recommended', false, '1 茶匙', 1, 'tsp', 50, null),
    ('kimchi_fried_rice', 'gochujang', 'seasoning', 'optional', false, '1 茶匙', 1, 'tsp', 60, '喜欢更辣时加入'),
    ('kimchi_fried_rice', 'green_onion', 'garnish', 'optional', false, '少许', null, 'pinch', 70, null),

    ('simple_vegetable_chow_mein', 'noodles', 'main', 'required', true, '1 份', 1, 'serving', 10, null),
    ('simple_vegetable_chow_mein', 'bell_pepper', 'side', 'recommended', false, '1/2 个', null, 'piece', 20, null),
    ('simple_vegetable_chow_mein', 'carrot', 'side', 'recommended', false, '1/2 根', null, 'piece', 30, null),
    ('simple_vegetable_chow_mein', 'cabbage', 'side', 'recommended', false, '一小把', null, 'serving', 40, null),
    ('simple_vegetable_chow_mein', 'soy_sauce', 'seasoning', 'required', false, '1 汤匙', 1, 'tbsp', 50, null),
    ('simple_vegetable_chow_mein', 'cooking_oil', 'seasoning', 'required', true, '1 汤匙', 1, 'tbsp', 60, null),

    ('banana_oat_pancake', 'banana', 'main', 'required', true, '1 根', 1, 'piece', 10, null),
    ('banana_oat_pancake', 'rolled_oats', 'main', 'required', true, '1/2 杯', 0.5, 'cup', 20, null),
    ('banana_oat_pancake', 'egg', 'main', 'required', true, '1 个', 1, 'piece', 30, null),
    ('banana_oat_pancake', 'milk', 'side', 'recommended', false, '2 汤匙', 2, 'tbsp', 40, null),
    ('banana_oat_pancake', 'baking_powder', 'seasoning', 'optional', false, '少许', null, 'pinch', 50, '让口感更蓬松'),
    ('banana_oat_pancake', 'honey', 'garnish', 'optional', false, '少许', null, 'tbsp', 60, null),
    ('banana_oat_pancake', 'cooking_oil', 'seasoning', 'required', true, '少许', null, 'tsp', 70, '防粘用')
) as v(recipe_key, ingredient_key, role_key, necessity_key, is_minimum_required, quantity_text, quantity_value, unit_key, sort_order, note)
  on r.recipe_key = v.recipe_key
on conflict (recipe_id, ingredient_key) do update set
  role_key = excluded.role_key,
  necessity_key = excluded.necessity_key,
  is_minimum_required = excluded.is_minimum_required,
  quantity_text = excluded.quantity_text,
  quantity_value = excluded.quantity_value,
  unit_key = excluded.unit_key,
  sort_order = excluded.sort_order,
  note = excluded.note;

insert into public.recipe_tools (
  recipe_id,
  equipment_key,
  necessity_key,
  sort_order,
  note
)
select
  r.id,
  v.equipment_key,
  v.necessity_key,
  v.sort_order,
  v.note
from public.recipes r
join (
  values
    ('tomato_egg_stir_fry', 'pan', 'required', 10, null),
    ('tomato_egg_stir_fry', 'spatula', 'recommended', 20, null),
    ('tomato_egg_stir_fry', 'knife', 'required', 30, null),
    ('tomato_egg_stir_fry', 'cutting_board', 'recommended', 40, null),

    ('garlic_broccoli', 'pan', 'required', 10, null),
    ('garlic_broccoli', 'knife', 'required', 20, null),
    ('garlic_broccoli', 'cutting_board', 'recommended', 30, null),
    ('garlic_broccoli', 'spatula', 'recommended', 40, null),

    ('teriyaki_chicken_rice_bowl', 'pan', 'required', 10, null),
    ('teriyaki_chicken_rice_bowl', 'rice_cooker', 'recommended', 20, '如果米饭已煮好则不需要'),
    ('teriyaki_chicken_rice_bowl', 'knife', 'required', 30, null),
    ('teriyaki_chicken_rice_bowl', 'cutting_board', 'required', 40, null),

    ('pan_seared_salmon', 'pan', 'required', 10, null),
    ('pan_seared_salmon', 'spatula', 'recommended', 20, null),
    ('pan_seared_salmon', 'knife', 'optional', 30, null),

    ('kimchi_fried_rice', 'pan', 'required', 10, null),
    ('kimchi_fried_rice', 'spatula', 'recommended', 20, null),
    ('kimchi_fried_rice', 'knife', 'optional', 30, null),

    ('simple_vegetable_chow_mein', 'pan', 'required', 10, null),
    ('simple_vegetable_chow_mein', 'pot', 'recommended', 20, '需要先煮面时使用'),
    ('simple_vegetable_chow_mein', 'knife', 'required', 30, null),
    ('simple_vegetable_chow_mein', 'cutting_board', 'required', 40, null),
    ('simple_vegetable_chow_mein', 'spatula', 'recommended', 50, null),

    ('banana_oat_pancake', 'pan', 'required', 10, null),
    ('banana_oat_pancake', 'mixing_bowl', 'required', 20, null),
    ('banana_oat_pancake', 'spatula', 'recommended', 30, null),
    ('banana_oat_pancake', 'blender', 'optional', 40, '想要更细腻口感时使用')
) as v(recipe_key, equipment_key, necessity_key, sort_order, note)
  on r.recipe_key = v.recipe_key
on conflict (recipe_id, equipment_key) do update set
  necessity_key = excluded.necessity_key,
  sort_order = excluded.sort_order,
  note = excluded.note;

insert into public.recipe_substitutions (
  recipe_id,
  ingredient_key,
  substitute_ingredient_key,
  quality_impact,
  note
)
select
  r.id,
  v.ingredient_key,
  v.substitute_ingredient_key,
  v.quality_impact,
  v.note
from public.recipes r
join (
  values
    ('garlic_broccoli', 'broccoli', 'green_bean', 0.75, '会变成蒜蓉四季豆，推荐排序应低于原菜'),
    ('pan_seared_salmon', 'salmon_fillet', 'cod_fillet', 0.78, '可替代为鳕鱼柳，煎制时间略短'),
    ('simple_vegetable_chow_mein', 'noodles', 'spaghetti', 0.72, '可用意大利面代替，口感不同'),
    ('banana_oat_pancake', 'milk', 'soy_milk', 0.85, '可用豆奶替代牛奶')
) as v(recipe_key, ingredient_key, substitute_ingredient_key, quality_impact, note)
  on r.recipe_key = v.recipe_key
on conflict (recipe_id, ingredient_key, substitute_ingredient_key) do update set
  quality_impact = excluded.quality_impact,
  note = excluded.note;

insert into public.recipe_steps (
  recipe_id,
  step_number,
  title,
  body,
  estimated_minutes,
  timer_seconds,
  ingredient_keys,
  equipment_keys,
  tips
)
select
  r.id,
  v.step_number,
  v.title,
  v.body,
  v.estimated_minutes,
  v.timer_seconds,
  v.ingredient_keys,
  v.equipment_keys,
  v.tips
from public.recipes r
join (
  values
    ('tomato_egg_stir_fry', 1, '处理食材', '番茄切块，鸡蛋打散。', 3, null, array['tomato', 'egg']::text[], array['knife', 'cutting_board', 'mixing_bowl']::text[], '蛋液里加一小勺水会更嫩。'),
    ('tomato_egg_stir_fry', 2, '先炒鸡蛋', '锅热后放油，倒入蛋液，炒到刚凝固就盛出。', 4, null, array['egg', 'cooking_oil']::text[], array['pan', 'spatula']::text[], '不要炒太老。'),
    ('tomato_egg_stir_fry', 3, '炒番茄出汁', '同一口锅放番茄和少许盐，炒到番茄变软出汁。', 5, null, array['tomato', 'salt']::text[], array['pan', 'spatula']::text[], null),
    ('tomato_egg_stir_fry', 4, '合并调味', '鸡蛋倒回锅里，加盐和少许糖，翻炒均匀后出锅。', 3, null, array['egg', 'sugar', 'green_onion']::text[], array['pan', 'spatula']::text[], '葱花最后撒。'),

    ('garlic_broccoli', 1, '处理西兰花', '西兰花切小朵，大蒜切末。', 4, null, array['broccoli', 'garlic']::text[], array['knife', 'cutting_board']::text[], null),
    ('garlic_broccoli', 2, '焯或快炒', '锅中加少量油，先下蒜末，再放西兰花翻炒。', 5, null, array['cooking_oil', 'garlic', 'broccoli']::text[], array['pan', 'spatula']::text[], '想更软可以先焯 1 分钟。'),
    ('garlic_broccoli', 3, '调味出锅', '加入盐和少许蚝油，翻炒均匀后出锅。', 3, null, array['salt', 'oyster_sauce']::text[], array['pan', 'spatula']::text[], null),

    ('teriyaki_chicken_rice_bowl', 1, '切鸡肉', '鸡腿肉切小块，用酱油、糖和味醂拌匀。', 8, null, array['chicken_thigh', 'soy_sauce', 'sugar', 'mirin']::text[], array['knife', 'cutting_board', 'mixing_bowl']::text[], null),
    ('teriyaki_chicken_rice_bowl', 2, '煎鸡肉', '锅热后下鸡肉，煎到两面上色并熟透。', 10, null, array['chicken_thigh']::text[], array['pan', 'spatula']::text[], '中火更容易控制。'),
    ('teriyaki_chicken_rice_bowl', 3, '收汁盖饭', '倒入剩余酱汁收浓，盖在米饭上，撒芝麻。', 7, null, array['cooked_rice', 'sesame_seed']::text[], array['pan']::text[], null),

    ('pan_seared_salmon', 1, '调味', '三文鱼擦干，两面撒盐和黑胡椒。', 4, null, array['salmon_fillet', 'salt', 'black_pepper']::text[], array[]::text[], '擦干表面更容易煎出焦香。'),
    ('pan_seared_salmon', 2, '下锅煎', '锅热后放少许油或黄油，鱼皮面先下锅煎。', 8, null, array['salmon_fillet', 'butter']::text[], array['pan', 'spatula']::text[], null),
    ('pan_seared_salmon', 3, '翻面完成', '翻面再煎至中心刚熟，出锅后挤柠檬汁。', 6, null, array['lemon']::text[], array['pan', 'spatula']::text[], '不要频繁翻动。'),

    ('kimchi_fried_rice', 1, '准备材料', '泡菜切小块，米饭打散，鸡蛋备用。', 5, null, array['kimchi', 'cooked_rice', 'egg']::text[], array['knife', 'cutting_board']::text[], '剩米饭更适合炒饭。'),
    ('kimchi_fried_rice', 2, '炒泡菜和米饭', '锅中放油，先炒泡菜，再加入米饭炒散。', 8, null, array['kimchi', 'cooked_rice', 'cooking_oil']::text[], array['pan', 'spatula']::text[], null),
    ('kimchi_fried_rice', 3, '调味加蛋', '加入香油和可选辣酱，另煎或拌入鸡蛋，撒葱花。', 5, null, array['sesame_oil', 'gochujang', 'egg', 'green_onion']::text[], array['pan', 'spatula']::text[], null),

    ('simple_vegetable_chow_mein', 1, '处理蔬菜', '彩椒、胡萝卜和卷心菜切丝。', 6, null, array['bell_pepper', 'carrot', 'cabbage']::text[], array['knife', 'cutting_board']::text[], null),
    ('simple_vegetable_chow_mein', 2, '处理面条', '面条煮到刚熟，捞出沥干。', 5, null, array['noodles']::text[], array['pot']::text[], '如果是熟面可跳过。'),
    ('simple_vegetable_chow_mein', 3, '炒面', '锅中放油，先炒蔬菜，再加入面条和酱油翻炒。', 9, null, array['cooking_oil', 'soy_sauce', 'noodles']::text[], array['pan', 'spatula']::text[], '火不要太小，避免面条出水。'),

    ('banana_oat_pancake', 1, '压香蕉', '香蕉压成泥，和鸡蛋、燕麦、牛奶混合。', 5, null, array['banana', 'egg', 'rolled_oats', 'milk']::text[], array['mixing_bowl']::text[], '想更细腻可以用搅拌机。'),
    ('banana_oat_pancake', 2, '小火煎', '平底锅刷少许油，倒入面糊，小火煎到边缘定型。', 6, null, array['cooking_oil']::text[], array['pan']::text[], '小火能避免外焦内生。'),
    ('banana_oat_pancake', 3, '翻面装盘', '翻面再煎 2-3 分钟，出锅后可淋少许蜂蜜。', 4, null, array['honey']::text[], array['pan', 'spatula']::text[], null)
) as v(recipe_key, step_number, title, body, estimated_minutes, timer_seconds, ingredient_keys, equipment_keys, tips)
  on r.recipe_key = v.recipe_key
on conflict (recipe_id, step_number) do update set
  title = excluded.title,
  body = excluded.body,
  estimated_minutes = excluded.estimated_minutes,
  timer_seconds = excluded.timer_seconds,
  ingredient_keys = excluded.ingredient_keys,
  equipment_keys = excluded.equipment_keys,
  tips = excluded.tips;
