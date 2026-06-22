import { Platform } from 'react-native'

export const COOKING_CONTROL_SIZE = 52
export const COOKING_RADIUS = COOKING_CONTROL_SIZE / 2

export const COOKING_SHADOW = Platform.select({
  web: {
    boxShadow: '0 6px 18px rgba(44, 41, 39, 0.10)',
  },
  default: {
    shadowColor: '#2c2927',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
}) ?? {}

export const COOKING_COLORS = {
  pageBackground: '#faf9f7',
  surface: '#ffffff',
  actionSurface: '#f3f0ec',
  accent: '#c76532',
  accentPressed: '#aa5027',
  secondary: '#37684f',
  text: '#2c2927',
  mutedText: '#756e68',
  border: '#e6e1dc',
  errorBackground: '#f7e3de',
  errorText: '#a43d31',
} as const
