import { request } from '@/services/apiClient';

export const orderService = {
  createOrder: (payload: Record<string, unknown>) => request('/orders', { method: 'POST', body: payload }),
  getOrders: (params?: Record<string, string | number>) =>
    request(`/orders${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
};
