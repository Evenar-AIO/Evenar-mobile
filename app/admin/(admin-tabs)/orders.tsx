import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ADMIN_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E',
  accentAlt: '#3b82f6',
  danger: '#ef4444',
  warning: '#f59e0b',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function AdminOrdersScreen() {
  const theme = useColorScheme() ?? 'dark';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadOrders = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1 && !isRefresh) setLoading(true);
      const limit = 15;
      const data: any = await adminService.getTransactions({ page: pageNum, limit });
      
      const newItems = data?.data ?? data ?? [];
      
      if (pageNum === 1) {
        setOrders(newItems);
      } else {
        setOrders(prev => [...prev, ...newItems]);
      }
      
      setHasMore(newItems.length === limit);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders(1, true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    loadOrders(page + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return ADMIN_COLORS.accent;
      case 'pending': return ADMIN_COLORS.warning;
      case 'cancelled':
      case 'failed': return ADMIN_COLORS.danger;
      case 'refunded': return ADMIN_COLORS.accentAlt;
      default: return ADMIN_COLORS.textDim;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderOrder = ({ item: order, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 40)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
         <View>
            <ThemedText style={styles.orderNumber}>{order.orderNumber || `ORD-${order.legacyId || '???'}`}</ThemedText>
            <ThemedText style={styles.orderDate}>{new Date(order.createdAt).toLocaleString('vi-VN')}</ThemedText>
         </View>
         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.paymentStatus) + '20' }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(order.paymentStatus) }]}>
               {(order.paymentStatus || 'unknown').toUpperCase()}
            </ThemedText>
         </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
         <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={ADMIN_COLORS.textDim} />
            <ThemedText style={styles.infoText}>
               {order.userInfo?.[0]?.username || order.contactEmail || 'Khách vãng lai'}
            </ThemedText>
         </View>
         <View style={styles.infoRow}>
            <Ionicons name="ticket-outline" size={14} color={ADMIN_COLORS.textDim} />
            <ThemedText style={styles.infoText} numberOfLines={1}>
               {order.eventInfo?.[0]?.name || 'Sự kiện không xác định'}
            </ThemedText>
         </View>
      </View>

      <View style={styles.cardFooter}>
         <ThemedText style={styles.amountLabel}>Tổng cộng</ThemedText>
         <ThemedText style={styles.amountValue}>{formatCurrency(order.totalAmount)}</ThemedText>
      </View>
    </Animated.View>
  );

  const renderSummary = () => {
    if (orders.length === 0) return null;
    
    const stats = orders.reduce((acc, curr) => {
      const s = curr.paymentStatus?.toLowerCase();
      if (['paid', 'pending', 'failed', 'cancelled'].includes(s)) {
          acc[s === 'cancelled' ? 'failed' : s] = (acc[s === 'cancelled' ? 'failed' : s] || 0) + 1;
      }
      acc.totalAmount += (curr.totalAmount || 0);
      return acc;
    }, { paid: 0, pending: 0, failed: 0, totalAmount: 0 });

    const total = orders.length;
    const paidPerc = (stats.paid / total) * 100;
    const pendingPerc = (stats.pending / total) * 100;
    const failPerc = (stats.failed / total) * 100;

    return (
      <Animated.View entering={FadeInUp.delay(100)} style={styles.summaryContainer}>
         <View style={styles.summaryTop}>
            <View>
               <ThemedText style={styles.summaryLabel}>Tổng doanh thu (Trang này)</ThemedText>
               <ThemedText style={styles.summaryValue}>{formatCurrency(stats.totalAmount)}</ThemedText>
            </View>
            <View style={styles.summaryBadge}>
               <Ionicons name="trending-up" size={12} color={ADMIN_COLORS.accent} />
               <ThemedText style={styles.summaryBadgeText}>PHÙ HỢP</ThemedText>
            </View>
         </View>

         <View style={styles.chartTitleRow}>
            <ThemedText style={styles.chartTitle}>Phân bổ trạng thái</ThemedText>
            <ThemedText style={styles.chartSubTitle}>{total} đơn hàng</ThemedText>
         </View>

         {/* Custom Progress Bar Chart */}
         <View style={styles.progressBar}>
            <View style={[styles.progressSegment, { width: `${paidPerc}%`, backgroundColor: ADMIN_COLORS.accent }]} />
            <View style={[styles.progressSegment, { width: `${pendingPerc}%`, backgroundColor: ADMIN_COLORS.warning }]} />
            <View style={[styles.progressSegment, { width: `${failPerc}%`, backgroundColor: ADMIN_COLORS.danger }]} />
         </View>

         <View style={styles.legendRow}>
            <LegendItem color={ADMIN_COLORS.accent} label="Thành công" value={stats.paid} />
            <LegendItem color={ADMIN_COLORS.warning} label="Chờ duyệt" value={stats.pending} />
            <LegendItem color={ADMIN_COLORS.danger} label="Thất bại" value={stats.failed} />
         </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: ADMIN_COLORS.bg }]}>
      <View style={styles.headerArea}>
         <ThemedText style={styles.headerTitle}>Quản lý Đơn hàng</ThemedText>
         <ThemedText style={styles.headerSubtitle}>Danh sách tất cả giao dịch trên hệ thống</ThemedText>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderSummary}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_COLORS.accent} />
          }
          ListFooterComponent={() => 
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
             <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={ADMIN_COLORS.textDim} style={{ marginBottom: 12, opacity: 0.3 }} />
                <ThemedText style={styles.emptyText}>Chưa có đơn hàng nào được ghi nhận.</ThemedText>
             </View>
          )}
        />
      )}
    </ThemedView>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <ThemedText style={styles.legendLabel}>{label}: </ThemedText>
            <ThemedText style={styles.legendValue}>{value}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerArea: { padding: 20, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: ADMIN_COLORS.text },
  headerSubtitle: { fontSize: 13, color: ADMIN_COLORS.textDim, marginTop: 4 },
  listContent: { padding: 16, gap: 16, paddingBottom: 40 },
  
  // Summary Styles
  summaryContainer: { backgroundColor: ADMIN_COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  summaryLabel: { fontSize: 11, color: ADMIN_COLORS.textDim, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '800', color: ADMIN_COLORS.text },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ADMIN_COLORS.accent + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  summaryBadgeText: { fontSize: 10, fontWeight: '700', color: ADMIN_COLORS.accent },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  chartTitle: { fontSize: 13, fontWeight: '700', color: ADMIN_COLORS.text },
  chartSubTitle: { fontSize: 11, color: ADMIN_COLORS.textDim },
  progressBar: { height: 8, backgroundColor: ADMIN_COLORS.surfaceLight, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', marginBottom: 16 },
  progressSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendLabel: { fontSize: 10, color: ADMIN_COLORS.textDim },
  legendValue: { fontSize: 10, fontWeight: '700', color: ADMIN_COLORS.text },

  card: { backgroundColor: ADMIN_COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNumber: { fontSize: 15, fontWeight: '700', color: ADMIN_COLORS.text },
  orderDate: { fontSize: 11, color: ADMIN_COLORS.textDim, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginVertical: 12 },
  cardBody: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: ADMIN_COLORS.text },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' },
  amountLabel: { fontSize: 12, color: ADMIN_COLORS.textDim, fontWeight: '600' },
  amountValue: { fontSize: 16, fontWeight: '800', color: ADMIN_COLORS.accentAlt },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: ADMIN_COLORS.textDim },
});
