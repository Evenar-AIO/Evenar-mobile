import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface AuthFormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
}

export function AuthFormField({ label, error, secureTextEntry, ...inputProps }: AuthFormFieldProps) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const borderColor = error ? '#EF4444' : (isFocused ? '#7C3AED' : '#334155');
  const shouldMask = secureTextEntry ? !isSecureVisible : false;

  return (
    <View style={styles.wrapper}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      <View style={[
        styles.inputContainer, 
        { borderColor },
        isFocused && styles.inputFocused,
        error ? styles.inputError : null
      ]}>
        <TextInput
          placeholderTextColor="#64748B"
          style={styles.input}
          secureTextEntry={shouldMask}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor="#7C3AED"
          {...inputProps}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setIsSecureVisible((prev) => !prev)} style={styles.eyeIcon}>
             <Ionicons 
                name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color="#64748B" 
             />
          </TouchableOpacity>
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
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  inputContainer: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Surface0
  },
  inputFocused: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginLeft: 4,
  },
});
