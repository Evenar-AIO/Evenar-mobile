import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { OtpInput } from '@/features/auth/components/OtpInput';
import { mapApiError } from '@/features/auth/utils/errorMapper';
import { validateEmail, validateOtp } from '@/features/auth/utils/validators';
import { authService } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignupVerifyOtpScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    const emailError = validateEmail(email);
    const otpErr = validateOtp(otp);

    setOtpError(otpErr);

    if (emailError || otpErr) {
      setGlobalError(emailError ?? null);
      return;
    }

    setLoading(true);
    setGlobalError(null);

    try {
      await authService.verify({ email, otp });
      router.replace('/login');
    } catch (error) {
      setGlobalError(mapApiError(error, 'Xác thực OTP thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Xác thực OTP
        </ThemedText>
        <ThemedText style={styles.subtitle}>Bước 3/3: Nhập mã OTP đã gửi về {email}.</ThemedText>
      </View>

      <OtpInput value={otp} onChangeValue={setOtp} error={otpError} />

      {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

      <AuthButton title="Xác thực" onPress={onVerify} loading={loading} />
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
});
