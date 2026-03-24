import { request } from '@/services/apiClient';

export const supportService = {
  submitTicket: (payload: Record<string, unknown>) =>
    request('/support/submit', { method: 'POST', body: payload }),
  listTickets: () => request('/support/list'),
};
