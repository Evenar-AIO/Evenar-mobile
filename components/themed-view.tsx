import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  tone?: 'background' | 'surface0' | 'surface1' | 'surface2' | 'surface3';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  tone = 'background',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, tone);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
