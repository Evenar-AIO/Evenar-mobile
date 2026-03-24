import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEventStore } from '@/store/event.store';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/context/ToastContext';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, fetchEvents } = useEventStore();
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!events.length) {
      fetchEvents();
    }
  }, [events.length, fetchEvents]);

  const event = events.find((item) => item._id === id);
  // Backend returns ticketInfo array, each item has _id, ticketName, price
  const tiers = useMemo(() => (event as any)?.ticketInfo ?? [], [event]);

  const handleAddToCart = async () => {
    if (!selectedTier || !id) return;
    setAdding(true);
    try {
      await addItem(id, selectedTier, 1);
      showToast({ message: 'Đã thêm vé vào giỏ hàng!', type: 'success' });
    } catch (err: any) {
      showToast({ message: 'Lỗi: ' + (err.message || 'Không thể thêm vé'), type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedTier || !id) return;
    setAdding(true);
    try {
      await addItem(id, selectedTier, 1);
      router.push('/checkout');
    } catch (err: any) {
      showToast({ message: 'Lỗi: ' + (err.message || 'Không thể mua ngay'), type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  if (!event) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle">Event not found</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link" tone="accent">
            Go back
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!!event.imageURL && <Image source={{ uri: event.imageURL }} style={styles.heroImage} />}

        <View style={styles.headerBlock}>
          <ThemedText type="display">{event.name}</ThemedText>
          <ThemedText type="caption" tone="secondary">
            {event.physicalLocation ?? 'Vietnam'} · {new Date(event.startTime).toLocaleDateString()}
          </ThemedText>
        </View>

        <View style={[styles.infoCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText type="caption" tone="secondary">
            {event.description ?? 'Ticketing and experience details coming soon.'}
          </ThemedText>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Select ticket</ThemedText>
          <ThemedText type="caption" tone="secondary">
            {event.layout ? 'Seat map available' : 'General admission tiers'}
          </ThemedText>
        </View>

        {tiers.length === 0 ? (
          <ThemedText type="caption" tone="secondary">
            No ticket tiers available.
          </ThemedText>
        ) : (
          tiers.map((tier: any) => (
            <Pressable
              key={tier._id ?? tier.id}
              style={({ pressed }) => [
                styles.ticketRow,
                {
                  backgroundColor:
                    selectedTier === (tier._id ?? tier.id) ? palette.surface2 : palette.surface1,
                  borderColor:
                    selectedTier === (tier._id ?? tier.id) ? palette.accentAlt : palette.border,
                },
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => setSelectedTier(tier._id ?? tier.id)}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <ThemedText type="subtitle">{tier.ticketName ?? 'General Admission'}</ThemedText>
                <ThemedText type="caption" tone="secondary">
                  {tier.ticketDescription ?? 'Instant confirmation'}
                </ThemedText>
              </View>
              <ThemedText type="subtitle" tone="accent">
                {tier.price ? `${tier.price}đ` : 'TBA'}
              </ThemedText>
            </Pressable>
          ))
        )}

        {event.layout ? (
          <View style={[styles.infoCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Seat map</ThemedText>
            <ThemedText type="caption" tone="secondary">
              Seat layout available. Integrate seat selection with layout data.
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: palette.accentAlt },
              pressed && { opacity: 0.9 },
            ]}
            onPress={handleAddToCart}
            disabled={!selectedTier}
          >
            <ThemedText type="bodySemiBold" tone="inverse">
              Add to cart
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: palette.border, backgroundColor: palette.surface1 },
              pressed && { opacity: 0.9 },
            ]}
            onPress={handleBuyNow}
            disabled={!selectedTier}
          >
            <ThemedText type="bodySemiBold">Buy now</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: Radius.lg,
  },
  headerBlock: {
    gap: Spacing.xs,
  },
  infoCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.soft,
  },
  sectionHeader: {
    gap: 4,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
