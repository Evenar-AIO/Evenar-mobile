import { useCallback } from 'react';

import type { LoginRequest } from '@/features/auth/types/authTypes';
import { authService } from '@/services/api';
import { ApiError } from '@/services/apiClient';
import { useAuthStore } from '@/store/hooks';

export function useAuthActions() {
  const { setSession, setLoading, setError, logout, clearSession } = useAuthStore();

  const login = useCallback(
    async (payload: LoginRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.login(payload);
        await setSession({ user: response.user, accessToken: response.tokens.accessToken });
        return response;
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
          throw error;
        }

        setError('Đăng nhập thất bại. Vui lòng thử lại.');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setSession],
  );

  const logoutAction = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout, setError, setLoading]);

  const clearSessionAction = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  return {
    login,
    logoutAction,
    clearSessionAction,
  };
}
