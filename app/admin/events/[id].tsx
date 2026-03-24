import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (!id) return;
        const data = await adminService.getEventById(id);
        setEvent(data);
        setName(data?.name ?? '');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    await adminService.updateEvent(id, { name });
  };

  const handleApprove = async () => {
    if (!id) return;
    await adminService.approveEvent(id);
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
        <ThemedText type="title">Event detail</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Review and approve events.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
        >
        <ThemedText type="caption" tone="secondary">
          Event name
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: palette.text }]}
        />
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleSave}
        >
          <ThemedText type="bodySemiBold">Save</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleApprove}
        >
          <ThemedText type="bodySemiBold" tone="inverse">
            Approve
          </ThemedText>
        </Pressable>
      </View>

      {event && (
        <View style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
          <ThemedText type="caption" tone="secondary">
            Organizer
          </ThemedText>
          <ThemedText type="subtitle">{event.organizerName ?? 'Organizer'}</ThemedText>
          <ThemedText type="caption" tone="secondary">
            Status: {event.status ?? 'Pending'}
          </ThemedText>
        </View>
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
  input: {
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryButton: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
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
