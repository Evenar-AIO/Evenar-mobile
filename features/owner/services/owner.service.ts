import { request } from '@/services/apiClient';

export const ownerService = {
  getStats: () => request('/owner/stats'),
  getRevenue: () => request('/owner/revenue'),
  getAnalytics: () => request('/owner/analytics'),
  getBuyers: () => request('/owner/buyers'),
  requestOrganizer: (payload: Record<string, unknown>) =>
    request('/organizer/request', { method: 'POST', body: payload }),
  getOrganizerRequest: () => request('/organizer/my-request'),
};
