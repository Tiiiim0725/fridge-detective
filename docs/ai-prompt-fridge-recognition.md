# Fridge Recognition Prompt v0.2

## 使用场景

每次只识别一张冰箱照片。该识别结果只作为草稿，后续由应用写入 `fridge_scan_items`，不能直接进入 `fridge_items`。用户确认后，才允许进入正式冰箱库存。

系统已知以下上下文：

- `scanId`
- `photoId`
- `zoneKey`
- `guidePrompt`

模型不要输出这些字段。模型也不要输出 `scan_id`、`photo_id`、`zone_key` 或任何 bbox / coordinates / regions。

## 识别规则

- 只识别清楚可见的食材。
- 不猜测不透明包装袋、盒子、遮挡容器里的内容。
- 不判断过期、安全或健康风险。
- 不推荐菜谱。
- 不输出 bbox、coordinates、regions。
- 不输出 markdown。
- 不输出解释文字。
- 只输出 JSON。
- 不确定时设置 `needs_review: true`。
- 照片质量差时通过 `photo_assessment` 建议重拍。

## 数量规则

`quantity_kind = "unknown"`：

- `quantity_text = null`
- `quantity_count = null`

`quantity_kind = "text"`：

- `quantity_text` 为自然语言短语，例如 `"one bag"`、`"half bottle"`、`"small amount"`
- `quantity_count = null`

`quantity_kind = "count"`：

- `quantity_count` 为数字
- `quantity_text = null`

## JSON 输出示例

```json
{
  "photo_assessment": {
    "quality": "good",
    "needs_retake": false,
    "retake_reason": null,
    "suggested_action": "continue"
  },
  "items": [
    {
      "raw_name": "egg",
      "display_name": "鸡蛋",
      "quantity_kind": "count",
      "quantity_text": null,
      "quantity_count": 6,
      "confidence": 0.92,
      "needs_review": false,
      "uncertainty_reason": null
    }
  ]
}
```

## Edge Function 配置

Supabase Edge Function 名称：

```text
recognize-fridge
```

需要配置 Supabase secrets：

```text
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

不要将 OpenRouter key 暴露为 `EXPO_PUBLIC_` 前端环境变量。

## 手动测试说明

部署 Edge Function 后，可用 Supabase CLI 或 Dashboard 调用 `recognize-fridge`，请求 body 至少包含：

```json
{
  "zoneKey": "fridge_top",
  "guidePrompt": "请从冰箱冷藏室顶部开始，对准食材拍摄",
  "imageUrl": "https://example.com/fridge-photo.jpg"
}
```

也可以用 `imageDataUrl` 代替 `imageUrl`。本函数只返回识别草稿结果，不写数据库。

### 图片 URL 格式兼容性

如果 OpenRouter 返回 image format、image fetch、unsupported image 等图片相关错误，优先把测试图片换成公网可直接访问的普通 `.jpg` 或 `.png` 直链。

有些图片 URL 虽然路径后缀像 `.JPG`，但 CDN 参数可能实际返回 AVIF、WebP 或其他转换格式，例如带有 `f_avif` 的图片代理 URL。某些视觉模型可能无法接受这类实际格式。

本阶段不做 Storage 上传，也不做本地图片转 base64。第一阶段建议使用公网可直接访问的 jpg/png 图片 URL 测试。
