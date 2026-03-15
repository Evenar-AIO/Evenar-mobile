import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppStoreProvider, useAuthStore } from '@/store/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const { state, hydrateSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const spinnerColor = useThemeColor({}, 'tint');

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (state.isHydrating) return;

    const inAuthGroup = segments[0] === '(auth)';
    const authScreen = typeof segments[1] === 'string' ? segments[1] : '';
    const isChangePasswordScreen = authScreen === 'change-password';

    if (!state.isAuthenticated && isChangePasswordScreen) {
      router.replace('/login');
      return;
    }

    if (!state.isAuthenticated && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    if (state.isAuthenticated && inAuthGroup && !isChangePasswordScreen) {
      router.replace('/(tabs)');
    }
  }, [router, segments, state.isAuthenticated, state.isHydrating]);

  if (state.isHydrating) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppStoreProvider>
      <RootNavigation />
    </AppStoreProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
