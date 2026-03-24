import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface OtpInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  error?: string | null;
}

export function OtpInput({ value, onChangeValue, error }: OtpInputProps) {
  const borderColor = useThemeColor({ light: '#D0D5DD', dark: '#2A2E37' }, 'icon');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.wrapper}>
      <ThemedText type="defaultSemiBold">Mã OTP</ThemedText>
      <TextInput
        value={value}
        onChangeText={(text) => onChangeValue(text.replace(/[^0-9]/g, '').slice(0, 6))}
        placeholder="Nhập 6 chữ số"
        keyboardType="number-pad"
        maxLength={6}
        style={[styles.input, { borderColor, color: textColor }]}
        placeholderTextColor="#8B95A1"
      />
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    letterSpacing: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    lineHeight: 18,
  },
});
