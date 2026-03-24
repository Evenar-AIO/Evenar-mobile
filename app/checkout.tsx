import { useMemo, useState } from 'react';
import { 
    ActivityIndicator, 
    Pressable, 
    StyleSheet, 
    View, 
    ScrollView, 
    Platform,
    Dimensions
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cart.store';
import { orderService } from '@/features/customer/services/order.service';
import { paymentService } from '@/features/customer/services/payment.service';
import { useToast } from '@/context/ToastContext';
import { API_BASE_URL } from '@/services/apiClient';

const { width } = Dimensions.get('window');

const CHECKOUT_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E', 
  accentAlt: '#3b82f6', 
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function CheckoutScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { items, fetchCart } = useCartStore();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'PAYOS' | 'VNPAY'>('PAYOS');

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  }, [items]);

  const handlePay = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const eventId = items[0].eventId;

      // 1. Create Order
      const order: any = await orderService.createOrder({
        eventId,
        tickets: items.map((item) => ({
          ticketInfoId: item.ticketInfoId,
          quantity: item.quantity,
        })),
        paymentMethod: selectedMethod,
      });

      const orderId = order?.orderId ?? order?.id ?? order?._id ?? order?.data?._id;
      if (!orderId) throw new Error('Failed to create order');

      // 2. Create Payment
      const payment: any = await paymentService.createPayment({ 
        orderId,
        method: selectedMethod,
        // Use the dynamic BASE_URL for redirects - it will now self-update
        returnUrl: `${API_BASE_URL}/payments/confirm?orderId=${orderId}`,
        cancelUrl: `${API_BASE_URL}/payments/cancel?orderId=${orderId}`
      });

      // 3. Handle specific method logic
      if (selectedMethod === 'PAYOS' && payment?.redirectUrl) {
         // Open PayOS checkout in browser
         const result = await WebBrowser.openBrowserAsync(payment.redirectUrl);
         
         // After returning from browser, confirm status
         // In a real app, webhook handles this, but here we can check status via API
         await paymentService.confirmPayment({ orderId });
      } else {
         // Mock VNPAY or others
         await paymentService.confirmPayment({ orderId });
      }

      showToast({ message: 'Thanh toán thành công!', type: 'success' });
      await fetchCart(); // Refresh cart to clear it
      router.replace('/(tabs)');
    } catch (err: any) {
      showToast({ message: 'Lỗi: ' + (err.message || 'Thanh toán thất bại'), type: 'error' });
      console.error('Payment error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: CHECKOUT_COLORS.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Thanh toán</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Hoàn tất đơn hàng của bạn một cách an toàn</ThemedText>
        </View>

        <Animated.View entering={FadeInUp.delay(100)} style={[styles.section, { backgroundColor: CHECKOUT_COLORS.surface }]}>
            <ThemedText style={styles.sectionTitle}>Phương thức thanh toán</ThemedText>
            
            <Pressable 
                style={[
                    styles.methodCard, 
                    selectedMethod === 'PAYOS' && { borderColor: CHECKOUT_COLORS.accent, backgroundColor: CHECKOUT_COLORS.surfaceLight }
                ]}
                onPress={() => setSelectedMethod('PAYOS')}
            >
                <View style={styles.methodIconContainer}>
                    <Ionicons name="card" size={24} color={CHECKOUT_COLORS.accent} />
                </View>
                <View style={styles.methodInfo}>
                    <ThemedText style={styles.methodName}>Thanh toán qua PayOS</ThemedText>
                    <ThemedText style={styles.methodDesc}>QR Code, Thẻ nội địa & Quốc tế</ThemedText>
                </View>
                <View style={[styles.radio, selectedMethod === 'PAYOS' && { backgroundColor: CHECKOUT_COLORS.accent }]}>
                    {selectedMethod === 'PAYOS' && <Ionicons name="checkmark" size={12} color={CHECKOUT_COLORS.bg} />}
                </View>
            </Pressable>

            <Pressable 
                style={[
                    styles.methodCard, 
                    selectedMethod === 'VNPAY' && { borderColor: CHECKOUT_COLORS.accent, backgroundColor: CHECKOUT_COLORS.surfaceLight }
                ]}
                onPress={() => setSelectedMethod('VNPAY')}
            >
                <View style={[styles.methodIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="wallet" size={24} color={CHECKOUT_COLORS.accentAlt} />
                </View>
                <View style={styles.methodInfo}>
                    <ThemedText style={styles.methodName}>Ví điện tử (VNPAY Mock)</ThemedText>
                    <ThemedText style={styles.methodDesc}>Xác nhận tức thì (Dành cho Dev)</ThemedText>
                </View>
                <View style={[styles.radio, selectedMethod === 'VNPAY' && { backgroundColor: CHECKOUT_COLORS.accent }]}>
                    {selectedMethod === 'VNPAY' && <Ionicons name="checkmark" size={12} color={CHECKOUT_COLORS.bg} />}
                </View>
            </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={[styles.section, { backgroundColor: CHECKOUT_COLORS.surface }]}>
            <ThemedText style={styles.sectionTitle}>Tóm tắt đơn hàng</ThemedText>
            <View style={styles.summaryList}>
                {items.map((item, idx) => (
                    <View key={idx} style={styles.summaryItem}>
                        <ThemedText style={styles.summaryItemText}>
                            {item.quantity}x {item.name ?? 'Vé'}
                        </ThemedText>
                        <ThemedText style={styles.summaryItemPrice}>
                            {formatCurrency((item.price ?? 0) * item.quantity)}
                        </ThemedText>
                    </View>
                ))}
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>Tổng số tiền</ThemedText>
                <ThemedText style={styles.totalValue}>{formatCurrency(subtotal)}</ThemedText>
            </View>
        </Animated.View>

        <View style={styles.footer}>
            <Pressable
                style={({ pressed }) => [
                    styles.payButton,
                    { backgroundColor: CHECKOUT_COLORS.accent, opacity: loading ? 0.7 : (pressed ? 0.9 : 1) }
                ]}
                onPress={handlePay}
                disabled={loading || items.length === 0}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={CHECKOUT_COLORS.bg} />
                ) : (
                    <>
                        <ThemedText style={styles.payButtonText}>Thanh toán ngay</ThemedText>
                        <Ionicons name="shield-checkmark" size={20} color={CHECKOUT_COLORS.bg} />
                    </>
                )}
            </Pressable>
            
            <ThemedText style={styles.securityText}>
                <Ionicons name="lock-closed" size={12} color={CHECKOUT_COLORS.textDim} /> Giao dịch được bảo mật bởi mã hóa 256-bit
            </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: CHECKOUT_COLORS.text },
  headerSubtitle: { fontSize: 14, color: CHECKOUT_COLORS.textDim, marginTop: 4 },

  section: { borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: CHECKOUT_COLORS.text, marginBottom: 16 },

  methodCard: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 16, 
      borderRadius: 16, 
      borderWidth: 2, 
      borderColor: 'transparent', 
      backgroundColor: 'rgba(255,255,255,0.03)',
      marginBottom: 12
  },
  methodIconContainer: { 
      width: 48, 
      height: 48, 
      borderRadius: 12, 
      backgroundColor: 'rgba(34, 197, 94, 0.1)', 
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  methodInfo: { flex: 1, marginLeft: 16 },
  methodName: { fontSize: 15, fontWeight: '700', color: CHECKOUT_COLORS.text },
  methodDesc: { fontSize: 12, color: CHECKOUT_COLORS.textDim, marginTop: 2 },
  radio: { 
      width: 20, 
      height: 20, 
      borderRadius: 10, 
      borderWidth: 2, 
      borderColor: 'rgba(255,255,255,0.2)', 
      justifyContent: 'center', 
      alignItems: 'center' 
  },

  summaryList: { gap: 12 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItemText: { fontSize: 14, color: CHECKOUT_COLORS.textDim },
  summaryItemPrice: { fontSize: 14, fontWeight: '600', color: CHECKOUT_COLORS.text },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: CHECKOUT_COLORS.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: CHECKOUT_COLORS.accent },

  footer: { marginTop: 10, alignItems: 'center' },
  payButton: { 
      flexDirection: 'row', 
      width: '100%', 
      height: 60, 
      borderRadius: 20, 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: 12 
  },
  payButtonText: { fontSize: 18, fontWeight: '800', color: CHECKOUT_COLORS.bg },
  securityText: { fontSize: 12, color: CHECKOUT_COLORS.textDim, marginTop: 16, textAlign: 'center' }
});
