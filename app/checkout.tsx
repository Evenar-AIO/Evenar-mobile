import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cart.store';
import { orderService } from '@/features/customer/services/order.service';
import { paymentService } from '@/features/customer/services/payment.service';
import { useToast } from '@/context/ToastContext';

export default function CheckoutScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { items, fetchCart } = useCartStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  }, [items]);

  const handlePay = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      // Backend expects: { eventId, tickets: [{ ticketInfoId, quantity }] }
      // Assuming all items in cart belong to the same event or we pick the first one's eventId
      // In a real multi-event cart, we might need a different strategy, but for now:
      const eventId = items[0].eventId;

      const order: any = await orderService.createOrder({
        eventId,
        tickets: items.map((item) => ({
          ticketInfoId: item.ticketInfoId,
          quantity: item.quantity,
        })),
        paymentMethod: 'VNPAY', // Default to VNPAY mock
      });

      const orderId = order?.id ?? order?._id ?? order?.data?._id;

      if (!orderId) throw new Error('Failed to create order');

      const payment = await paymentService.createPayment({ 
        orderId,
        method: 'VNPAY' 
      });

      await paymentService.confirmPayment({
        orderId,
      });

      showToast({ message: 'Thanh toán thành công!', type: 'success' });
      await fetchCart(); // Refresh cart to clear it
      router.replace('/(tabs)');
    } catch (err: any) {
      showToast({ message: 'Thanh toán thất bại: ' + (err.message || 'Lỗi hệ thống'), type: 'error' });
      console.error('Payment error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Checkout</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Secure payment with PayOS.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
        <ThemedText type="subtitle">Payment method</ThemedText>
        <ThemedText type="caption" tone="secondary">
          VNPAY (Mock) · Instant Confirmation
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
        <ThemedText type="subtitle">Order summary</ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText type="caption" tone="secondary">
            Total
          </ThemedText>
          <ThemedText type="bodySemiBold">{total}đ</ThemedText>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: palette.accentAlt },
          pressed && { opacity: 0.9 },
        ]}
        onPress={handlePay}
        disabled={loading || items.length === 0}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText type="bodySemiBold" tone="inverse">
            Review & Pay
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    gap: Spacing.xs,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
}
);
