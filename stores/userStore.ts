// stores/userStore.ts
// 职责：全局状态管理，使用 Zustand
// 管理：用户档案、厨房档案、当前食材清单

import { create } from 'zustand'
import type { UserProfile, KitchenProfile, Ingredient } from '../types'

interface UserState {
  userProfile: UserProfile | null
  kitchenProfile: KitchenProfile | null
  currentIngredients: Ingredient[]
  isOnboarded: boolean

  setUserProfile: (profile: UserProfile) => void
  setKitchenProfile: (profile: KitchenProfile) => void
  setIngredients: (ingredients: Ingredient[]) => void
  setOnboarded: (value: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userProfile: null,
  kitchenProfile: null,
  currentIngredients: [],
  isOnboarded: false,

  setUserProfile: (profile) => set({ userProfile: profile }),
  setKitchenProfile: (profile) => set({ kitchenProfile: profile }),
  setIngredients: (ingredients) => set({ currentIngredients: ingredients }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  reset: () => set({
    userProfile: null,
    kitchenProfile: null,
    currentIngredients: [],
    isOnboarded: false,
  }),
}))
