import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/store/authStore";
import { NotificationProvider } from "@/store/notificationStore";
import { DevSwitchUserButton } from "@/components/DevSwitchUserButton";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/dev-login");
    }
  }, [user, isLoading]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/dev-login"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="chat/new" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="feedback/[eventId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="feedback/create"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="support/create"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
      <DevSwitchUserButton />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootNavigator />
      </NotificationProvider>
    </AuthProvider>
  );
}
