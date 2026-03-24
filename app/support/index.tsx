import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSupportStore } from '@/store/support.store';

export default function SupportScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { tickets, loading, fetchTickets } = useSupportStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
        <View>
          <ThemedText type="title">Support</ThemedText>
          <ThemedText type="caption" tone="secondary">
            We usually reply within 24 hours.
          </ThemedText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/support/new')}
        >
          <ThemedText type="bodySemiBold" tone="inverse">
            New ticket
          </ThemedText>
        </Pressable>
      </View>

      {tickets.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No tickets yet.
        </ThemedText>
      ) : (
        tickets.map((ticket) => (
          <View
            key={ticket._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">{ticket.subject ?? 'Support ticket'}</ThemedText>
            <ThemedText type="caption" tone="secondary">
              Status: {ticket.status ?? 'Open'}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
}
);
