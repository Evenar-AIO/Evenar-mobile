/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#4f46e5';
const tintColorDark = '#a855f7';

export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    background: '#ffffff',
    surface0: 'rgba(15, 23, 42, 0.02)',
    surface1: 'rgba(15, 23, 42, 0.04)',
    surface2: 'rgba(15, 23, 42, 0.08)',
    surface3: 'rgba(15, 23, 42, 0.12)',
    border: 'rgba(15, 23, 42, 0.12)',
    borderBright: 'rgba(15, 23, 42, 0.2)',
    accent: '#6366f1',
    accentAlt: '#d946ef',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#f43f5e',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textInverse: '#07060f',
    background: '#07060f',
    surface0: 'rgba(255, 255, 255, 0.02)',
    surface1: 'rgba(255, 255, 255, 0.04)',
    surface2: 'rgba(255, 255, 255, 0.08)',
    surface3: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderBright: 'rgba(255, 255, 255, 0.15)',
    accent: '#6366f1',
    accentAlt: '#d946ef',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#f43f5e',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Typography = {
  display: 32,
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 13,
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
