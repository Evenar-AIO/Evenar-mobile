import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  tone?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent';
  type?: 'display' | 'title' | 'subtitle' | 'body' | 'bodySemiBold' | 'caption' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  tone = 'primary',
  type = 'body',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, toneToColor[tone]);

  return (
    <Text
      style={[
        { color },
        type === 'body' ? styles.body : undefined,
        type === 'bodySemiBold' ? styles.bodySemiBold : undefined,
        type === 'display' ? styles.display : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const toneToColor = {
  primary: 'text',
  secondary: 'textSecondary',
  muted: 'textMuted',
  inverse: 'textInverse',
  accent: 'accent',
} as const;

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  display: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    lineHeight: 22,
    fontSize: 15,
    fontWeight: '600',
  },
});
