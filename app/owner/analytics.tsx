import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerAnalyticsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await ownerService.getAnalytics();
        setMetrics(data);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </ThemedView>
    );
  }

  const cards = metrics?.cards ?? [
    { label: 'Weekly revenue', value: metrics?.weeklyRevenue ?? '₫0' },
    { label: 'Conversion rate', value: metrics?.conversionRate ?? '0%' },
    { label: 'Avg ticket price', value: metrics?.avgTicketPrice ?? '₫0' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Analytics</ThemedText>
          <ThemedText type="caption" tone="secondary">
            Track sales performance and demand.
          </ThemedText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/dashboard')}
        >
          <ThemedText type="caption">Overview</ThemedText>
        </Pressable>
      </View>

      <View style={styles.metricGrid}>
        {cards.map((metric: any) => (
          <View
            key={metric.label}
            style={[styles.metricCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="caption" tone="secondary">
              {metric.label}
            </ThemedText>
            <ThemedText type="subtitle">{metric.value}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.chartCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}
        >
        <ThemedText type="subtitle">Revenue trend</ThemedText>
        <ThemedText type="caption" tone="secondary">
          {metrics?.revenueNote ?? 'Analytics data available.'}
        </ThemedText>
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
  secondaryButton: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
  },
  metricGrid: {
    gap: Spacing.md,
  },
  metricCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  chartCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
}
);
