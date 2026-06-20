import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, type Href, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppSessionProvider, useAppSession } from '@/providers/AppSessionProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppSessionProvider>
      <RootNavigator />
    </AppSessionProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const {
    isBootstrapping,
    onboardingComplete,
    errorMessage,
    retryBootstrap,
  } = useAppSession();

  const firstSegment = String(segments[0] ?? '');
  const isDevRoute = typeof firstSegment === 'string' && firstSegment.startsWith('dev-');
  const isOnboardingRoute = firstSegment === 'onboarding';
  const shouldRedirectToOnboarding = !isBootstrapping
    && !errorMessage
    && !onboardingComplete
    && !isDevRoute
    && !isOnboardingRoute;

  useEffect(() => {
    if (shouldRedirectToOnboarding) {
      router.replace('/onboarding' as Href);
    }
  }, [router, shouldRedirectToOnboarding]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="fridge-scan" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="private-fridge" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>

        {!isDevRoute && (isBootstrapping || shouldRedirectToOnboarding) ? (
          <View style={styles.bootstrapOverlay}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>冰</Text>
            </View>
            <Text style={styles.bootstrapTitle}>冰箱侦探</Text>
            <Text style={styles.bootstrapMessage}>正在准备你的厨房档案...</Text>
            <ActivityIndicator color="#c2652a" />
          </View>
        ) : null}

        {!isDevRoute && errorMessage ? (
          <View style={styles.bootstrapOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>暂时没能进入厨房</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
              <Pressable style={styles.retryButton} onPress={() => void retryBootstrap()}>
                <Text style={styles.retryButtonText}>再试一次</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootstrapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#faf5ee',
    justifyContent: 'center',
    padding: 24,
    zIndex: 100,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    width: 56,
  },
  brandMarkText: {
    color: '#fffaf5',
    fontSize: 24,
    fontWeight: '900',
  },
  bootstrapTitle: {
    color: '#332e29',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  bootstrapMessage: {
    color: '#756b63',
    fontSize: 15,
    marginBottom: 18,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#eadfd5',
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  errorTitle: {
    color: '#332e29',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#7a433a',
    lineHeight: 21,
    marginBottom: 18,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#c2652a',
    borderRadius: 26,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
