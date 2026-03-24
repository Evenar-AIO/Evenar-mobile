import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminSupportScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSupport = async () => {
      try {
        const data = await adminService.getSupport({ page: 1, limit: 20 });
        setTickets(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadSupport();
  }, []);

  const handleResolve = async (ticketId: string) => {
    await adminService.updateSupport(ticketId, { status: 'resolved' });
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
        <ThemedText type="title">Support</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Tickets and admin responses.
        </ThemedText>
      </View>

      {tickets.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No support tickets found.
        </ThemedText>
      ) : (
        tickets.map((ticket) => (
          <View
            key={ticket._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">{ticket.subject ?? 'Support ticket'}</ThemedText>
            <ThemedText type="caption" tone="secondary">
              {ticket.status ?? 'Open'} · {ticket.customerName ?? 'Customer'}
            </ThemedText>
            <View style={styles.actionRow}>
              <Pressable onPress={() => handleResolve(ticket._id)}>
                <ThemedText type="caption" tone="accent">
                  Resolve
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
    gap: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
}
);
