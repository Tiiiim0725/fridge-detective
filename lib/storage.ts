// lib/storage.ts
// 职责：本地存储工具，明确区分两类存储
// - SecureStore：加密存储，用于健康隐私数据（糖尿病史、体重等）
// - AsyncStorage：普通存储，用于非敏感数据（口味偏好、厨房设备等）

import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ── 加密存储：健康敏感数据 ──────────────────────────────
export async function saveSecure(key: string, value: string) {
  await SecureStore.setItemAsync(key, value)
}

export async function getSecure(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key)
}

export async function deleteSecure(key: string) {
  await SecureStore.deleteItemAsync(key)
}

// ── 普通存储：非敏感数据 ────────────────────────────────
export async function save(key: string, value: string) {
  await AsyncStorage.setItem(key, value)
}

export async function get(key: string): Promise<string | null> {
  return await AsyncStorage.getItem(key)
}

export async function remove(key: string) {
  await AsyncStorage.removeItem(key)
}
