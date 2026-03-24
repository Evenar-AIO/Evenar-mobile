import { useEffect, useState, useCallback } from 'react';
import { 
    ActivityIndicator, 
    Pressable, 
    StyleSheet, 
    View, 
    FlatList, 
    Dimensions,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { orderService } from '@/features/customer/services/order.service';

const { width } = Dimensions.get('window');

const ORDERS_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  accent: '#a855f7', 
  success: '#22C55E',
  pending: '#f59e0b',
  danger: '#ef4444',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function OrderHistoryScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const result: any = await orderService.getOrders();
      setOrders(result?.orders || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return ORDERS_COLORS.success;
      case 'pending': return ORDERS_COLORS.pending;
      case 'cancelled': return ORDERS_COLORS.danger;
      default: return ORDERS_COLORS.accent;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderOrderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInRight.delay(index * 100)} 
      layout={Layout.springify()}
      style={[styles.orderCard, { backgroundColor: ORDERS_COLORS.surface }]}
    >
        <View style={styles.orderHeader}>
            <View>
                <ThemedText style={styles.orderNumber}>#{item.orderNumber}</ThemedText>
                <ThemedText style={styles.orderDate}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentStatus) + '20' }]}>
                <ThemedText style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
                    {(item.paymentStatus || 'unknown').toUpperCase()}
                </ThemedText>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderDetails}>
            <ThemedText style={styles.eventTitle}>{item.eventId?.name || 'Sự kiện'}</ThemedText>
            <View style={styles.ticketSummary}>
                <Ionicons name="ticket-outline" size={16} color={ORDERS_COLORS.textDim} />
                <ThemedText style={styles.ticketCount}>{item.totalQuantity} vé</ThemedText>
            </View>
        </View>

        <View style={styles.orderFooter}>
            <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
            <ThemedText style={styles.totalValue}>{formatCurrency(item.totalAmount)}</ThemedText>
        </View>
    </Animated.View>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.center, { backgroundColor: ORDERS_COLORS.bg }]}>
        <ActivityIndicator size="large" color={ORDERS_COLORS.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: ORDERS_COLORS.bg }]}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ORDERS_COLORS.accent} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={ORDERS_COLORS.surface} />
            <ThemedText style={styles.emptyTitle}>Chưa có đơn hàng nào</ThemedText>
            <ThemedText style={styles.emptySub}>Hãy bắt đầu hành trình của bạn ngay hôm nay!</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 30 },
  
  orderCard: { 
      borderRadius: 24, 
      padding: 20, 
      marginBottom: 16, 
      borderWidth: 1, 
      borderColor: 'rgba(255,255,255,0.05)',
      ...Shadows.soft 
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNumber: { fontSize: 16, fontWeight: '800', color: ORDERS_COLORS.text },
  orderDate: { fontSize: 12, color: ORDERS_COLORS.textDim, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '800' },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
  
  orderDetails: { gap: 8 },
  eventTitle: { fontSize: 17, fontWeight: '700', color: ORDERS_COLORS.text },
  ticketSummary: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ticketCount: { fontSize: 14, color: ORDERS_COLORS.textDim },
  
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  totalLabel: { fontSize: 14, color: ORDERS_COLORS.textDim },
  totalValue: { fontSize: 18, fontWeight: '800', color: ORDERS_COLORS.accent },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: ORDERS_COLORS.text, marginTop: 20 },
  emptySub: { fontSize: 14, color: ORDERS_COLORS.textDim, marginTop: 8, textAlign: 'center' }
});
