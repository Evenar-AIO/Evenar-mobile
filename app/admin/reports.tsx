import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminReportsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await adminService.exportStats({ format: 'csv' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Reports</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Export platform analytics.
        </ThemedText>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: palette.accentAlt },
          pressed && { opacity: 0.9 },
        ]}
        onPress={handleExport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={palette.textInverse} />
        ) : (
          <ThemedText type="bodySemiBold" tone="inverse">
            Export CSV
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
  primaryButton: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
}
);
