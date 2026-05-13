# GitHub 仓库补充说明 - 2026-05-13

请结合以下真实仓库状态继续推进，不要只按抽象文档生成代码。

仓库地址：
https://github.com/Tiiiim0725/fridge-detective

当前应基于分支：
feature/supabase-connection

该分支当前包含：

- app/
- lib/
- services/
- supabase/
- types/
- .env.example
- .gitignore
- package.json
- package-lock.json
- tsconfig.json
- app.json

当前已存在并应保留的文件：

- lib/supabase.ts
- services/healthCheckService.ts
- app/dev-health-check.tsx

这些文件已经支撑 Supabase health_check 最小闭环，Step 5 不要覆盖它们。可以引用 lib/supabase.ts 中已有的 supabase client，但不要重写该文件，除非发现明显错误并先说明原因。

.env.example 当前未见真实 key，但可能是一行写法：
EXPO_PUBLIC_SUPABASE_URL= EXPO_PUBLIC_SUPABASE_ANON_KEY=

Step 5 可以顺手把它修正为两行：
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

.gitignore 当前已包含 .env、.env\*.local、node_modules、.expo、dist、ios、android 等忽略项，基本符合安全要求。仍需避免把任何真实密钥写入 Git。

重要注意：
types/index.ts 是旧设计，里面仍有 gender、weight、healthConditions、appetite、tastePreferences、KitchenProfile.equipment string[]、condiments string[] 等旧结构。它与当前决策冲突：

- MVP 不收健康病史、体重、糖尿病等敏感信息。
- 用户偏好、设备、调料必须使用标准化 snake_case key。
- User Profile Module v0.1 应新建 types/profile.ts。
- Step 5 不要依赖旧 types/index.ts。
- 暂时不要删除 types/index.ts，后续单独清理。

Step 5 的目标：
生成 Claude Code 执行指令，让 Claude Code 在当前真实仓库结构上新增以下文件：

- supabase/migrations/001_user_profile_module.sql
- types/profile.ts
- services/authService.ts
- services/profileService.ts

Step 5 指令必须强调：

1. 当前分支是 feature/supabase-connection。
2. 先检查现有目录和文件，避免覆盖已有实现。
3. 不覆盖 lib/supabase.ts。
4. 不覆盖 services/healthCheckService.ts。
5. 不覆盖 app/dev-health-check.tsx。
6. 新建 types/profile.ts，不依赖旧 types/index.ts。
7. 新建 services/authService.ts，用于 Anonymous Auth 初始化。
8. 新建 services/profileService.ts，用于 profiles、user_preferences、kitchen_equipment、pantry_items 的业务读写。
9. 新建 supabase/migrations/001_user_profile_module.sql。
10. 所有私有表启用 RLS。
11. 不设计 guest_id。
12. profiles.id = auth.users.id。
13. user_preferences unique(user_id)。
14. kitchen_equipment unique(user_id, equipment_key)。
15. pantry_items unique(user_id, pantry_item_key)。
16. profileService 保存前做 key 校验、数组去重、no_preference 互斥处理。
17. profileService 负责 snake_case 到 camelCase 转换。
18. service 层抛 Error，不处理 UI Alert。
19. equipment 和 pantry 第一版采用 delete + insert 完整替换，后续可升级为 Postgres RPC 事务函数。
20. 执行后要求用户贴出 git status、git diff 或新增文件内容进行检查。

额外后续注意：
services/claude.ts / Edge Function / prompt 文档中的命名未来需要统一，但这不是 Step 5 的任务。Step 5 只做 User Profile / Onboarding Foundation v0.1。
