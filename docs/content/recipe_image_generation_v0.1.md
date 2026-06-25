# Recipe Image Generation v0.1

## 目标

为 Recipe v0.2 的 200 道菜建立统一、可追踪、可批量入库的成品图。图片用于推荐卡片和菜谱详情，不直接提交大文件到 Git。

唯一任务清单：`docs/content/recipe_image_manifest_v0.1.csv`。

## 分工和命名

- Manifest 按正式 `sort_order` 奇偶交替分给主控电脑和同学电脑，各 100 道。
- 只能生成自己名下且 `status = pending` 的行。
- 文件名固定为 `{recipe_key}_v1.webp`。
- Storage 路径固定为 `recipe-images/v0.1/{recipe_key}_v1.webp`。
- 不使用中文文件名，不使用 `image001` 等脱离 recipe key 的名称。
- 每完成一张必须立即更新 Manifest 状态和 QA 备注。

## 风格试产

正式批量前只生成三道：

1. `tomato_egg_stir_fry`：中式家常炒菜，检查红黄主色和真实质感。
2. `beef_potato_carrot_stew`：炖菜，检查汤汁、块状食材和暖色层次。
3. `tomato_mushroom_pasta`：西式简餐，检查不同菜系仍能保持同一产品摄影语言。

三张参考图经双方确认后，Prompt 版本才从 `food-photo-v1-draft` 锁定为 `food-photo-v1`。未锁定前不得开始 200 张批量任务。

## Prompt v1 骨架

```text
Use case: photorealistic-natural
Asset type: mobile recipe recommendation card and recipe detail cover
Primary request: a polished but realistic finished-dish photograph of [EN_NAME] ([ZH_NAME])
Scene/backdrop: a quiet contemporary home dining surface with warm off-white and pale natural wood tones
Subject: one complete serving for one or two people; show [CORE_INGREDIENTS] clearly in their cooked form; the finished dish must match [DISH_FORM]
Style/medium: photorealistic home-cooked food photography, refined but attainable, not restaurant advertising
Composition/framing: landscape 3:2, 45-degree tabletop view, dish centered with generous safe crop margins for both recommendation cards and detail covers
Lighting/mood: soft natural window light, warm and calm, realistic shadows, appetizing true-to-life color
Materials/textures: neutral ceramic tableware, visible natural food texture, believable sauce and steam only when appropriate
Constraints: visually faithful to the recipe name and core ingredients; one clear hero dish; culturally appropriate presentation; no text; no logo; no watermark
Avoid: people, hands, packaging, ingredient labels, excessive garnish, unrelated side dishes, impossible ingredients, plastic-looking food, over-saturated colors, dark moody lighting, shallow crop that cuts off the dish
```

每道菜必须补充 `CORE_INGREDIENTS` 和 `DISH_FORM`。不能只替换菜名后盲目生成。

## 三道试产补充

### tomato_egg_stir_fry

- Core ingredients: ripe red tomato wedges and soft golden scrambled egg.
- Dish form: a glossy but not watery Chinese home-style stir-fry, irregular tender egg curds, visible tomato pieces, served on a shallow warm-white ceramic plate.
- Avoid: omelette, fried egg, rice, ketchup-heavy sauce, raw tomato salad.

### beef_potato_carrot_stew

- Core ingredients: browned beef pieces, potato chunks and carrot chunks.
- Dish form: a comforting home-style stew with a restrained savory brown broth, clearly separated ingredients, served in a simple ceramic bowl.
- Avoid: steak, curry-yellow sauce, mashed potato, excessive herbs, bread side dish.

### tomato_mushroom_pasta

- Core ingredients: pasta, tomato sauce and sliced mushrooms.
- Dish form: a simple home-cooked pasta with a light tomato coating and clearly visible mushroom slices, served on a neutral shallow bowl.
- Avoid: meatballs, cream sauce, oversized cheese garnish, restaurant plating, unrelated salad.

## QA 标准

每张图片检查：

1. 菜名与主要食材是否一致。
2. 是否出现 Manifest 之外的关键食材或错误菜系形态。
3. 主体是否完整，能同时适配卡片和详情裁切。
4. 是否存在文字、水印、包装、人物或手。
5. 色温、餐具、背景和其他通过图片是否一致。
6. 是否明显塑料感、过饱和、过暗或商业广告感。
7. 文件名和 recipe key 是否完全一致。

状态只允许：`pending`、`generated`、`approved`、`rework`、`uploaded`。

## 汇总和入库

1. 两边把批准图片交到主控电脑。
2. 主控电脑检查 200 个 key 是否一一对应、无缺失、无重复。
3. 统一转换为 WebP，建议宽度约 1200px、质量 80-85。
4. 批量上传到公开只读的 Recipe 图片 bucket/path。
5. 根据 Manifest 自动生成幂等 SQL，更新 `recipes.cover_image_url` 和 `recipes.card_image_url`。
6. 第一版两个 URL 可以指向同一张主图；后续需要时再派生不同裁切版本。

禁止在前端硬编码 200 个图片 URL，禁止逐行手动修改数据库。
