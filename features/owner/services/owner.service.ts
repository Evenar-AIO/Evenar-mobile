import { request } from '@/services/apiClient';

export const ownerService = {
  getStats: () => request('/owner/stats'),
  getRevenue: () => request('/owner/revenue'),
  getAnalytics: (period: number = 7) => request(`/owner/analytics?period=${period}`),
  requestOrganizer: (payload: Record<string, unknown>) =>
    request('/organizer/request', { method: 'POST', body: payload }),
  getOrganizerRequest: () => request('/organizer/my-request'),
};
