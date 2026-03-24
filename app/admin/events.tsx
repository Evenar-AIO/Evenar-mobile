import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminEventsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await adminService.getEvents({ page: 1, limit: 20 });
        setEvents(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleApprove = async (id: string) => {
    await adminService.approveEvent(id);
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteEvent(id);
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
        <ThemedText type="title">Events moderation</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Approve or remove events.
        </ThemedText>
      </View>

      {events.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No events found.
        </ThemedText>
      ) : (
        events.map((event) => (
          <View
            key={event._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <Pressable onPress={() => router.push(`/admin/events/${event._id}`)}>
              <ThemedText type="subtitle">{event.name}</ThemedText>
              <ThemedText type="caption" tone="secondary">
                {event.status ?? 'Pending'} · {event.organizerName ?? 'Organizer'}
              </ThemedText>
            </Pressable>
            <View style={styles.actionRow}>
              <Pressable onPress={() => handleApprove(event._id)}>
                <ThemedText type="caption" tone="accent">
                  Approve
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => handleDelete(event._id)}>
                <ThemedText type="caption" tone="accent">
                  Delete
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
