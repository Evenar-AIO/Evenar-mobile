import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerBuyersScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuyers = async () => {
      try {
        const data = await ownerService.getBuyers();
        setBuyers(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadBuyers();
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
        <ThemedText type="title">Buyers</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Top customers across your events.
        </ThemedText>
      </View>

      {buyers.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No buyers yet.
        </ThemedText>
      ) : (
        buyers.map((buyer) => (
          <View
            key={buyer._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">{buyer.name ?? buyer.fullName ?? 'Buyer'}</ThemedText>
            <View style={styles.rowBetween}>
              <ThemedText type="caption" tone="secondary">
                {buyer.tickets ?? buyer.totalTickets ?? 0} tickets
              </ThemedText>
              <ThemedText type="caption" tone="accent">
                {buyer.total ?? buyer.totalSpend ?? '₫0'}
              </ThemedText>
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
    gap: Spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}
);
