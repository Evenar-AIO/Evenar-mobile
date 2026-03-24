import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { Link, router } from 'expo-router';
import { useState } from 'react';
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  
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
        router.replace('/admin/dashboard');
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
        router.replace(response.user.role === 'admin' ? '/admin/dashboard' : '/(tabs)');
        return;
      }

      if (response.url) {
        if (Platform.OS === 'web') {
          const result = await WebBrowser.openAuthSessionAsync(response.url, 'http://localhost:5174');
          if (result.type === 'success' && result.url) {
            const urlStr = result.url;
            const tokenMatch = urlStr.match(/token=([^&]+)/);
            const roleMatch = urlStr.match(/role=([^&]+)/);
            if (tokenMatch && tokenMatch[1]) {
              const token = tokenMatch[1];
              const roleStr = roleMatch ? roleMatch[1] : 'Customer';
              const userObj = { id: 'google', email: 'GoogleUser', role: roleStr as any };
              await setSession({ user: userObj, accessToken: token });
              router.replace(roleStr === 'admin' ? '/admin/dashboard' : '/(tabs)');
              return;
            }
          }
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
    if (urlStr.startsWith('http://localhost:5174')) {
      setShowGoogleAuth(false);
      const tokenMatch = urlStr.match(/token=([^&]+)/);
      const roleMatch = urlStr.match(/role=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        const roleStr = roleMatch ? roleMatch[1] : 'Customer';
        const userObj = { id: 'google', email: 'GoogleUser', role: roleStr as any };
        await setSession({ user: userObj, accessToken: token });
        router.replace(roleStr === 'admin' ? '/admin/dashboard' : '/(tabs)');
      } else if (urlStr.includes('error=')) {
        setGlobalError('Đăng nhập Google thất bại.');
      }
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
