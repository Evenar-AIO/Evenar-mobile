import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ADMIN_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E',
  warning: '#f59e0b',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function AdminTransactionsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      const data: any = await adminService.getTransactions({ page: 1, limit: 50 });
      setTransactions(data?.data ?? data ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const renderTransaction = ({ item: order, index }: { item: any, index: number }) => {
    const event = order.eventInfo ?? {};
    const amount = order.totalAmount ?? 0;
    const isPaid = order.paymentStatus === 'paid';
    
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50)}
        style={[styles.card, { backgroundColor: ADMIN_COLORS.surface }]}
      >
        <View style={styles.cardTop}>
           <View style={[styles.statusBadge, { backgroundColor: isPaid ? ADMIN_COLORS.accent + '20' : ADMIN_COLORS.warning + '20' }]}>
              <ThemedText style={[styles.statusText, { color: isPaid ? ADMIN_COLORS.accent : ADMIN_COLORS.warning }]}>
                {order.paymentStatus?.toUpperCase() || 'UNKNOWN'}
              </ThemedText>
           </View>
           <ThemedText style={styles.orderNumber}>{order.orderNumber || 'ORD-UNKNOWN'}</ThemedText>
        </View>

        <ThemedText style={styles.eventName}>{event.name || 'Giao dịch không tên'}</ThemedText>
        
        <View style={styles.cardBottom}>
           <View style={styles.metaInfo}>
              <Ionicons name="time-outline" size={12} color={ADMIN_COLORS.textDim} />
              <ThemedText style={styles.dateText}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</ThemedText>
           </View>
           <ThemedText style={styles.amountText}>{new Intl.NumberFormat('vi-VN').format(amount)}₫</ThemedText>
        </View>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: ADMIN_COLORS.bg }]}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: ADMIN_COLORS.bg }]}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_COLORS.accent} />
        }
        ListHeaderComponent={() => (
           <View style={styles.header}>
             <ThemedText style={styles.headerTitle}>Giao dịch gần đây</ThemedText>
             <ThemedText style={styles.headerSubtitle}>Theo dõi tất cả các đơn hàng và thanh toán.</ThemedText>
           </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: 12,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 10,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: ADMIN_COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ADMIN_COLORS.textDim,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  orderNumber: {
    fontSize: 11,
    color: ADMIN_COLORS.textDim,
    fontWeight: '600',
  },
  eventName: {
    fontSize: 15,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: ADMIN_COLORS.textDim,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: ADMIN_COLORS.accent,
  }
});
