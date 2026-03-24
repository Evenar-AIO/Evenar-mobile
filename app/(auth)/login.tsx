import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, SafeAreaView, Text, Platform } from 'react-native';

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
          // On Web, use direct redirect instead of popup to avoid "new tab" desync issues.
          // The useEffect at the top will handle the token when we redirect back.
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
    
    // Detect completion by checking for token in query params
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
        // We temporarily don't have the user object yet, so we fetch it
        try {
            // Set token manually for the immediate getMe call
            const { setAuthToken: setToken } = await import('@/services/apiClient');
            setToken(token);
            
            const userInfo: any = await authService.getMe();
            // User info might be in userInfo.data based on API structure
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
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Đăng nhập
        </ThemedText>
        <ThemedText style={styles.subtitle}>Đăng nhập để tiếp tục quản lý vé sự kiện.</ThemedText>
      </View>

      <View style={styles.form}>
        <AuthFormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
          placeholder="you@example.com"
        />

        <AuthFormField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
          placeholder="Nhập mật khẩu"
        />

        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
          <ThemedText style={styles.linkText}>Quên mật khẩu?</ThemedText>
        </TouchableOpacity>

        {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

        <AuthButton title="Đăng nhập" onPress={onLogin} loading={state.loading} />
        <AuthButton title="Đăng nhập với Google" onPress={onGoogleLogin} variant="secondary" />
      </View>

      <View style={styles.footer}>
        <ThemedText>Bạn chưa có tài khoản? </ThemedText>
        <Link href="/signup-role" asChild>
          <TouchableOpacity>
            <ThemedText style={styles.linkText}>Đăng ký</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {Platform.OS !== 'web' && (
        <Modal visible={showGoogleAuth} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
              <TouchableOpacity onPress={() => setShowGoogleAuth(false)}>
                <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: '600' }}>Hủy</Text>
              </TouchableOpacity>
            </View>
            {googleAuthUrl && (
              <WebView
                source={{ uri: googleAuthUrl }}
                onNavigationStateChange={handleGoogleNavigation}
                startInLoadingState
                incognito={true}
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
  linkText: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
