import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSupportStore } from '@/store/support.store';

export default function SupportNewScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const { submitTicket, loading } = useSupportStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    await submitTicket({ subject, description: message });
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Create ticket</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Tell us what happened and include any details.
        </ThemedText>
      </View>

      <View style={[styles.inputCard, { borderColor: palette.border, backgroundColor: palette.surface1 }]}
        >
        <TextInput
          placeholder="Subject"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, { color: palette.text }]}
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      <View
        style={[
          styles.inputCard,
          styles.textArea,
          { borderColor: palette.border, backgroundColor: palette.surface1 },
        ]}
      >
        <TextInput
          placeholder="Describe your issue"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, styles.textAreaInput, { color: palette.text }]}
          multiline
          value={message}
          onChangeText={setMessage}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: palette.accentAlt },
          pressed && { opacity: 0.9 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={palette.textInverse} />
        ) : (
          <ThemedText type="bodySemiBold" tone="inverse">
            Submit ticket
          </ThemedText>
        )}
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
  header: {
    gap: Spacing.xs,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textArea: {
    minHeight: 140,
  },
  input: {
    fontSize: 16,
  },
  textAreaInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
}
);
