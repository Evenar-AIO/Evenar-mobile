import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { RoleSelector } from '@/features/auth/components/RoleSelector';
import type { UserRole } from '@/features/auth/types/authTypes';
import { validateRole } from '@/features/auth/utils/validators';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SignupRoleScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>();
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    const roleError = validateRole(selectedRole);
    setError(roleError);

    if (roleError || !selectedRole) {
      return;
    }

    router.push({ pathname: '/signup-register', params: { role: selectedRole } });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Đăng ký
        </ThemedText>
        <ThemedText style={styles.subtitle}>Bước 1/3: Chọn vai trò tài khoản.</ThemedText>
      </View>

      <RoleSelector selectedRole={selectedRole} onChangeRole={setSelectedRole} error={error} />

      <AuthButton title="Tiếp tục" onPress={onContinue} />
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
});
