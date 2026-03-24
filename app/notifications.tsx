import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationStore } from '@/store/notification.store';

export default function NotificationsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { items, loading, fetchNotifications, markRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
        <ThemedText type="title">Notifications</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Stay on top of your bookings.
        </ThemedText>
      </View>

      {items.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          You&apos;re all caught up.
        </ThemedText>
      ) : (
        items.map((item) => (
          <Pressable
            key={item._id}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: item.isRead ? palette.surface1 : palette.surface2,
                borderColor: palette.border,
              },
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => markRead(item._id)}
          >
            <ThemedText type="subtitle">{item.title ?? 'Notification'}</ThemedText>
            <ThemedText type="caption" tone="secondary">
              {item.content ?? ''}
            </ThemedText>
          </Pressable>
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
