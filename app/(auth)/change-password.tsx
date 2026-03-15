import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { mapApiError } from '@/features/auth/utils/errorMapper';
import { validateConfirmPassword, validatePassword } from '@/features/auth/utils/validators';
import { authService } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChangePassword = async () => {
    const nextErrors = {
      oldPassword: validatePassword(oldPassword),
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setLoading(true);
    setGlobalError(null);

    try {
      await authService.changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.back();
    } catch (error) {
      setGlobalError(mapApiError(error, 'Đổi mật khẩu thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Đổi mật khẩu
        </ThemedText>
        <ThemedText style={styles.subtitle}>Cập nhật mật khẩu mới để bảo mật tài khoản.</ThemedText>
      </View>

      <View style={styles.form}>
        <AuthFormField
          label="Mật khẩu hiện tại"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu hiện tại"
          error={errors.oldPassword}
        />
        <AuthFormField
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu mới"
          error={errors.newPassword}
        />
        <AuthFormField
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu mới"
          error={errors.confirmPassword}
        />

        {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

        <AuthButton title="Cập nhật" onPress={onChangePassword} loading={loading} />
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
