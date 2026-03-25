import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';

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
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Header with Illustration */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>Chọn vai trò</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Bạn tham gia với tư cách nào?</ThemedText>
          </View>
          <View style={styles.illustrationContainer}>
            <Ionicons name="shield-checkmark-outline" size={50} color="rgba(255, 255, 255, 0.9)" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.selectorContainer}>
          <RoleSelector selectedRole={selectedRole} onChangeRole={setSelectedRole} error={error} />
        </View>

        <View style={styles.footer}>
          <AuthButton title="Tiếp tục" onPress={onContinue} />
          <ThemedText style={styles.hintText}>
            Bạn có thể thay đổi hoặc thêm vai trò sau trong phần cài đặt.
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  illustrationContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  selectorContainer: {
    flex: 1,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
