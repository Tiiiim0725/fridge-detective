-- Recipe Cooking Steps v1 content QA fixes
-- Applies post-015 text-only corrections found during page/content spot checks.
-- No deletes. Updates are limited by recipe_key and step_number.

begin;

update public.recipe_steps rs
set title = '调好蛋液',
    body = '鸡蛋打散后加温水搅匀，撇掉表面大泡，蛋液细腻顺滑。',
    estimated_minutes = 4,
    timer_seconds = null,
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['mixing_bowl']::text[],
    tips = null
from public.recipes r
where rs.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and rs.step_number = 1;

update public.recipe_steps rs
set title = '入碗蒸制',
    body = '蛋液倒入耐热碗，水开后上锅中小火蒸，锅盖留一点缝。',
    estimated_minutes = 10,
    timer_seconds = null,
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    tips = null
from public.recipes r
where rs.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and rs.step_number = 2;

update public.recipe_steps rs
set title = '观察凝固',
    body = '轻晃时中心微微颤动、表面平整，就可以关火短暂焖一会儿。',
    estimated_minutes = 3,
    timer_seconds = null,
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    tips = null
from public.recipes r
where rs.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and rs.step_number = 3;

update public.recipe_steps rs
set title = '调味端出',
    body = '淋少量酱油或香油，内部细嫩成型、没有明显水层即可端出。',
    estimated_minutes = 1,
    timer_seconds = null,
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['mixing_bowl']::text[],
    tips = null
from public.recipes r
where rs.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and rs.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认蛋液边缘刚凝固、中间仍柔软，番茄炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tomato', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_egg_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，蒜香西兰花口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['broccoli', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'garlic_broccoli'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认蛋液边缘刚凝固、中间仍柔软，卷心菜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cabbage', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cabbage_egg_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，蘑菇菠菜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['mushroom', 'spinach', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'mushroom_spinach_egg'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，蘑菇烧豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tofu', 'mushroom', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tofu_mushroom_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，鸡胸西兰花快炒口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_breast', 'broccoli', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'chicken_broccoli_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认肉类表面变色，锅底水汽明显减少，姜葱鸡腿肉口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_thigh', 'ginger', 'scallion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'ginger_scallion_chicken_thigh'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认肉类表面变色，锅底水汽明显减少，洋葱牛肉片口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['beef_slice', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'beef_onion_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，番茄牛肉碎豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['ground_beef', 'tomato', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'ground_beef_tomato_tofu'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，猪肉片炒卷心菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['pork_slice', 'cabbage', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'pork_cabbage_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认虾仁由半透明转粉并自然卷起，虾仁滑蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['shrimp', 'egg', 'scallion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'shrimp_egg_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认鱼肉由透明转白，能轻轻推动但不碎，姜葱白鱼口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['white_fish', 'ginger', 'scallion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'white_fish_ginger_scallion'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，小白菜豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tofu', 'bok_choy', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tofu_bok_choy'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，肉末四季豆口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['green_beans', 'ground_pork', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'green_beans_ground_pork'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，留学生版麻婆豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tofu', 'ground_pork', 'doubanjiang']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'mapo_tofu_student'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，豆瓣茄子豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['eggplant', 'tofu', 'doubanjiang']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'spicy_eggplant_tofu'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认肉类表面变色，锅底水汽明显减少，芹菜牛肉片口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['beef_slice', 'celery', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'celery_beef_slice'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，醋香蒜炒卷心菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cabbage', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'shandong_garlic_cabbage'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，豆腐豌豆蘑菇口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tofu', 'peas', 'mushroom']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'huaiyang_tofu_pea_mushroom'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认虾仁由半透明转粉并自然卷起，虾仁豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['shrimp', 'tofu', 'peas']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'huaiyang_shrimp_tofu'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，蒜蓉菠菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['spinach', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'garlic_spinach'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，火鸡碎炒花椰菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cauliflower', 'ground_turkey', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cauliflower_ground_turkey'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认肉类表面变色，锅底水汽明显减少，鸡腿肉炒大白菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_thigh', 'napa_cabbage', 'ginger']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cabbage_chicken_thigh'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认肉类表面变色，锅底水汽明显减少，胡萝卜土豆鸡块口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_thigh', 'potato', 'carrot']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'carrot_potato_chicken'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，番茄花菜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tomato', 'cauliflower', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_cauliflower_egg'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，蘑菇鸡胸肉口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_breast', 'mushroom', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'mushroom_chicken_breast'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认虾仁由半透明转粉并自然卷起，蒜香虾仁西兰花口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['shrimp', 'broccoli', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'shrimp_broccoli_garlic'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认蛋液边缘刚凝固、中间仍柔软，黄瓜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cucumber', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cucumber_egg_light_stir'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，小白菜炒蘑菇口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['bok_choy', 'mushroom', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'bok_choy_mushroom'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，辣油卷心菜豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cabbage', 'tofu', 'chili_oil']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'spicy_cabbage_tofu'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认肉类表面变色，锅底水汽明显减少，五花肉大白菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['pork_belly', 'napa_cabbage', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'pork_belly_napa_cabbage'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，西葫芦炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['zucchini', 'egg', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'zucchini_egg_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认鱼肉由透明转白，能轻轻推动但不碎，番茄白鱼锅口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['white_fish', 'tomato', 'ginger']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_white_fish_pan'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，毛豆玉米豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['edamame', 'corn', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'edamame_corn_tofu'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余鸡胸肉、鸡蛋翻匀，鸡蛋鸡胸饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['chicken_breast', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'chicken_egg_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余牛肉碎、番茄、洋葱翻匀，番茄牛肉碎盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['ground_beef', 'tomato', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'beef_tomato_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余豆腐、西兰花、胡萝卜翻匀，豆腐蔬菜饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['tofu', 'broccoli', 'carrot']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tofu_vegetable_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认金枪鱼黄瓜饭不积水、主料分布均匀，就可以直接端出。',
    action_key = 'plate_dish',
    ingredient_keys = array['rice', 'canned_tuna', 'cucumber']::text[],
    equipment_keys = array['mixing_bowl']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tuna_cucumber_rice_bowl'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余土豆、胡萝卜、咖喱块翻匀，蔬菜咖喱饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['potato', 'carrot', 'curry_blocks']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'vegetable_curry_rice'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余猪肉末、玉米、洋葱翻匀，肉末玉米盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['ground_pork', 'corn', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'ground_pork_corn_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余豆腐、小白菜翻匀，小白菜豆腐盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['tofu', 'bok_choy']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tofu_bok_choy_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认鱼肉由透明转白，能轻轻推动但不碎，番茄鳕鱼锅口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cod', 'canned_tomato', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cod_tomato_pan'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余鸡胸肉、冷冻西兰花翻匀，冷冻西兰花鸡胸饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['chicken_breast', 'frozen_broccoli']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'frozen_broccoli_chicken_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余黑豆罐头、玉米罐头翻匀，黑豆玉米饭碗的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['canned_black_beans', 'canned_corn']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'canned_black_bean_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余豆腐、冷冻豌豆、咖喱块翻匀，豆腐冷冻豌豆咖喱饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['tofu', 'frozen_peas', 'curry_blocks']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tofu_frozen_pea_curry_rice'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认蛋液边缘刚凝固、中间仍柔软，洋葱炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['onion', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'onion_egg_stir_fry'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认蛋液边缘刚凝固、中间仍柔软，胡萝卜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['carrot', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'carrot_egg_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认蛋液边缘刚凝固、中间仍柔软，西兰花炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['broccoli', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'broccoli_egg_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，番茄卷心菜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tomato', 'cabbage', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_cabbage_egg'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认蔬菜颜色变亮，边缘开始变软但仍有支撑感，蒜香花椰菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cauliflower', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'garlic_cauliflower'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认蛋液边缘刚凝固、中间仍柔软，蘑菇炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['mushroom', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'mushroom_egg_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，葱香煎豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['tofu', 'scallion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'pan_fried_scallion_tofu'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余豆腐、葱花翻匀，酱油豆腐盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['tofu', 'scallion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'soy_sauce_tofu_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余番茄、豆腐翻匀，番茄豆腐盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['tomato', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_tofu_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余猪肉末、豆腐翻匀，肉末豆腐盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['ground_pork', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'ground_pork_tofu_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，牛肉碎炒土豆丁口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['ground_beef', 'potato', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'ground_beef_potato_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认肉类表面变色，锅底水汽明显减少，洋葱鸡腿肉口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_thigh', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'chicken_thigh_onion_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认肉类表面变色，锅底水汽明显减少，番茄鸡胸肉口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_breast', 'tomato']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_chicken_breast'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认肉类表面变色，锅底水汽明显减少，黄瓜鸡胸肉口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_breast', 'cucumber']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cucumber_chicken_breast'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，彩椒猪肉片口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['pork_slice', 'bell_pepper', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'bell_pepper_pork_slice'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认肉类表面变色，锅底水汽明显减少，彩椒牛肉片口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['beef_slice', 'bell_pepper']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'bell_pepper_beef_slice'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认虾仁由半透明转粉并自然卷起，黄瓜虾仁口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['shrimp', 'cucumber']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'shrimp_cucumber_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认虾仁由半透明转粉并自然卷起，虾仁炒卷心菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['shrimp', 'cabbage', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'shrimp_cabbage_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认鱼肉由透明转白，能轻轻推动但不碎，番茄豆腐白鱼口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['white_fish', 'tomato', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'white_fish_tomato_tofu_pan'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认罐头食材热透或拌匀，不需要久炒，金枪鱼炒卷心菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['canned_tuna', 'cabbage']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'canned_tuna_cabbage_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认肉类表面变色，锅底水汽明显减少，培根炒卷心菜口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['bacon', 'cabbage']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'bacon_cabbage_stir_fry'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认肉类表面变色，锅底水汽明显减少，香肠土豆锅口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['sausage', 'potato', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'sausage_potato_pan'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '出锅确认',
    body = '确认肉类表面变色，锅底水汽明显减少，火鸡碎番茄蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['ground_turkey', 'tomato', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'ground_turkey_tomato_egg'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余土豆、鸡蛋翻匀，土豆鸡蛋盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['potato', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'potato_egg_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余红薯、鸡蛋翻匀，红薯鸡蛋饭碗的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['sweet_potato', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'sweet_potato_egg_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余鸡胸肉、番茄翻匀，番茄鸡肉盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['chicken_breast', 'tomato']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'tomato_chicken_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余卷心菜、豆腐翻匀，卷心菜豆腐盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['cabbage', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cabbage_tofu_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余西兰花、豆腐翻匀，西兰花豆腐饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['broccoli', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'broccoli_tofu_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余菠菜、鸡蛋翻匀，菠菜鸡蛋饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['spinach', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'spinach_egg_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余牛肉片、蘑菇翻匀，蘑菇牛肉盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['beef_slice', 'mushroom']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'mushroom_beef_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余猪肉片、洋葱翻匀，洋葱猪肉盖饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['pork_slice', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'onion_pork_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认肉类表面变色，锅底水汽明显减少，四季豆鸡胸肉口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['green_beans', 'chicken_breast', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'green_bean_chicken'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认肉类表面变色，锅底水汽明显减少，四季豆牛肉片口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['green_beans', 'beef_slice', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'green_bean_beef'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '盛出收尾',
    body = '确认蛋液边缘刚凝固、中间仍柔软，花椰菜炒蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['cauliflower', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cauliflower_egg_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '调匀蛋液',
    body = '鸡蛋打散后加温水搅匀，表面大泡撇掉，蛋液看起来细腻顺滑。',
    action_key = 'beat_eggs',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['mixing_bowl']::text[],
    estimated_minutes = 6,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 1;

update public.recipe_tutorial_steps ts
set title = '过滤入碗',
    body = '把蛋液倒入耐热碗，表面没有明显泡沫，碗边保持干净。',
    action_key = 'prep_ingredients',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['mixing_bowl']::text[],
    estimated_minutes = 3,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 2;

update public.recipe_tutorial_steps ts
set title = '上锅蒸制',
    body = '水开后放入蒸碗，保持中小火，锅盖留一点缝防止表面起蜂窝。',
    action_key = 'steam',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 3;

update public.recipe_tutorial_steps ts
set title = '观察凝固',
    body = '轻晃蒸碗时中心微微颤动、表面平整，就可以准备关火。',
    action_key = 'check_doneness',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    estimated_minutes = 10,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '焖后开盖',
    body = '关火后短暂焖一会儿再开盖，蒸蛋表面更稳定，不容易塌陷。',
    action_key = 'rest_food',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 5;

update public.recipe_tutorial_steps ts
set title = '调味收口',
    body = '淋少量酱油或香油，表面有光泽但不被调料完全盖住，味道更柔和。',
    action_key = 'season',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    estimated_minutes = 5,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '检查质地',
    body = '用勺子轻轻划开，内部细嫩成型、没有明显水层即可端出。',
    action_key = 'check_doneness',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    estimated_minutes = 2,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 7;

update public.recipe_tutorial_steps ts
set title = '端出蒸蛋',
    body = '把蒸蛋连碗端出，边缘擦干净，表面仍平整时趁温热上桌。',
    action_key = 'plate_dish',
    ingredient_keys = array['egg']::text[],
    equipment_keys = array['pot']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'steamed_egg_custard'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余豆腐、韩式辣酱翻匀，辣酱豆腐饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['tofu', 'gochujang']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'gochujang_tofu_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余黑豆罐头、番茄翻匀，黑豆番茄饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['canned_black_beans', 'tomato']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'black_bean_tomato_rice'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余红腰豆罐头、玉米罐头翻匀，红腰豆玉米饭碗的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['canned_kidney_beans', 'canned_corn']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'kidney_bean_corn_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余三文鱼、黄瓜翻匀，三文鱼饭碗的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['salmon', 'cucumber']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'salmon_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余鸡胸肉、菠萝罐头翻匀，菠萝鸡肉饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['chicken_breast', 'canned_pineapple']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'pineapple_chicken_rice'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余香肠、卷心菜翻匀，卷心菜香肠饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['sausage', 'cabbage']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cabbage_sausage_rice'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认肉类表面变色，锅底水汽明显减少，鸡翅土豆锅口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['chicken_wings', 'potato']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'chicken_wings_potato_pan'
  and ts.step_number = 12;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余猪排、洋葱翻匀，洋葱猪排饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['pork_chop', 'onion']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'pork_chop_onion_pan'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认扇贝表面变白、中心仍显得饱满，扇贝玉米滑蛋口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['scallops', 'corn', 'egg']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'scallop_corn_egg_stir_fry'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认蟹肉棒黄瓜鸡蛋饭不积水、主料分布均匀，就可以直接端出。',
    action_key = 'plate_dish',
    ingredient_keys = array['rice', 'imitation_crab', 'cucumber', 'egg']::text[],
    equipment_keys = array['mixing_bowl']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'imitation_crab_cucumber_egg_bowl'
  and ts.step_number = 8;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余鳕鱼、西兰花翻匀，鳕鱼西兰花饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['cod', 'broccoli']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'cod_broccoli_rice_bowl'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '装盘检查',
    body = '确认豆腐边缘微黄，轻推时还能保持块状，冷冻杂蔬炒豆腐口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['frozen_mixed_vegetables', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'frozen_mixed_vegetable_tofu'
  and ts.step_number = 6;

update public.recipe_tutorial_steps ts
set title = '加入配菜',
    body = '加入剩余蘑菇罐头、豆腐翻匀，罐头蘑菇豆腐饭的浇头颜色均匀、锅底水汽减少。',
    action_key = 'stir_fry',
    ingredient_keys = array['canned_mushroom', 'tofu']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 4,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'canned_mushroom_tofu_rice'
  and ts.step_number = 4;

update public.recipe_tutorial_steps ts
set title = '整理出餐',
    body = '确认鱼肉由透明转白，能轻轻推动但不碎，柠檬蒜香白鱼口味合适后盛出，避免继续闷在锅里。',
    action_key = 'plate_dish',
    ingredient_keys = array['white_fish', 'lemon', 'garlic']::text[],
    equipment_keys = array['pan', 'spatula']::text[],
    estimated_minutes = 1,
    timer_seconds = null,
    assistant_context = ''
from public.recipes r
where ts.recipe_id = r.id
  and r.recipe_key = 'lemon_garlic_white_fish'
  and ts.step_number = 8;

commit;
