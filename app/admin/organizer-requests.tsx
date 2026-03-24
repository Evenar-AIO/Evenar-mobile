import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminOrganizerRequestsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await adminService.getOrganizerRequests('pending');
        setRequests(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleProcess = async (id: string, status: string) => {
    await adminService.processOrganizerRequest(id, status);
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
        <ThemedText type="title">Organizer requests</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Approve or reject organizer requests.
        </ThemedText>
      </View>

      {requests.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No pending requests.
        </ThemedText>
      ) : (
        requests.map((request) => (
          <View
            key={request._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">{request.fullName ?? 'Organizer'}</ThemedText>
            <ThemedText type="caption" tone="secondary">
              {request.organizationName ?? 'Organization'}
            </ThemedText>
            <View style={styles.actionRow}>
              <Pressable onPress={() => handleProcess(request._id, 'approved')}>
                <ThemedText type="caption" tone="accent">
                  Approve
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => handleProcess(request._id, 'rejected')}>
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
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
}
);
