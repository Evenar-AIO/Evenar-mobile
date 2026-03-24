import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/context/ToastContext';
import { getEventByIdApi } from '@/features/event/api/event.api';
import { chatService } from '@/features/customer/services/chat.service';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (!id) return;
        setLoading(true);
        // Use the Public API instead of Admin API
        const data = await getEventByIdApi(id);
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const tiers = useMemo(() => {
    return event?.ticketInfo || event?.ticketInfos || event?.tickets || [];
  }, [event]);

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
      router.push('/cart');
    } catch (err: any) {
      showToast({ message: 'Lỗi: ' + (err.message || 'Không thể mua ngay'), type: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleChat = async () => {
    if (!event?.ownerId) {
      const msg = !event ? "Đang tải dữ liệu..." : "Chủ sự kiện chưa cập nhật thông tin liên hệ";
      showToast({ message: msg, type: 'error' });
      return;
    }
    try {
      const conv: any = await chatService.createConversation({ otherUserId: event.ownerId });
      const conversationId = conv?.data?._id || conv?._id;
      if (conversationId) {
        router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
      }
    } catch (err: any) {
      showToast({ message: 'Không thể kết nối với chủ sự kiện', type: 'error' });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.accentAlt} />
      </View>
    );
  }

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
          
          <Pressable 
            style={({ pressed }) => [styles.chatButtonRow, pressed && { opacity: 0.7 }]}
            onPress={handleChat}
          >
            <View style={styles.chatIconWrap}>
              <Ionicons name="chatbubble-ellipses" size={18} color={palette.accentAlt} />
            </View>
            <ThemedText style={styles.chatLink}>Nhắn tin cho ban tổ chức</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.infoCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText style={{ color: palette.textSecondary, fontSize: 13, lineHeight: 20 }}>
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
                   {`Còn lại: ${tier.available ?? 0} vé`}
                </ThemedText>
              </View>
              <ThemedText type="subtitle" tone="accent">
                {tier.price ? `${new Intl.NumberFormat('vi-VN').format(tier.price)}đ` : 'TBA'}
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
              { backgroundColor: palette.accentAlt, opacity: !selectedTier ? 0.5 : (pressed ? 0.9 : 1) },
            ]}
            onPress={handleAddToCart}
            disabled={!selectedTier || adding}
          >
            <ThemedText type="bodySemiBold" tone="inverse">
              {adding ? 'Adding...' : 'Add to cart'}
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: palette.border, backgroundColor: palette.surface1, opacity: !selectedTier ? 0.5 : (pressed ? 0.9 : 1) },
            ]}
            onPress={handleBuyNow}
            disabled={!selectedTier || adding}
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
    paddingBottom: 40,
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
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chatButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 10,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  chatIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
