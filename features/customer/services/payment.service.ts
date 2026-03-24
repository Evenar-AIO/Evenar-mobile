import { request } from '@/services/apiClient';

export const paymentService = {
  createPayment: (payload: Record<string, unknown>) =>
    request('/payments', { method: 'POST', body: payload }),
  confirmPayment: (payload: Record<string, unknown>) =>
    request('/payments/confirm', { method: 'POST', body: payload }),
};
