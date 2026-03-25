import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

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
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Quên mật khẩu</ThemedText>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-open-outline" size={60} color="#22C55E" />
            </View>
            <ThemedText style={styles.subtitle}>
              Vui lòng nhập email của bạn để nhận mã xác minh khôi phục mật khẩu.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <AuthFormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Nhập email của bạn"
              error={emailError}
            />

            {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

            <View style={{ marginTop: 24 }}>
              <AuthButton 
                title="Gửi mã xác minh" 
                onPress={onSubmit} 
                loading={loading} 
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <ThemedText style={styles.footerLink}>Quay lại đăng nhập</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerLink: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 16,
  },
});
