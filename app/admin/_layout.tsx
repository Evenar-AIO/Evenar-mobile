import { Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const { logoutAction } = useAuthActions();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#020617' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
      }}
    >
      <Stack.Screen 
        name="(admin-tabs)" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen name="events/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="transactions" options={{ title: 'Giao dịch' }} />
      <Stack.Screen name="refunds" options={{ title: 'Hoàn tiền' }} />
      <Stack.Screen name="support" options={{ title: 'Hỗ trợ' }} />
      <Stack.Screen name="audit-logs" options={{ title: 'Nhật ký hệ thống' }} />
      <Stack.Screen name="organizer-requests" options={{ title: 'Yêu cầu mở rộng' }} />
    </Stack>
  );
}
