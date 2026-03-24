import { request } from '@/services/apiClient';

export const adminService = {
  getDashboard: () => request('/admin/dashboard'),
  getUsers: (params?: Record<string, string | number | boolean>) =>
    request(`/admin/users${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
  lockUser: (id: string) => request(`/admin/users/${id}/lock`, { method: 'POST' }),
  unlockUser: (id: string) => request(`/admin/users/${id}/unlock`, { method: 'POST' }),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getEvents: (params?: Record<string, string | number | boolean>) =>
    request(`/admin/events${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
  getEventById: (id: string) => request(`/admin/events/${id}`),
  updateEvent: (id: string, payload: Record<string, unknown>) =>
    request(`/admin/events/${id}`, { method: 'PUT', body: payload }),
  approveEvent: (id: string) => request(`/admin/events/${id}/approve`, { method: 'POST' }),
  deleteEvent: (id: string) => request(`/admin/events/${id}`, { method: 'DELETE' }),
  getTransactions: (params?: Record<string, string | number | boolean>) =>
    request(
      `/admin/transactions${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`,
    ),
  getRevenueDaily: (params?: Record<string, string | number | boolean>) =>
    request(
      `/admin/revenue-daily${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`,
    ),
  getRefunds: (params?: Record<string, string | number | boolean>) =>
    request(`/admin/refunds${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
  getRefundById: (id: string) => request(`/admin/refunds/${id}`),
  processRefund: (refundId: string, status: string) =>
    request('/admin/refunds/process', { method: 'POST', body: { refundId, status } }),
  getSupport: (params?: Record<string, string | number | boolean>) =>
    request(`/admin/support${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
  updateSupport: (id: string, payload: Record<string, unknown>) =>
    request(`/admin/support/${id}`, { method: 'PUT', body: payload }),
  getAuditLogs: (params?: Record<string, string | number | boolean>) =>
    request(`/admin/audit-logs${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
  exportStats: (params?: Record<string, string | number | boolean>) =>
    request(`/admin/stats/export${params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''}`),
  getOrganizerRequests: (status?: string) =>
    request(`/admin/organizer-requests${status ? `?status=${status}` : ''}`),
  processOrganizerRequest: (id: string, status: string, rejectionReason?: string) =>
    request(`/admin/organizer-requests/${id}/process`, {
      method: 'POST',
      body: { status, rejectionReason },
    }),
};
