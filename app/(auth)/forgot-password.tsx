import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { mapApiError } from '@/features/auth/utils/errorMapper';
import { validateEmail } from '@/features/auth/utils/validators';
import { authService } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const validationError = validateEmail(email);
    setEmailError(validationError);

    if (validationError) return;

    setLoading(true);
    setGlobalError(null);

    try {
      await authService.forgotPassword({ email: email.trim() });
      router.push({ pathname: '/reset-password-otp', params: { email: email.trim() } });
    } catch (error) {
      setGlobalError(mapApiError(error, 'Gửi yêu cầu quên mật khẩu thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Quên mật khẩu
        </ThemedText>
        <ThemedText style={styles.subtitle}>Nhập email để nhận mã OTP đặt lại mật khẩu.</ThemedText>
      </View>

      <View style={styles.form}>
        <AuthFormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          error={emailError}
        />

        {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

        <AuthButton title="Tiếp tục" onPress={onSubmit} loading={loading} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 36,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA4B2',
  },
  form: {
    gap: 14,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
});
