import { create } from 'zustand';

import { notificationService } from '@/features/customer/services/notification.service';

type NotificationItem = {
  _id: string;
  title?: string;
  content?: string;
  isRead?: boolean;
};

type NotificationState = {
  items: NotificationItem[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data: any = await notificationService.getNotifications();
      set({ items: data?.data ?? data ?? [] });
    } finally {
      set({ loading: false });
    }
  },
  markRead: async (id) => {
    await notificationService.markRead(id);
    const items = get().items.map((item) =>
      item._id === id ? { ...item, isRead: true } : item
    );
    set({ items });
  },
}));
