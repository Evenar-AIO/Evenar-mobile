import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface AuthFormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
}

export function AuthFormField({ label, error, secureTextEntry, ...inputProps }: AuthFormFieldProps) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor(
    { light: '#D0D5DD', dark: '#2A2E37' },
    'icon',
  );

  const shouldMask = secureTextEntry ? !isSecureVisible : false;

  return (
    <View style={styles.wrapper}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          placeholderTextColor="#8B95A1"
          style={[styles.input, { color: textColor }]}
          secureTextEntry={shouldMask}
          {...inputProps}
        />
        {secureTextEntry ? (
          <ThemedText style={styles.toggleText} onPress={() => setIsSecureVisible((prev) => !prev)}>
            {isSecureVisible ? 'Ẩn' : 'Hiện'}
          </ThemedText>
        ) : null}
      </View>
      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  inputContainer: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  toggleText: {
    fontSize: 14,
    color: '#6C5CE7',
    paddingLeft: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    lineHeight: 18,
  },
});
