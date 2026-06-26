import { type Href, Tabs, useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { HapticTab } from '@/components/haptic-tab'
import { UI_PAGE_SIDE_PADDING } from '@/components/ui/design-tokens'
import { IconSymbol } from '@/components/ui/icon-symbol'

type TabSymbolName = Parameters<typeof IconSymbol>[0]['name']

const NAV_ACTIVE_COLOR = '#dc8442'

function NavIcon({
  focused,
  name,
  size = 28,
}: {
  focused: boolean
  name: TabSymbolName
  size?: number
}) {
  if (!focused) {
    return <IconSymbol color="#453f3a" name={name} size={size} />
  }

  return (
    <View style={styles.activeIconShell}>
      <IconSymbol color="#111714" name={name} size={size + 1} />
    </View>
  )
}

function CameraActionIcon() {
  return (
    <View style={styles.centerCameraButton}>
      <IconSymbol size={30} name="camera.fill" color="#111714" />
    </View>
  )
}

export default function TabLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fffaf5',
          borderTopColor: '#ece3da',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 12,
          paddingHorizontal: UI_PAGE_SIDE_PADDING,
          paddingTop: 10,
          shadowColor: '#6c5542',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
        },
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: '拍冰箱',
          tabBarIcon: ({ focused }) => (
            <NavIcon focused={focused} name="refrigerator.fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '推荐',
          tabBarIcon: ({ focused }) => (
            <NavIcon focused={focused} name="house.fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: '拍照',
          tabBarIcon: () => <CameraActionIcon />,
          tabBarItemStyle: styles.centerCameraItem,
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault()
            router.push(`/scan?capture=${Date.now()}` as Href)
          },
        }}
      />
      <Tabs.Screen
        name="tutorial"
        options={{
          title: '教程',
          tabBarIcon: ({ focused }) => (
            <NavIcon focused={focused} name="book.fill" />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: '冰箱',
          tabBarIcon: ({ focused }) => (
            <NavIcon focused={focused} name="snowflake" />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  activeIconShell: {
    alignItems: 'center',
    backgroundColor: NAV_ACTIVE_COLOR,
    borderRadius: 31,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
  },
  centerCameraButton: {
    alignItems: 'center',
    backgroundColor: NAV_ACTIVE_COLOR,
    borderColor: '#fffaf5',
    borderRadius: 36,
    borderWidth: 5,
    height: 72,
    justifyContent: 'center',
    marginTop: -24,
    shadowColor: '#163f34',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    width: 72,
  },
  centerCameraItem: {
    alignItems: 'center',
    flex: 1.28,
    justifyContent: 'center',
    minWidth: 84,
  },
})
