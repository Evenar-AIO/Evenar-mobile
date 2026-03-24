import { useEffect, useMemo, useState, useCallback } from 'react';
import { 
    ActivityIndicator, 
    Pressable, 
    StyleSheet, 
    TextInput, 
    View, 
    ScrollView, 
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cart.store';
import { promotionService } from '@/features/customer/services/promotion.service';

const { width } = Dimensions.get('window');

const CART_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E', 
  accentAlt: '#3b82f6', 
  danger: '#ef4444', 
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function CartScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { items, loading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoValue, setPromoValue] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  }, [items]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || isValidating) return;
    setIsValidating(true);
    try {
        const result: any = await promotionService.validatePromo({ code: promoCode.trim() });
        setPromoValue(result?.discountValue ?? 0);
    } catch (err) {
        setPromoValue(0);
    } finally {
        setIsValidating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && items.length === 0) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: CART_COLORS.bg }]}>
        <ActivityIndicator size="large" color={CART_COLORS.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: CART_COLORS.bg }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Giỏ hàng của bạn</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                    {items.length > 0 ? `Bạn có ${items.length} mục trong giỏ` : 'Giỏ hàng đang trống'}
                </ThemedText>
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="cart-outline" size={64} color={CART_COLORS.textDim} opacity={0.3} />
                    </View>
                    <ThemedText style={styles.emptyTitle}>Chưa có gì ở đây cả</ThemedText>
                    <ThemedText style={styles.emptySubtitle}>Hãy khám phá các sự kiện hấp dẫn và chọn cho mình những tấm vé ưng ý nhé!</ThemedText>
                    <Pressable 
                        style={styles.exploreBtn}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <ThemedText style={styles.exploreBtnText}>Khám phá ngay</ThemedText>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.itemsList}>
                    {items.map((item, index) => (
                        <Animated.View 
                            key={item.ticketInfoId}
                            entering={FadeInUp.delay(index * 100)}
                            layout={Layout.springify()}
                            style={[styles.itemCard, { backgroundColor: CART_COLORS.surface }]}
                        >
                            <View style={styles.itemInfo}>
                                <View style={styles.itemTextContainer}>
                                    <ThemedText style={styles.itemName} numberOfLines={1}>{item.name ?? 'Loại vé'}</ThemedText>
                                    <ThemedText style={styles.itemEvent} numberOfLines={1}>Sự kiện âm nhạc / Thể thao</ThemedText>
                                    <ThemedText style={styles.itemPrice}>{formatCurrency(item.price ?? 0)}</ThemedText>
                                </View>
                                <Pressable 
                                    onPress={() => removeItem(item.ticketInfoId)}
                                    style={styles.removeBtn}
                                >
                                    <Ionicons name="trash-outline" size={18} color={CART_COLORS.danger} />
                                </Pressable>
                            </View>

                            <View style={styles.itemFooter}>
                                <View style={styles.quantityContainer}>
                                    <Pressable 
                                        style={styles.qtyBtn} 
                                        onPress={() => item.quantity > 1 ? updateItem(item.ticketInfoId, item.quantity - 1) : removeItem(item.ticketInfoId)}
                                    >
                                        <Ionicons name="remove" size={16} color={CART_COLORS.text} />
                                    </Pressable>
                                    <ThemedText style={styles.qtyText}>{item.quantity}</ThemedText>
                                    <Pressable 
                                        style={styles.qtyBtn} 
                                        onPress={() => updateItem(item.ticketInfoId, item.quantity + 1)}
                                    >
                                        <Ionicons name="add" size={16} color={CART_COLORS.text} />
                                    </Pressable>
                                </View>
                                <ThemedText style={styles.itemTotal}>{formatCurrency((item.price ?? 0) * item.quantity)}</ThemedText>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            )}

            {items.length > 0 && (
                <>
                    <View style={[styles.promoContainer, { backgroundColor: CART_COLORS.surface }]}>
                        <TextInput
                            value={promoCode}
                            onChangeText={setPromoCode}
                            placeholder="Mã giảm giá"
                            placeholderTextColor={CART_COLORS.textDim}
                            style={[styles.promoInput, { color: CART_COLORS.text }]}
                        />
                        <Pressable 
                            style={[styles.promoBtn, { backgroundColor: CART_COLORS.surfaceLight }]}
                            onPress={handleApplyPromo}
                            disabled={isValidating}
                        >
                            {isValidating ? (
                                <ActivityIndicator size="small" color={CART_COLORS.accent} />
                            ) : (
                                <ThemedText style={styles.promoBtnText}>Áp dụng</ThemedText>
                            )}
                        </Pressable>
                    </View>

                    <View style={[styles.summaryBox, { backgroundColor: CART_COLORS.surface }]}>
                        <View style={styles.summaryRow}>
                            <ThemedText style={styles.summaryLabel}>Tạm tính</ThemedText>
                            <ThemedText style={styles.summaryValue}>{formatCurrency(subtotal)}</ThemedText>
                        </View>
                        <View style={styles.summaryRow}>
                            <ThemedText style={styles.summaryLabel}>Giảm giá</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: CART_COLORS.accent }]}>-{formatCurrency(promoValue)}</ThemedText>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
                            <ThemedText style={styles.totalValue}>{formatCurrency(Math.max(subtotal - promoValue, 0))}</ThemedText>
                        </View>
                    </View>

                    <Pressable 
                        style={[styles.checkoutBtn, { backgroundColor: CART_COLORS.accent }]}
                        onPress={() => router.push('/checkout')}
                    >
                        <ThemedText style={styles.checkoutBtnText}>Tiến hành thanh toán</ThemedText>
                        <Ionicons name="arrow-forward" size={20} color={CART_COLORS.bg} />
                    </Pressable>

                    <Pressable 
                        style={styles.clearBtn}
                        onPress={clearCart}
                    >
                        <ThemedText style={styles.clearBtnText}>Xóa tất cả</ThemedText>
                    </Pressable>
                </>
            )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: CART_COLORS.text },
  headerSubtitle: { fontSize: 14, color: CART_COLORS.textDim, marginTop: 4 },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: CART_COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: CART_COLORS.text, marginBottom: 12 },
  emptySubtitle: { fontSize: 14, color: CART_COLORS.textDim, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  exploreBtn: { backgroundColor: CART_COLORS.accentAlt, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  itemsList: { gap: 16, marginBottom: 24 },
  itemCard: { borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  itemInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTextContainer: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 17, fontWeight: '700', color: CART_COLORS.text },
  itemEvent: { fontSize: 12, color: CART_COLORS.textDim, marginTop: 2 },
  itemPrice: { fontSize: 14, color: CART_COLORS.accentAlt, fontWeight: '600', marginTop: 8 },
  removeBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' },
  
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: CART_COLORS.surfaceLight, borderRadius: 12, padding: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', color: CART_COLORS.text, paddingHorizontal: 12 },
  itemTotal: { fontSize: 16, fontWeight: '800', color: CART_COLORS.text },

  promoContainer: { flexDirection: 'row', borderRadius: 20, padding: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  promoInput: { flex: 1, paddingHorizontal: 16, fontSize: 14 },
  promoBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, justifyContent: 'center' },
  promoBtnText: { fontSize: 14, fontWeight: '700', color: CART_COLORS.text },

  summaryBox: { borderRadius: 24, padding: 20, gap: 12, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: CART_COLORS.textDim },
  summaryValue: { fontSize: 14, fontWeight: '600', color: CART_COLORS.text },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: CART_COLORS.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: CART_COLORS.accent },

  checkoutBtn: { flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 12 },
  checkoutBtnText: { fontSize: 18, fontWeight: '800', color: CART_COLORS.bg },
  clearBtn: { alignItems: 'center', paddingVertical: 16 },
  clearBtnText: { fontSize: 14, color: CART_COLORS.textDim, fontWeight: '600' }
});
