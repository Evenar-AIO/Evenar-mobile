import { Stack } from 'expo-router';

export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0b0a14' },
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Owner Dashboard' }} />
      <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Stack.Screen name="buyers" options={{ title: 'Buyers' }} />
      <Stack.Screen name="requests" options={{ title: 'Organizer Requests' }} />
      <Stack.Screen name="event" options={{ headerShown: false }} />
    </Stack>
  );
}
