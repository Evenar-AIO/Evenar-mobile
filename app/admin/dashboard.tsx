import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const fallbackKpis = [
  { label: 'Active users', value: '0' },
  { label: 'Total events', value: '0' },
  { label: 'Revenue', value: '₫0' },
];

export default function AdminDashboardScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await adminService.getDashboard();
        setDashboard(data);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </ThemedView>
    );
  }

  const kpis = dashboard?.kpis ?? fallbackKpis;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Admin Dashboard</ThemedText>
          <ThemedText type="caption" tone="secondary">
            System health and approvals.
          </ThemedText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/admin/users')}
        >
          <ThemedText type="bodySemiBold" tone="inverse">
            Users
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

      <View style={[styles.sectionCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}
        >
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Pending approvals</ThemedText>
          <Pressable onPress={() => router.push('/admin/events')}
            >
            <ThemedText type="caption" tone="accent">
              Review events
            </ThemedText>
          </Pressable>
        </View>
        {(dashboard?.pendingEvents ?? []).length === 0 ? (
          <ThemedText type="caption" tone="secondary">
            No pending events.
          </ThemedText>
        ) : (
          dashboard.pendingEvents.map((event: any) => (
            <View key={event._id} style={styles.rowBetween}>
              <ThemedText type="caption" tone="secondary">
                {event.name}
              </ThemedText>
              <Pressable onPress={() => adminService.approveEvent(event._id)}>
                <ThemedText type="caption" tone="accent">
                  Approve
                </ThemedText>
              </Pressable>
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
          onPress={() => router.push('/admin/transactions')}
        >
          <ThemedText type="caption">Transactions</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/admin/organizer-requests')}
        >
          <ThemedText type="caption">Organizer requests</ThemedText>
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
