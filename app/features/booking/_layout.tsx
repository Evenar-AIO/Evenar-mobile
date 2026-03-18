import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerBackTitleVisible: false }}>
      <Stack.Screen name="EventDetailScreen" options={{ title: 'Event Details' }} />
      <Stack.Screen name="CartScreen" options={{ title: 'Your Cart' }} />
      <Stack.Screen name="CheckoutScreen" options={{ title: 'Checkout' }} />
      <Stack.Screen name="PaymentScreen" options={{ title: 'Payment', headerLeft: () => null }} />
      <Stack.Screen name="OrderDetailScreen" options={{ title: 'Order Details' }} />
      <Stack.Screen name="RefundRequestScreen" options={{ title: 'Refund Request' }} />
    </Stack>
  );
}
