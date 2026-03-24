import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerDashboardScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await ownerService.getStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </ThemedView>
    );
  }

  const kpis = stats?.kpis ?? [
    { label: 'Total revenue', value: stats?.totalRevenue ?? '₫0' },
    { label: 'Tickets sold', value: stats?.ticketsSold ?? '0' },
    { label: 'Active events', value: stats?.activeEvents ?? '0' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Owner Dashboard</ThemedText>
          <ThemedText type="caption" tone="secondary">
            Your event business at a glance.
          </ThemedText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/analytics')}
        >
          <ThemedText type="bodySemiBold" tone="inverse">
            Analytics
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.kpiRow}>
        {kpis.map((kpi: { label: string; value: string }) => (
          <View
            key={kpi.label}
            style={[styles.kpiCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="caption" tone="secondary">
              {kpi.label}
            </ThemedText>
            <ThemedText type="subtitle">{kpi.value}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Top events</ThemedText>
          <Pressable onPress={() => router.push('/owner/event')}>
            <ThemedText type="caption" tone="accent">
              Manage
            </ThemedText>
          </Pressable>
        </View>
        {(stats?.topEvents ?? []).length === 0 ? (
          <ThemedText type="caption" tone="secondary">
            No top events yet.
          </ThemedText>
        ) : (
          stats.topEvents.map((event: any) => (
            <View key={event._id} style={styles.rowBetween}>
              <ThemedText type="caption" tone="secondary">
                {event.name}
              </ThemedText>
              <ThemedText type="caption" tone="accent">
                {event.revenue ?? '₫0'}
              </ThemedText>
            </View>
          ))
        )}
      </View>

      <View style={styles.ctaRow}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/buyers')}
        >
          <ThemedText type="caption">Buyers</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/requests')}
        >
          <ThemedText type="caption">Requests</ThemedText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  kpiRow: {
    gap: Spacing.md,
  },
  kpiCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadows.soft,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
}
);
