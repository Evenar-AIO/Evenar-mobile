import { request } from '@/services/apiClient';

export const cartService = {
  getCart: () => request('/cart'),
  addToCart: (payload: { eventId: string; ticketInfoId: string; quantity: number }) =>
    request('/cart', { method: 'POST', body: payload }),
  updateItem: (ticketInfoId: string, quantity: number) =>
    request(`/cart/${ticketInfoId}`, { method: 'PUT', body: { quantity } }),
  removeItem: (ticketInfoId: string) => request(`/cart/${ticketInfoId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
};
