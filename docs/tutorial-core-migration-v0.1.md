# Cooking Tutorial Core v0.1 迁移记录

## 迁移目标

本轮将 `cooking-tutorial-lab` 中已经验证的番茄炒蛋精细教程迁入冰箱侦探主项目，优先完成真实使用闭环：

```txt
真实菜谱详情
→ 开始跟做
→ 六步精细教程
→ 创建或恢复当前用户的 cooking session
→ 保存步骤进度
→ 完成教程
```

实验项目仍是教程体验的目标原型。主项目本轮没有重新设计教程，而是在不复制错误数据结构、不降低生产安全性的前提下迁移核心成果。

## 已迁移成果

- 番茄炒蛋六步精细教程原文。
- 每步 `actionKey`、食材 key、厨具 key、预计时间、计时建议和 `assistantContext`。
- 12 个可复用 cooking action 定义。
- `placeholder / image / gif / lottie / svg / video` 动作资产边界。
- 暖白背景、统一按钮模数、大圆角、柔和阴影、大动作视觉区和步骤进度条。
- 上一步、下一步、完成教程。
- 创建、恢复、暂停、推进和完成 cooking session。
- 数据库不可用时的番茄炒蛋六步本地预览，不静默伪装为已保存。
- 菜谱详情根据教程数据是否存在决定是否开放“开始跟做”，不在页面硬编码 recipe key。

## 接口与字段适配

### 菜谱来源

Lab 使用独立的 `tutorial_recipes`。主项目已有 `public.recipes` 和 200 道正式菜谱，因此没有迁移 `tutorial_recipes`。

主项目新增的 `recipe_tutorial_steps.recipe_id` 直接引用 `public.recipes(id)`。教程名称、总时长、封面和 recipe key 继续由正式 recipes 表提供。

### 步骤表

Lab：

```txt
tutorial_steps.recipe_key → tutorial_recipes.recipe_key
```

主项目：

```txt
recipe_tutorial_steps.recipe_id → recipes.id
```

`action_key` 在主项目中增加了到 `cooking_action_assets(action_key)` 的外键。`assistant_context` 完整保留，为后续步骤上下文 AI 恢复接口。

主项目已有的 `recipe_steps` 仍保存 200 道菜的三步概括，不与六步教程互相覆盖：

- `recipe_steps`：详情页概括步骤。
- `recipe_tutorial_steps`：逐步跟做体验。

### Session

Lab session 没有用户归属，且 RLS 对 anon/authenticated 全开放。主项目适配为：

- 增加 `user_id references auth.users(id)`。
- 只 grant 给 `authenticated`。
- select / insert / update 全部限制 `auth.uid() = user_id`。
- 同一用户、同一道菜只允许一个 active/paused session。
- 重新进入教程时恢复最近进度；离开时暂停；完成时写入 `completed_at`。

### 时间类型

Lab TypeScript domain 使用 ISO string。主项目现有 Recipe/Profile domain 更常使用 `Date`，因此 Tutorial Core mapper 将数据库时间转换为 `Date`。

### 难度与总时长

Lab 的番茄炒蛋副本为 `easy / 20 分钟 / 2 人份`；主项目正式 recipe 为 `beginner / 15 分钟 / 1 人份`。

Tutorial Core 不再保存第二份难度和份数，页面以主项目正式 recipe 为准。六个精细步骤的预计时间总和仍是实验版本的 17 分钟；这是内容差异，不会阻塞教程，后续内容校准时统一。

## 本轮有意暂缓的实验能力

这些能力不是被否定或删除，而是为了先完成首次使用闭环而暂缓迁入：

- `AskAiPanel` 的文字问 AI。
- 图片 URL 问 AI。
- 拍照/选图上传到 `cooking-question-photos`。
- signed URL 图片问 AI。
- `cooking_ai_questions` 问答记录。
- Web 模拟语音输入。
- iOS Apple Speech、VAD、TTS。
- Picovoice foreground wake word。
- Lab Edge Function `ask-cooking-helper`。

恢复这些能力时应继续沿用 Lab 的三路入口和当前步骤上下文，不要重新发明第二套交互。恢复前必须：

1. 给 AI question 表增加 `user_id` 并使用 owner-scoped RLS。
2. 给 Storage 路径和 policy 增加用户隔离。
3. 将 Edge Function 部署到主项目并重新配置 secrets，不能复制 Lab secret。
4. 不把 OpenRouter key 放进前端。
5. 原生语音依赖必须在 Development Build 真机验证后再进入主项目 package。

## 动作视觉后续路线

本轮保留了动作资产的稳定接口，但仍使用 emoji placeholder。替换真实素材时：

- `image / gif / svg` 可直接通过 `asset_url` 展示。
- `lottie / video` 已保留类型和 UI 分支，仍需安装并接入对应播放器。
- `TutorialStepCard` 不应因素材类型变化而重写。
- 同一个 `stir_fry` 动作应复用于多道菜，不按菜谱复制动画。

## 数据库执行顺序

2026-06-20 检查主项目 migration history 时发现：

```txt
001-007: Local / Remote 对齐
008: Local 有，Remote history 无
009: 新增，尚未应用
```

与此同时真实数据库已经能读取 200 道 v0.2 菜谱，说明 `008` 的效果或等价结构很可能曾通过 SQL Editor 手动落地，但 migration history 没有登记。正式 push 前必须运行 dry-run，并确认待应用列表只能是 `008`、`009`。`008` 使用 `add column if not exists` 及约束重建，按当前 200 道数据契约应可重复落地，但仍须以 dry-run 输出为准。

当前 Codex 环境执行 dry-run 时缺少 Supabase CLI access token，因此没有代替用户执行正式 push。

```txt
1. supabase db push --dry-run
2. 确认只包含 008_recipe_content_v0_2_alignment.sql 与 009_cooking_tutorial_core.sql
3. 用户明确确认后执行 supabase db push
4. 在 SQL Editor 单独执行 supabase/seeds/tutorial_seed_v0.1.sql
```

Migration 只创建 Tutorial Core 新表，不修改既有 recipes、recipe_steps 或用户数据。Seed 使用 upsert，可重复执行。

## 验证 SQL

```sql
select r.recipe_key, count(*) as tutorial_step_count
from public.recipe_tutorial_steps ts
join public.recipes r on r.id = ts.recipe_id
group by r.recipe_key
order by r.recipe_key;

select action_key, asset_type, fallback_icon, sort_order
from public.cooking_action_assets
order by sort_order;

select user_id, recipe_id, current_step_number, status, started_at, completed_at
from public.cooking_sessions
order by updated_at desc
limit 10;
```
