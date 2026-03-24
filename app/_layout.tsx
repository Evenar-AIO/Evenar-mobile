import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Righteous_400Regular } from '@expo-google-fonts/righteous';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppStoreProvider, useAuthStore } from '@/store/store';
import { ToastProvider } from '@/context/ToastContext';

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
        <Stack.Screen name="events/[id]" options={{ title: 'Event' }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ title: 'Cart' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="support/index" options={{ title: 'Support' }} />
        <Stack.Screen name="support/new" options={{ title: 'New Ticket' }} />
        <Stack.Screen name="chat/index" options={{ title: 'Messages' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
        <Stack.Screen name="owner" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Righteous_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <ToastProvider>
          <RootNavigation />
        </ToastProvider>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
