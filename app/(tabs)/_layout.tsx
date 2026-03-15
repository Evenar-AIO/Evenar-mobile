import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { getNotifications } from '@/features/notification/services/notificationService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { connectSocket } from '@/services/socket';
import type { Socket } from 'socket.io-client';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const { user } = useAuth();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const isAdmin = user?.role === 'admin';
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    getNotifications({ page: 1, limit: 1 })
      .then((res) => setUnreadCount(res.unreadCount))
      .catch(() => {});
  }, [setUnreadCount]);

  useEffect(() => {
    if (!user?.userId) return;
    let mounted = true;

    const eventName = `notification_${user.userId}`;
    const refreshUnread = () => {
      getNotifications({ page: 1, limit: 1 })
        .then((res) => { if (mounted) setUnreadCount(res.unreadCount); })
        .catch(() => {});
    };

    connectSocket()
      .then((socket) => {
        if (!mounted) return;
        socketRef.current = socket;
        socket.on(eventName, refreshUnread);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      if (socketRef.current) socketRef.current.off(eventName, refreshUnread);
    };
  }, [user?.userId, setUnreadCount]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: isAdmin ? null : undefined,
          title: 'Tin nhắn',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Hỗ trợ',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="questionmark.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="bell.fill" color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
