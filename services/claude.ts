// services/claude.ts
// 职责：调用 Supabase Edge Functions，由 Edge Function 负责实际调用 Claude API
// 前端永远不持有 Claude API Key

import { supabase } from '../lib/supabase'

// 调用冰箱图像识别 Edge Function
export async function scanFridgeImages(imageUrls: string[]) {
  const { data, error } = await supabase.functions.invoke('scan-fridge', {
    body: { imageUrls },
  })
  if (error) throw error
  return data
}

// 调用成品打分 Edge Function
export async function scoreDish(imageUrl: string, recipeId: string) {
  const { data, error } = await supabase.functions.invoke('score-dish', {
    body: { imageUrl, recipeId },
  })
  if (error) throw error
  return data
}
