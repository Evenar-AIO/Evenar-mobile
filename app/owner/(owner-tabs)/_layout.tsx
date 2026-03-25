import { Pressable, Platform, View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';

export default function OwnerTabsLayout() {
  const insets = useSafeAreaInsets();
  const { logoutAction } = useAuthActions();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          letterSpacing: -0.1,
          marginTop: -4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0F172A',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontFamily: 'Poppins_700Bold',
          fontSize: 18,
          color: '#F8FAFC',
        },
        headerRight: () => (
          <Pressable 
            onPress={() => {
              if (Platform.OS === 'web') {
                if (window.confirm('Đăng xuất?')) logoutAction();
              } else {
                logoutAction();
              }
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              marginRight: 16,
              padding: 8,
            })}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Phân tích',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          headerShown: false,
          title: 'Tin nhắn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Yêu cầu',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'send' : 'send-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
