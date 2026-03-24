import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminAuditLogsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await adminService.getAuditLogs({ page: 1, limit: 20 });
        setLogs(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
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
        <ThemedText type="title">Audit logs</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Track admin actions across the system.
        </ThemedText>
      </View>

      {logs.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No logs available.
        </ThemedText>
      ) : (
        logs.map((log) => (
          <View
            key={log._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">{log.action ?? 'Action'}</ThemedText>
            <ThemedText type="caption" tone="secondary">
              {log.adminName ?? 'Admin'} · {log.createdAt ?? ''}
            </ThemedText>
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
}
);
