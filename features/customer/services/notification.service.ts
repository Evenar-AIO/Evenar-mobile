import { request } from '@/services/apiClient';

export const notificationService = {
  getNotifications: () => request('/notifications'),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
};
