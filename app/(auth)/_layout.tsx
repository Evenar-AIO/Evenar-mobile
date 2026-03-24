import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup-role" />
      <Stack.Screen name="signup-register" />
      <Stack.Screen name="signup-verify-otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password-otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
