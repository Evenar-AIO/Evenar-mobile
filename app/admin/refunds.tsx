import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminRefundsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefunds = async () => {
      try {
        const data = await adminService.getRefunds({ page: 1, limit: 20 });
        setRefunds(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadRefunds();
  }, []);

  const handleProcess = async (refundId: string, status: string) => {
    await adminService.processRefund(refundId, status);
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
      <View style={styles.header}>
        <ThemedText type="title">Refunds</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Review refund requests.
        </ThemedText>
      </View>

      {refunds.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No refunds found.
        </ThemedText>
      ) : (
        refunds.map((refund) => (
          <View
            key={refund._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">{refund.orderCode ?? 'Refund'}</ThemedText>
            <ThemedText type="caption" tone="secondary">
              {refund.status ?? 'Pending'} · {refund.amount ?? '₫0'}
            </ThemedText>
            <View style={styles.actionRow}>
              <Pressable onPress={() => handleProcess(refund._id, 'approved')}>
                <ThemedText type="caption" tone="accent">
                  Approve
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => handleProcess(refund._id, 'rejected')}>
                <ThemedText type="caption" tone="accent">
                  Reject
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ))
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
    justifyContent: 'center',
    alignItems: 'center',
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
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
}
);
