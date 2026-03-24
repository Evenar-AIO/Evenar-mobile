import { request } from '@/services/apiClient';

export const promotionService = {
  validatePromo: (payload: { code: string }) =>
    request('/promotions/validate', { method: 'POST', body: payload }),
};
