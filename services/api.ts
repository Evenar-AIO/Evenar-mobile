import { authService } from '@/features/auth/services/authService';
import { ApiError, request } from '@/services/apiClient';

type ApiResponse<T> = { data: T };

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const data = await request<T>(endpoint, {
    method: options.method ?? 'GET',
    body: options.body,
  });

  return { data };
}

const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) => apiRequest<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown) => apiRequest<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError, authService };
export default api;
