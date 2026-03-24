import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { Platform } from 'react-native';

import type { User } from '@/features/auth/types/authTypes';
import { authService } from '@/services/api';
import { setAuthToken } from '@/services/apiClient';
import { authReducer, initialAuthState, type AuthState } from '@/store/slices/authSlice';

const TOKEN_KEY = 'auth_access_token';
const USER_KEY = 'auth_user';

import AsyncStorage from '@react-native-async-storage/async-storage';

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  if (key === TOKEN_KEY) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  if (key === TOKEN_KEY) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function deleteStorageItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  if (key === TOKEN_KEY) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

interface AuthStoreContextValue {
  state: AuthState;
  hydrateSession: () => Promise<void>;
  setSession: (payload: { user: User; accessToken: string }) => Promise<void>;
  clearSession: () => Promise<void>;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  logout: () => Promise<void>;
}

const AuthStoreContext = createContext<AuthStoreContextValue | undefined>(undefined);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const hydrateSession = useCallback(async () => {
    dispatch({ type: 'HYDRATE_START' });

    const [token, rawUser] = await Promise.all([getStorageItem(TOKEN_KEY), getStorageItem(USER_KEY)]);

    const user = rawUser ? (JSON.parse(rawUser) as User) : null;

    setAuthToken(token);

    dispatch({
      type: 'HYDRATE_DONE',
      payload: {
        user,
        accessToken: token,
      },
    });
  }, []);

  const setSession = useCallback(async ({ user, accessToken }: { user: User; accessToken: string }) => {
    await Promise.all([setStorageItem(TOKEN_KEY, accessToken), setStorageItem(USER_KEY, JSON.stringify(user))]);

    setAuthToken(accessToken);
    dispatch({ type: 'SET_SESSION', payload: { user, accessToken } });
  }, []);

  const clearSession = useCallback(async () => {
    // Clear everything from storage
    if (Platform.OS === 'web') {
      localStorage.clear();
    } else {
      await Promise.all([
        AsyncStorage.clear(),
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    }

    setAuthToken(null);
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  const setLoading = useCallback((value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: value });
  }, []);

  const setError = useCallback((message: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: message });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore and clear local session anyway
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      state,
      hydrateSession,
      setSession,
      clearSession,
      setLoading,
      setError,
      logout,
    }),
    [state, hydrateSession, setSession, clearSession, setLoading, setError, logout],
  );

  return React.createElement(AuthStoreContext.Provider, { value }, children);
}

export function useAuthStore() {
  const context = useContext(AuthStoreContext);

  if (!context) {
    throw new Error('useAuthStore must be used inside AppStoreProvider');
  }

  return context;
}
