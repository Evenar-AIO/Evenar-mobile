import { Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ThemedText } from '@/components/themed-text';

export default function AdminTabsLayout() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { logoutAction } = useAuthActions();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        headerShown: false,
        headerTitleStyle: {
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 18,
          color: palette.text,
        },
        headerRight: () => (
          <Pressable 
            onPress={logoutAction}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.7 : 1,
              marginRight: 16,
            })}
          >
            <ThemedText type="caption" style={{ color: palette.danger }}>Đăng xuất</ThemedText>
            <Ionicons name="log-out-outline" size={18} color={palette.danger} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Quản lý sự kiện',
          tabBarLabel: 'Sự kiện',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Người dùng',
          tabBarLabel: 'User',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Hỗ trợ',
          tabBarLabel: 'Hỗ trợ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
