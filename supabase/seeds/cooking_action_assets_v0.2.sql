-- Cooking action assets v0.2
-- Public reusable action dictionary for tutorial mode.
-- Requires 009_cooking_tutorial_core.sql.

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
  -- Mise en place / prep
  ('prep_ingredients', '准备食材', 'Prep Ingredients', 'placeholder', null, '🧺', '先把本步骤需要的食材和工具放在手边。', 10),
  ('gather_tools', '准备工具', 'Gather Tools', 'placeholder', null, '🍳', '先把锅、碗、刀具和盛盘摆好，做饭时不用来回找。', 20),
  ('wash', '清洗', 'Wash', 'placeholder', null, '💧', '用流动水轻轻清洗表面，洗完后尽量沥干。', 30),
  ('peel', '去皮去壳', 'Peel', 'placeholder', null, '🥕', '去掉外皮、外壳或老硬部分，保留可食用主体。', 40),
  ('trim', '修整', 'Trim', 'placeholder', null, '✂️', '去掉硬根、坏点或多余边角，让口感更整齐。', 50),
  ('drain', '沥干', 'Drain', 'placeholder', null, '🫗', '让表面少一点水，入锅时更稳定，也更容易上味。', 60),

  -- Knife work
  ('cut_chunks', '切块', 'Cut Chunks', 'placeholder', null, '🔪', '切成大小接近的块，受热会更均匀。', 100),
  ('slice', '切片', 'Slice', 'placeholder', null, '🔪', '保持厚薄大致一致，熟成速度更接近。', 110),
  ('dice', '切丁', 'Dice', 'placeholder', null, '◼️', '先切条，再切成均匀小丁。', 120),
  ('mince', '切末', 'Mince', 'placeholder', null, '🧄', '反复下刀切碎，适合蒜、姜、香草等小料。', 130),
  ('shred', '切丝', 'Shred', 'placeholder', null, '🥬', '先切片，再顺着方向切成细丝。', 140),
  ('crush', '拍散压碎', 'Crush', 'placeholder', null, '🧄', '轻压或拍散，让香味更容易释放。', 150),

  -- Mixing / cold process
  ('beat_eggs', '打散鸡蛋', 'Beat Eggs', 'placeholder', null, '🥚', '沿同一方向搅打到蛋清和蛋黄完全混合。', 200),
  ('whisk', '搅打', 'Whisk', 'placeholder', null, '🥣', '连续画小圈，让液体、蛋液或酱汁更均匀。', 210),
  ('mix', '混合', 'Mix', 'placeholder', null, '🥣', '从底部翻拌，让材料均匀混合。', 220),
  ('toss', '轻拌', 'Toss', 'placeholder', null, '🥗', '轻轻翻动，让调味包住食材，不要压碎。', 230),
  ('marinate', '腌制', 'Marinate', 'placeholder', null, '🧂', '拌匀后静置一会儿，让味道进入食材。', 240),
  ('coat', '裹匀', 'Coat', 'placeholder', null, '🥣', '让食材表面薄薄挂上一层粉、蛋液或酱汁。', 250),

  -- Heat setup / adding
  ('preheat', '预热', 'Preheat', 'placeholder', null, '♨️', '先让锅具或设备到合适温度，再放入食材。', 300),
  ('heat_pan', '热锅', 'Heat Pan', 'placeholder', null, '♨️', '先把锅加热，再继续下油或下食材。', 310),
  ('add_oil', '加油', 'Add Oil', 'placeholder', null, '🫒', '沿锅边加入少量油，并转动锅面铺开。', 320),
  ('melt', '融化', 'Melt', 'placeholder', null, '🧈', '用小火慢慢融化黄油、糖或奶酪，避免焦糊。', 330),
  ('saute_aromatics', '爆香小料', 'Saute Aromatics', 'placeholder', null, '🧄', '葱姜蒜或香料出香味后，就可以进入下一步。', 340),

  -- Active pan cooking
  ('stir_fry', '翻炒', 'Stir Fry', 'placeholder', null, '🍳', '保持食材移动，避免局部过热。', 400),
  ('sear', '煎香上色', 'Sear', 'placeholder', null, '🥩', '先别急着翻，让表面形成香气和颜色。', 410),
  ('pan_fry', '煎制', 'Pan Fry', 'placeholder', null, '🍳', '保持中小火，定型后再翻面。', 420),
  ('scramble', '轻推成块', 'Scramble', 'placeholder', null, '🥚', '边缘凝固后轻轻推动，保留柔软口感。', 430),

  -- Moist heat
  ('boil', '煮沸', 'Boil', 'placeholder', null, '🫧', '看到连续大泡后再开始计时。', 500),
  ('blanch', '焯水', 'Blanch', 'placeholder', null, '🥬', '短时间入沸水后捞出，保持颜色和口感。', 510),
  ('simmer', '小火炖煮', 'Simmer', 'placeholder', null, '🍲', '保持轻微冒泡，不要大火沸腾。', 520),
  ('steam', '蒸制', 'Steam', 'placeholder', null, '♨️', '水开上汽后再计时，尽量少开盖。', 530),
  ('braise', '焖炖', 'Braise', 'placeholder', null, '🍲', '盖盖小火慢煮，让味道慢慢进入食材。', 540),
  ('reduce_sauce', '收汁', 'Reduce Sauce', 'placeholder', null, '🥘', '让汤汁变稠，能轻轻挂住食材即可。', 550),
  ('thicken', '勾芡', 'Thicken', 'placeholder', null, '🥣', '边倒边搅，看到汤汁变亮变稠就停。', 560),

  -- Dry heat / appliances
  ('bake', '烘烤', 'Bake', 'placeholder', null, '🔥', '让热空气均匀包住食物，按时间和表面状态判断。', 600),
  ('roast', '烤制上色', 'Roast', 'placeholder', null, '🔥', '观察边缘颜色和表面状态，避免过度干硬。', 610),
  ('air_fry', '空气炸', 'Air Fry', 'placeholder', null, '🌬️', '中途翻动一次，上色会更均匀。', 620),
  ('microwave', '微波加热', 'Microwave', 'placeholder', null, '〰️', '短时间多次加热，避免一下子过头。', 630),

  -- Finish
  ('combine', '合并食材', 'Combine', 'placeholder', null, '🥘', '把前面处理好的部分重新放到一起。', 700),
  ('season', '调味', 'Season', 'placeholder', null, '🧂', '先少量加入，尝味后再补。', 710),
  ('garnish', '点缀', 'Garnish', 'placeholder', null, '🌿', '最后少量撒上，不要盖过主体。', 720),
  ('plate', '装盘', 'Plate', 'placeholder', null, '🍽️', '把主体放稳，再整理边缘和汤汁。', 730),
  ('season_and_plate', '调味装盘', 'Season and Plate', 'placeholder', null, '🍽️', '先少量调味，确认味道后再装盘。', 740),
  ('rest', '静置', 'Rest', 'placeholder', null, '⏱️', '离火后等待片刻，让温度和汁水稳定。', 750)
on conflict (action_key) do update
set
  zh_name = excluded.zh_name,
  en_name = excluded.en_name,
  asset_type = excluded.asset_type,
  asset_url = excluded.asset_url,
  fallback_icon = excluded.fallback_icon,
  short_hint = excluded.short_hint,
  sort_order = excluded.sort_order;
