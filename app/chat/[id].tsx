import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChatStore } from '@/store/chat.store';

export default function ChatDetailScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages, loading, fetchMessages, sendMessage } = useChatStore();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchMessages(id);
    }
  }, [fetchMessages, id]);

  const thread = useMemo(() => (id ? messages[id] ?? [] : []), [id, messages]);

  const handleSend = async () => {
    if (!input.trim() || !id) return;
    await sendMessage({ conversationId: id, message: input.trim() });
    setInput('');
    await fetchMessages(id);
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
        <ThemedText type="title">Conversation</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Support is online now.
        </ThemedText>
      </View>

      <View style={styles.messageList}>
        {thread.map((message) => (
          <View
            key={message._id}
            style={[
              styles.messageBubble,
              {
                alignSelf: message.senderId ? 'flex-end' : 'flex-start',
                backgroundColor: message.senderId ? palette.accent : palette.surface1,
              },
            ]}
          >
            <ThemedText
              type="caption"
              tone={message.senderId ? 'inverse' : 'secondary'}
            >
              {message.text}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.inputRow, { borderColor: palette.border, backgroundColor: palette.surface1 }]}
        >
        <TextInput
          placeholder="Type a message"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, { color: palette.text }]}
          value={input}
          onChangeText={setInput}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleSend}
        >
          <ThemedText type="caption" tone="inverse">
            Send
          </ThemedText>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.xs,
  },
  messageList: {
    flex: 1,
    gap: Spacing.sm,
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    maxWidth: '80%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  sendButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
});
