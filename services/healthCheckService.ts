// services/healthCheckService.ts
// 职责：封装 Supabase health_check 表的查询，页面层不得直接调用 supabase.from

import { supabase } from '@/lib/supabase'

export async function getHealthCheckMessage(): Promise<string> {
  const { data, error } = await supabase
    .from('health_check')
    .select('message')
    .limit(1)
    .single()

  if (error) {
    throw error
  }

  return data.message
}
