import { Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ThemedText } from '@/components/themed-text';

export default function AdminLayout() {
  const { logoutAction } = useAuthActions();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0b0a14' },
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Admin Dashboard',
          headerRight: () => (
            <Pressable 
              onPress={logoutAction}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                opacity: pressed ? 0.7 : 1,
                marginRight: 8,
              })}
            >
              <ThemedText type="caption" style={{ color: '#FF6B6B' }}>Đăng xuất</ThemedText>
              <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
            </Pressable>
          )
        }} 
      />
      <Stack.Screen name="users" options={{ title: 'Users' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
      <Stack.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Stack.Screen name="refunds" options={{ title: 'Refunds' }} />
      <Stack.Screen name="support" options={{ title: 'Support' }} />
      <Stack.Screen name="audit-logs" options={{ title: 'Audit Logs' }} />
      <Stack.Screen name="reports" options={{ title: 'Reports' }} />
      <Stack.Screen name="organizer-requests" options={{ title: 'Organizer Requests' }} />
    </Stack>
  );
}
