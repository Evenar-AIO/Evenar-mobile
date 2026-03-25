import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

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
  const [isSuccess, setIsSuccess] = useState(false);

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
      
      // artificial delay to increase UX feel
      setTimeout(() => {
        setLoading(false);
        setIsSuccess(true);
      }, 1000);

    } catch (error) {
      setLoading(false);
      setGlobalError(mapApiError(error, 'Xác thực OTP thất bại.'));
    }
  };

  const handleGoToLogin = () => {
    setIsSuccess(false);
    router.replace('/login');
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
          <ThemedText style={styles.headerTitle}>Xác thực OTP</ThemedText>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-unread-outline" size={60} color="#7C3AED" />
            </View>
            <ThemedText style={styles.title}>Kiểm tra email</ThemedText>
            <ThemedText style={styles.subtitle}>
              Chúng tôi đã gửi mã xác thực đến {'\n'}
              <ThemedText style={styles.emailHighlight}>{email}</ThemedText>
            </ThemedText>
          </View>

          <View style={styles.otpSection}>
            <OtpInput value={otp} onChangeValue={setOtp} error={otpError} />
            {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}
          </View>

          <View style={styles.footer}>
            <AuthButton title="Xác nhận" onPress={onVerify} loading={loading} />
            
            <TouchableOpacity style={styles.resendButton} onPress={() => {}}>
              <ThemedText style={styles.resendText}>Chưa nhận được mã? </ThemedText>
              <ThemedText style={styles.resendLink}>Gửi lại</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.modalContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            
            <View style={styles.modalTextContainer}>
              <ThemedText style={styles.modalTitle}>Xác thực thành công!</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Tài khoản của bạn đã sẵn sàng. Vui lòng đăng nhập lại để bắt đầu sử dụng dịch vụ.
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.loginModalButton} onPress={handleGoToLogin}>
              <ThemedText style={styles.loginModalButtonText}>Đăng nhập ngay</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Loading Overlay for artificial delay */}
      {loading && (
        <Animated.View entering={FadeIn} style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Đang xử lý...</ThemedText>
        </Animated.View>
      )}
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    gap: 16,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  otpSection: {
    gap: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  footer: {
    gap: 20,
  },
  resendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  resendLink: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTextContainer: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  loginModalButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    width: '100%',
  },
  loginModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Artificial Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 999,
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
});
