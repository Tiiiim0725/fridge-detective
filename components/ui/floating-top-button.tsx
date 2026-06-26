import { Ionicons } from '@expo/vector-icons'
import { type Href, useRouter } from 'expo-router'
import type { ComponentProps, ReactNode } from 'react'
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native'

import { UI_TOP_BUTTON_SIZE } from '@/components/ui/design-tokens'

type IoniconName = ComponentProps<typeof Ionicons>['name']

export const FLOATING_TOP_BUTTON_SIZE = UI_TOP_BUTTON_SIZE

type FloatingTopButtonProps = {
  accessibilityLabel: string
  disabled?: boolean
  iconName?: IoniconName
  iconColor?: string
  onPress?: () => void
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  variant?: 'surface' | 'profile'
}

export function FloatingTopButton({
  accessibilityLabel,
  disabled = false,
  iconColor,
  iconName,
  onPress,
  children,
  style,
  variant = 'surface',
}: FloatingTopButtonProps) {
  const resolvedIconColor = iconColor ?? (variant === 'profile' ? '#fffaf5' : '#2f2923')

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'profile' && styles.profileButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {children ?? (
        <Ionicons name={iconName ?? 'ellipse-outline'} size={22} color={resolvedIconColor} />
      )}
    </Pressable>
  )
}

export function FloatingProfileButton({ style }: { style?: StyleProp<ViewStyle> }) {
  const router = useRouter()

  return (
    <FloatingTopButton
      accessibilityLabel="打开我的厨房档案"
      onPress={() => router.push('/me' as Href)}
      style={style}
      variant="profile"
    >
      <Ionicons name="person" size={20} color="#fffaf5" />
    </FloatingTopButton>
  )
}

export function FloatingInitialButton({
  initial,
  style,
}: {
  initial: string
  style?: StyleProp<ViewStyle>
}) {
  return (
    <FloatingTopButton accessibilityLabel="当前用户头像" disabled style={style} variant="profile">
      <Text style={styles.initial}>{initial}</Text>
    </FloatingTopButton>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#fffaf5',
    borderColor: '#eadbc9',
    borderRadius: FLOATING_TOP_BUTTON_SIZE / 2,
    borderWidth: 1,
    height: FLOATING_TOP_BUTTON_SIZE,
    justifyContent: 'center',
    shadowColor: '#4f3c2d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    width: FLOATING_TOP_BUTTON_SIZE,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  profileButton: {
    backgroundColor: '#163f34',
    borderColor: '#fffaf5',
    borderWidth: 2,
    shadowColor: '#163f34',
    shadowOpacity: 0.22,
  },
  initial: {
    color: '#fffaf5',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
})
