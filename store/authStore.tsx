import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'event_owner' | 'customer';

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('auth_user'),
        ]);
        if (token && userJson) {
          setState({ token, user: JSON.parse(userJson), isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  async function login(token: string, user: AuthUser) {
    await Promise.all([
      AsyncStorage.setItem('auth_token', token),
      AsyncStorage.setItem('auth_user', JSON.stringify(user)),
    ]);
    setState({ token, user, isLoading: false });
  }

  async function logout() {
    await Promise.all([
      AsyncStorage.removeItem('auth_token'),
      AsyncStorage.removeItem('auth_user'),
    ]);
    setState({ token: null, user: null, isLoading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
