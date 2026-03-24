import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminTransactionsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data: any = await adminService.getTransactions({ page: 1, limit: 20 });
        setTransactions(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Transactions</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Latest orders and payouts.
        </ThemedText>
      </View>

      {transactions.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No transactions available.
        </ThemedText>
      ) : (
        transactions.map((transaction) => {
          const order = transaction; // transaction is now the Order object
          const event = transaction.eventInfo ?? {};
          const amount = order.totalAmount ?? 0;
          
          return (
            <View
              key={transaction._id}
              style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
            >
              <View style={styles.rowBetween}>
                <ThemedText type="subtitle" style={{ fontSize: 13 }}>{order.orderNumber || 'ORD-UNKNOWN'}</ThemedText>
                <ThemedText type="caption" style={{ color: order.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }}>
                  {order.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                </ThemedText>
              </View>
              
              <ThemedText type="body" style={{ fontSize: 14 }}>{event.name || 'Event Purchase'}</ThemedText>
              
              <View style={styles.rowBetween}>
                <ThemedText type="caption" tone="secondary">
                  {new Date(order.createdAt).toLocaleDateString()}
                </ThemedText>
                <ThemedText type="caption" tone="accent" style={{ fontWeight: '700' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </ThemedText>
              </View>
            </View>
          );
        })
      )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.xs,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}
);
