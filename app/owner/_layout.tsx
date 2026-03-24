import { Stack } from 'expo-router';

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18 },
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <Stack.Screen name="(owner-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="event/index" options={{ title: 'Sự kiện của tôi' }} />
      <Stack.Screen name="event/create" options={{ title: 'Tạo sự kiện' }} />
      <Stack.Screen name="event/edit/[id]" options={{ title: 'Chỉnh sửa' }} />
    </Stack>
  );
}
