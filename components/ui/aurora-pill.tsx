import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuroraPillProps = PressableProps & {
  label: string;
  active?: boolean;
};

export function AuroraPill({ label, active = false, style, ...props }: AuroraPillProps) {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: active ? palette.surface2 : palette.surface1,
          borderColor: active ? palette.accentAlt : palette.border,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
    >
      <ThemedText type="caption" tone="secondary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
