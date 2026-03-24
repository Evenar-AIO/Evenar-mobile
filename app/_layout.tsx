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
import { ToastProvider, useToast } from '@/context/ToastContext';
import { useChatStore } from '@/store/chat.store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const { state, hydrateSession } = useAuthStore();
  const { connectSocket, disconnectSocket, socket } = useChatStore();
  const segments = useSegments();
  const router = useRouter();
  const spinnerColor = useThemeColor({}, 'tint');
  const { showToast } = useToast();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (state.accessToken && state.user?.id) {
      connectSocket(state.accessToken, state.user.id);
    }
    return () => disconnectSocket();
  }, [state.accessToken, state.user?.id, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (!socket) return;
    
    const onNewMsg = (msg: any) => {
      // Don't toast if sender is ME
      if (String(msg.senderId?._id || msg.senderId) === String(state.user?.id || state.user?._id)) return;
      
      // Don't toast if already in chat screen with THIS id
      const inChat = segments[0] === 'chat' && segments[1] === msg.conversationId;
      if (!inChat) {
        showToast({ 
          message: `${msg.senderId?.username || 'Bạn'}: ${msg.content || 'Gửi tin nhắn'}`, 
          type: 'info' 
        });
      }
    };
    
    socket.on('chat:message', onNewMsg);
    return () => { socket.off('chat:message', onNewMsg); };
  }, [socket, state.user?.id, segments, showToast]);

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
      if (state.user?.role === 'admin') {
        router.replace('/admin');
      } else if (state.user?.role === 'organizer' || state.user?.role === 'event_owner') {
        router.replace('/owner');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [router, segments, state.isAuthenticated, state.isHydrating, state.user?.role]);

  if (state.isHydrating) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
    );
  }

    const customDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: '#020617',
            card: '#0F172A',
            text: '#F8FAFC',
            border: 'rgba(255, 255, 255, 0.05)',
            primary: '#22C55E', // Green accent like admin
        },
    };

    return (
        <ThemeProvider value={customDarkTheme}>
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
        <Stack.Screen name="chat/index" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="owner" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
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
