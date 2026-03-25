/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#7C3AED';
const tintColorDark = '#7C3AED';

export const Colors = {
  light: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#020617',
    background: '#020617',
    surface0: '#0F172A',
    surface1: '#1E293B',
    surface2: 'rgba(255, 255, 255, 0.08)',
    surface3: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.05)',
    borderBright: 'rgba(255, 255, 255, 0.12)',
    accent: '#7C3AED',
    accentAlt: '#F97316',
    tint: tintColorLight,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    success: '#22C55E',
    warning: '#F97316',
    danger: '#ef4444',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#020617',
    background: '#020617',
    surface0: '#0F172A',
    surface1: '#1E293B',
    surface2: 'rgba(255, 255, 255, 0.08)',
    surface3: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.05)',
    borderBright: 'rgba(255, 255, 255, 0.12)',
    accent: '#7C3AED',
    accentAlt: '#F97316',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorDark,
    success: '#22c55e',
    warning: '#F97316',
    danger: '#ef4444',
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
  soft: Platform.select({
    web: {
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  }),
  medium: Platform.select({
    web: {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.28)',
    },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.28,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  }),
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
