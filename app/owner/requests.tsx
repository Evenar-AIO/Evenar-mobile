import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerRequestsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const data = await ownerService.getOrganizerRequest();
        setRequest(data?.data ?? data);
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, []);

  const handleSubmit = async () => {
    await ownerService.requestOrganizer({ reason: 'Request organizer role' });
    const data = await ownerService.getOrganizerRequest();
    setRequest(data?.data ?? data);
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
          Submit and track your organizer status.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
        >
        <ThemedText type="subtitle">Current status</ThemedText>
        <ThemedText type="caption" tone="secondary">
          {request?.status ?? 'Not submitted'}
        </ThemedText>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: palette.accentAlt },
          pressed && { opacity: 0.9 },
        ]}
        onPress={handleSubmit}
      >
        <ThemedText type="bodySemiBold" tone="inverse">
          Submit new request
        </ThemedText>
      </Pressable>
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
  primaryButton: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
}
);
