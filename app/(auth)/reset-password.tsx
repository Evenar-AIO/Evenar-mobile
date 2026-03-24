import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { mapApiError } from '@/features/auth/utils/errorMapper';
import { validateConfirmPassword, validateEmail, validatePassword, validateOtp } from '@/features/auth/utils/validators';
import { authService } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const otp = typeof params.otp === 'string' ? params.otp : '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string | null; confirmPassword?: string | null }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onResetPassword = async () => {
    const emailError = validateEmail(email);
    const otpError = validateOtp(otp);
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);

    setErrors({ newPassword: passwordError, confirmPassword: confirmError });

    if (emailError || otpError || passwordError || confirmError) {
      setGlobalError(emailError ?? otpError ?? null);
      return;
    }

    setLoading(true);
    setGlobalError(null);

    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });

      setNewPassword('');
      setConfirmPassword('');
      router.replace('/login');
    } catch (error) {
      setGlobalError(mapApiError(error, 'Đặt lại mật khẩu thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Đặt lại mật khẩu
        </ThemedText>
        <ThemedText style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn.</ThemedText>
      </View>

      <View style={styles.form}>
        <AuthFormField
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu mới"
          error={errors.newPassword}
        />
        <AuthFormField
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword}
        />

        {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

        <AuthButton title="Cập nhật mật khẩu" onPress={onResetPassword} loading={loading} />
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
