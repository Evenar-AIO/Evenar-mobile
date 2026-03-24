import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cart.store';
import { promotionService } from '@/features/customer/services/promotion.service';

export default function CartScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { items, loading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoValue, setPromoValue] = useState(0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  }, [items]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    const result: any = await promotionService.validatePromo({ code: promoCode.trim() });
    setPromoValue(result?.discountValue ?? 0);
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.cardHeader}>
        <ThemedText type="title">Your cart</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Review tickets before checkout.
        </ThemedText>
      </View>

      {items.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          Your cart is empty.
        </ThemedText>
      ) : (
        items.map((item) => (
          <View
            key={item.ticketInfoId}
            style={[styles.itemCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <View>
              <ThemedText type="subtitle">{item.name ?? 'Ticket'}</ThemedText>
              <ThemedText type="caption" tone="secondary">
                Qty {item.quantity}
              </ThemedText>
            </View>
            <View style={styles.rowBetween}>
              <ThemedText type="caption" tone="accent">
                {item.price ?? 0}đ
              </ThemedText>
              <View style={styles.actionRow}>
                <Pressable onPress={() => updateItem(item.ticketInfoId, item.quantity + 1)}>
                  <ThemedText type="caption" tone="accent">
                    +
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() =>
                    item.quantity > 1
                      ? updateItem(item.ticketInfoId, item.quantity - 1)
                      : removeItem(item.ticketInfoId)
                  }
                >
                  <ThemedText type="caption" tone="accent">
                    -
                  </ThemedText>
                </Pressable>
                <Pressable onPress={() => removeItem(item.ticketInfoId)}>
                  <ThemedText type="caption" tone="accent">
                    Remove
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={[styles.promoCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
        <TextInput
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="Promo code"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, { color: palette.text }]}
        />
        <Pressable onPress={handleApplyPromo}>
          <ThemedText type="caption" tone="accent">
            Apply
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
        <View style={styles.summaryRow}>
          <ThemedText type="caption" tone="secondary">
            Subtotal
          </ThemedText>
          <ThemedText type="bodySemiBold">{total}đ</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="caption" tone="secondary">
            Promo
          </ThemedText>
          <ThemedText type="bodySemiBold" tone="accent">
            -{promoValue}đ
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText type="caption" tone="secondary">
            Total
          </ThemedText>
          <ThemedText type="bodySemiBold">
            {Math.max(total - promoValue, 0)}đ
          </ThemedText>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={clearCart}
        >
          <ThemedText type="bodySemiBold">Clear</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/checkout')}
          disabled={items.length === 0}
        >
          <ThemedText type="bodySemiBold" tone="inverse">
            Continue to checkout
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    gap: Spacing.xs,
  },
  itemCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  promoCard: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  summaryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
}
);
