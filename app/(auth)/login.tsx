import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, SafeAreaView, Text, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { WebView } from 'react-native-webview';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { mapApiError } from '@/features/auth/utils/errorMapper';
import { validateEmail, validatePassword } from '@/features/auth/utils/validators';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authService } from '@/services/api';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthStore } from '@/store/hooks';

export default function LoginScreen() {
  const { login } = useAuthActions();
  const { state, setSession } = useAuthStore();

  const { token: urlToken, role: urlRole } = useLocalSearchParams<{ token?: string; role?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Handle URL params (OAuth redirect)
  useEffect(() => {
    if (urlToken && urlRole) {
        handleUrlLogin(urlToken, urlRole);
    }
  }, [urlToken, urlRole]);

  const handleUrlLogin = async (token: string, roleStr: string) => {
    try {
        const { setAuthToken: setToken } = await import('@/services/apiClient');
        setToken(token);
        const userInfo: any = await authService.getMe();
        const realUser = userInfo?.id ? userInfo : userInfo?.data;
        
        await setSession({ 
            user: realUser || { id: 'google', email: '...', role: roleStr as any }, 
            accessToken: token 
        });

        const target = roleStr === 'admin' ? '/admin' : (roleStr === 'organizer' || roleStr === 'event_owner') ? '/owner' : '/(tabs)';
        router.replace(target);
    } catch (err) {
        console.error('URL Login failed', err);
    }
  };
  
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);

  const onLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    try {
      const response = await login({ email: email.trim(), password });
      setPassword('');
      if (response.user.role === 'admin') {
        router.replace('/admin');
      } else if (response.user.role === 'organizer' || response.user.role === 'event_owner') {
        router.replace('/owner');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setGlobalError(mapApiError(error, 'Đăng nhập thất bại.'));
    }
  };

  const onGoogleLogin = async () => {
    try {
      const response = await authService.loginGoogle();

      if (response.tokens?.accessToken && response.user) {
        await setSession({ user: response.user, accessToken: response.tokens.accessToken });
        const role = response.user.role;
        const target = role === 'admin' ? '/admin' : (role === 'organizer' || role === 'event_owner') ? '/owner' : '/(tabs)';
        router.replace(target);
        return;
      }

      if (response.url) {
        if (Platform.OS === 'web') {
          window.location.href = response.url;
          return;
        }

        setGoogleAuthUrl(response.url);
        setShowGoogleAuth(true);
        return;
      }

      setGlobalError('Google OAuth chưa trả về phiên đăng nhập.');
    } catch (error) {
      setGlobalError(mapApiError(error, 'Đăng nhập Google thất bại.'));
    }
  };

  const handleGoogleNavigation = async (navState: any) => {
    const urlStr = navState.url;
    const hasToken = urlStr.includes('token=');
    const hasRole = urlStr.includes('role=');

    if (hasToken && hasRole) {
      setShowGoogleAuth(false);
      const tokenMatch = urlStr.match(/token=([^&]+)/);
      const roleMatch = urlStr.match(/role=([^&]+)/);
      
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const roleStr = roleMatch ? roleMatch[1] : 'customer';
        
        setGlobalError(null);
        try {
            const { setAuthToken: setToken } = await import('@/services/apiClient');
            setToken(token);
            const userInfo: any = await authService.getMe();
            const realUser = userInfo?.id ? userInfo : userInfo?.data;
            
            await setSession({ 
                user: realUser || { id: 'google', email: '...', role: roleStr as any }, 
                accessToken: token 
            });

            const target = roleStr === 'admin' ? '/admin' : (roleStr === 'organizer' || roleStr === 'event_owner') ? '/owner' : '/(tabs)';
            router.replace(target);
        } catch (err) {
            console.error('Fetch user after google login failed', err);
            setGlobalError('Lỗi khi tải thông tin người dùng Google.');
        }
      }
    } else if (urlStr.includes('error=')) {
      setShowGoogleAuth(false);
      setGlobalError('Đăng nhập Google bị từ chối hoặc thất bại.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Header with Illustration & Title */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Đăng nhập</ThemedText>
          <View style={styles.dogContainer}>
             <Ionicons name="paw" size={60} color="#FACC15" />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <AuthFormField
              label="Email hoặc số điện thoại"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              error={errors.email}
              placeholder="Nhập email hoặc số điện thoại"
            />

            <AuthFormField
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              placeholder="Nhập mật khẩu"
            />

            <TouchableOpacity 
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <ThemedText style={styles.linkText}>Quên mật khẩu?</ThemedText>
            </TouchableOpacity>

            {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

            <View style={styles.buttonGroup}>
              <AuthButton 
                title="Đăng nhập" 
                onPress={onLogin} 
                loading={state.loading} 
              />
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>Hoặc</ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <AuthButton 
                title="Đăng nhập bằng Google" 
                onPress={onGoogleLogin} 
                variant="secondary"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
            <Link href="/signup-role" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.footerLink}>Tạo tài khoản ngay</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
          
          <ThemedText style={styles.legalText}>
            Bằng việc tiếp tục, bạn đã đọc và đồng ý với <ThemedText style={styles.legalLink}>Điều khoản sử dụng</ThemedText> và <ThemedText style={styles.legalLink}>Chính sách bảo mật</ThemedText>.
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS !== 'web' && (
        <Modal visible={showGoogleAuth} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
              <TouchableOpacity onPress={() => setShowGoogleAuth(false)}>
                <Text style={{ fontSize: 16, color: '#22C55E', fontWeight: '700' }}>HỦY</Text>
              </TouchableOpacity>
            </View>
            {googleAuthUrl && (
              <WebView
                source={{ uri: googleAuthUrl }}
                onNavigationStateChange={handleGoogleNavigation}
                startInLoadingState
              />
            )}
          </SafeAreaView>
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Main Dark Background
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#7C3AED', // Brand Purple Header
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  closeButton: {
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
  },
  dogContainer: {
    marginRight: -10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formContainer: {
    gap: 12,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footerLink: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 15,
  },
  legalText: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  legalLink: {
    color: '#7C3AED',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonGroup: {
    gap: 16,
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
