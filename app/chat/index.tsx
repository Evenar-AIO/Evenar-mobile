import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/store';

export default function ChatListScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { state } = useAuthStore();
  const { conversations, loading, fetchConversations, connectSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
        <ThemedText type="title">Messages</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Chat with organizers and support.
        </ThemedText>
      </View>

      {conversations.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No conversations yet.
        </ThemedText>
      ) : (
        conversations.map((conversation) => (
          <Pressable
            key={conversation._id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: palette.surface1, borderColor: palette.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation._id } })}
          >
            <ThemedText type="subtitle">{conversation.name ?? 'Conversation'}</ThemedText>
            <ThemedText type="caption" tone="secondary" numberOfLines={1}>
              {conversation.lastMessage ?? ''}
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
});
