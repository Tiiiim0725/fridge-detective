-- Tomato Egg Stir Fry tutorial seed v0.1
-- Requires 009_cooking_tutorial_core.sql and recipe_seed_v0.2.sql.

insert into public.cooking_action_assets (
  action_key,
  zh_name,
  en_name,
  asset_type,
  asset_url,
  fallback_icon,
  short_hint,
  sort_order
)
values
  ('prep_ingredients', '准备食材', 'Prep Ingredients', 'placeholder', null, '🧺', '先把本步骤需要的食材和工具放在手边。', 10),
  ('wash', '清洗', 'Wash', 'placeholder', null, '💧', '用流动水轻柔清洗食材。', 20),
  ('cut_chunks', '切块', 'Cut Chunks', 'placeholder', null, '🔪', '切成大小接近的块，受热会更均匀。', 30),
  ('slice', '切片', 'Slice', 'placeholder', null, '🥒', '保持厚薄大致一致。', 40),
  ('dice', '切丁', 'Dice', 'placeholder', null, '◻️', '先切条，再切成均匀小丁。', 50),
  ('beat_eggs', '打散鸡蛋', 'Beat Eggs', 'placeholder', null, '🥚', '沿同一方向搅打到蛋清蛋黄混合。', 60),
  ('mix', '混合', 'Mix', 'placeholder', null, '🥣', '从底部翻拌，让材料均匀混合。', 70),
  ('heat_pan', '热锅', 'Heat Pan', 'placeholder', null, '♨️', '先把锅加热，再进行下一步。', 80),
  ('add_oil', '加油', 'Add Oil', 'placeholder', null, '🫗', '沿锅边加入少量油并转动锅面。', 90),
  ('stir_fry', '翻炒', 'Stir Fry', 'placeholder', null, '🍳', '保持食材移动，避免局部过热。', 100),
  ('simmer', '小火炖煮', 'Simmer', 'placeholder', null, '🫕', '保持轻微冒泡，不要大火沸腾。', 110),
  ('season_and_plate', '调味装盘', 'Season and Plate', 'placeholder', null, '🍽️', '先少量调味，尝味后再补充。', 120)
on conflict (action_key) do update
set
  zh_name = excluded.zh_name,
  en_name = excluded.en_name,
  asset_type = excluded.asset_type,
  asset_url = excluded.asset_url,
  fallback_icon = excluded.fallback_icon,
  short_hint = excluded.short_hint,
  sort_order = excluded.sort_order;

insert into public.recipe_tutorial_steps (
  recipe_id,
  step_number,
  title,
  body,
  action_key,
  ingredient_keys,
  equipment_keys,
  estimated_minutes,
  timer_seconds,
  assistant_context
)
select
  recipe.id,
  tutorial.step_number,
  tutorial.title,
  tutorial.body,
  tutorial.action_key,
  tutorial.ingredient_keys,
  tutorial.equipment_keys,
  tutorial.estimated_minutes,
  tutorial.timer_seconds,
  tutorial.assistant_context
from public.recipes as recipe
cross join (values
  (1, '准备食材', '准备 3 个鸡蛋、2 个番茄、食用油、盐和少量糖。把炒锅、碗、刀、砧板和锅铲放在手边。', 'prep_ingredients', array['egg', 'tomato', 'cooking_oil', 'salt', 'sugar']::text[], array['mixing_bowl', 'knife', 'cutting_board', 'frying_pan_or_wok', 'spatula']::text[], 2, null::integer, '确认用户已经备齐材料；缺少糖可以不放，缺少锅铲可用木勺。'),
  (2, '鸡蛋打散', '鸡蛋磕入碗中，加一小撮盐，沿同一方向搅打到蛋清和蛋黄完全混合。', 'beat_eggs', array['egg', 'salt']::text[], array['mixing_bowl', 'chopsticks_or_fork']::text[], 2, 45, '蛋液应颜色均匀、没有明显透明蛋清；无需打发出大量泡沫。'),
  (3, '番茄切块', '番茄洗净后去蒂，切成大小接近的滚刀块或小块，流出的汁也保留。', 'cut_chunks', array['tomato']::text[], array['knife', 'cutting_board']::text[], 3, null::integer, '提醒用户注意刀具安全；番茄块约 2-3 厘米即可，不要求形状完全一致。'),
  (4, '热锅倒油并炒鸡蛋', '中火热锅后倒油，蛋液入锅。边缘凝固时用锅铲轻推成大块，刚熟就盛出。', 'stir_fry', array['egg', 'cooking_oil']::text[], array['frying_pan_or_wok', 'spatula', 'plate']::text[], 3, 90, '鸡蛋保持嫩滑，不要炒到干硬；蛋液入锅后应有轻微滋滋声但不能迅速焦黄。'),
  (5, '加入番茄翻炒出汁', '原锅加入番茄，中火翻炒。番茄变软、锅底出现汁水后，把鸡蛋倒回锅中。', 'stir_fry', array['tomato', 'egg']::text[], array['frying_pan_or_wok', 'spatula']::text[], 5, 180, '番茄不出汁时可加一小勺水并盖盖 30 秒；避免过度加水变成汤。'),
  (6, '调味并装盘', '加入盐和少量糖，快速翻匀。尝味后关火装盘，保留番茄汁包裹鸡蛋。', 'season_and_plate', array['salt', 'sugar', 'tomato', 'egg']::text[], array['spatula', 'plate']::text[], 2, null::integer, '先少量加盐和糖；糖用于平衡酸味，不应让成品明显发甜。')
) as tutorial(
  step_number,
  title,
  body,
  action_key,
  ingredient_keys,
  equipment_keys,
  estimated_minutes,
  timer_seconds,
  assistant_context
)
where recipe.recipe_key = 'tomato_egg_stir_fry'
on conflict (recipe_id, step_number) do update
set
  title = excluded.title,
  body = excluded.body,
  action_key = excluded.action_key,
  ingredient_keys = excluded.ingredient_keys,
  equipment_keys = excluded.equipment_keys,
  estimated_minutes = excluded.estimated_minutes,
  timer_seconds = excluded.timer_seconds,
  assistant_context = excluded.assistant_context;
