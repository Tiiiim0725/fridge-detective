-- Fridge inventory guideline expansion v1
-- Backfills default storage guidance for common recognized ingredients.

with target_ingredients as (
  select
    ingredient_key,
    category_key,
    case
      when storage_type = 'freezer' then 'freezer'
      when storage_type = 'pantry' then 'pantry'
      when storage_type = 'canned' then 'pantry'
      when storage_type = 'room_temp' then 'room_temp'
      when category_key in ('protein', 'seafood', 'dairy', 'vegetable', 'fruit', 'sauce') then 'fridge'
      else 'fridge'
    end as storage_location
  from public.ingredients
  where is_active = true
    and (
      is_fridge_recognition_target = true
      or category_key in ('vegetable', 'fruit', 'protein', 'seafood', 'dairy')
    )
),
default_guidelines as (
  select
    ingredient_key,
    storage_location,
    case
      when storage_location = 'freezer' then 60
      when storage_location = 'pantry' then 30
      when storage_location = 'room_temp' and category_key = 'fruit' then 3
      when storage_location = 'room_temp' then 14
      when category_key = 'seafood' then 1
      when category_key = 'protein' then 1
      when category_key = 'dairy' then 3
      when category_key = 'fruit' then 3
      when category_key = 'vegetable' then 3
      when category_key = 'sauce' then 14
      else 3
    end as suggested_days_min,
    case
      when storage_location = 'freezer' then 180
      when storage_location = 'pantry' then 365
      when storage_location = 'room_temp' and category_key = 'fruit' then 7
      when storage_location = 'room_temp' then 30
      when category_key = 'seafood' then 2
      when category_key = 'protein' then 3
      when category_key = 'dairy' then 7
      when category_key = 'fruit' then 7
      when category_key = 'vegetable' then 7
      when category_key = 'sauce' then 60
      else 7
    end as suggested_days_max,
    case
      when storage_location = 'freezer' then '冷冻保存时间受包装、温度和开封情况影响，建议按包装日期优先安排。'
      when storage_location = 'pantry' then '常温储物建议保持密封、干燥，并参考包装日期。'
      when storage_location = 'room_temp' then '室温保存建议避光通风，并根据外观和气味安排食用。'
      when category_key in ('protein', 'seafood') then '生鲜肉类和水产建议尽快安排，长期保存优先冷冻。'
      when category_key = 'dairy' then '乳制品建议参考包装日期，开封后尽快安排。'
      when category_key in ('vegetable', 'fruit') then '果蔬保存时间受成熟度和湿度影响，建议根据外观和气味安排。'
      when category_key = 'sauce' then '开封调味品建议密封冷藏，并参考包装日期。'
      else '建议时间用于安排做饭顺序，实际处理前仍需结合外观、气味和包装日期判断。'
    end as note
  from target_ingredients
)
insert into public.ingredient_storage_guidelines (
  ingredient_key,
  storage_location,
  suggested_days_min,
  suggested_days_max,
  note
)
select
  ingredient_key,
  storage_location,
  suggested_days_min,
  suggested_days_max,
  note
from default_guidelines
on conflict (ingredient_key, storage_location) do nothing;
