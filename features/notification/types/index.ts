export type NotificationType = 'order' | 'message' | 'event' | 'support' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  _id: string;
  userId: number;
  title: string;
  content: string;
  notificationType: NotificationType;
  relatedId: number | null;
  isRead: boolean;
  readAt: string | null;
  priority: NotificationPriority;
  createdAt: string;
  expiresAt: string | null;
}
