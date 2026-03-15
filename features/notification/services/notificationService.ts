import { apiRequest } from "@/services/api";
import type { Notification } from "../types";

interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationListResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 20));
  if (params?.unreadOnly) query.set("unreadOnly", "true");
  return apiRequest(`/notifications?${query.toString()}`);
}

export async function markAsRead(id: string | "all"): Promise<void> {
  await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}
