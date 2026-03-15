import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NotificationItem } from "@/features/notification/components/NotificationItem";
import {
  getNotifications,
  markAsRead,
} from "@/features/notification/services/notificationService";
import { useNotificationStore } from "@/store/notificationStore";
import { connectSocket } from "@/services/socket";
import { useAuth } from "@/store/authStore";
import type { Notification } from "@/features/notification/types";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (pageNum = 1, replace = false) => {
      try {
        const res = await getNotifications({ page: pageNum });
        setNotifications((prev) =>
          replace ? res.data : [...prev, ...res.data],
        );
        setUnreadCount(res.unreadCount);
        setHasMore(pageNum < res.pagination.totalPages);
      } catch (e) {
        console.error(e);
      }
    },
    [setUnreadCount],
  );

  useEffect(() => {
    fetchNotifications(1, true).finally(() => setLoading(false));
  }, [fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(1, true);
    }, [fetchNotifications]),
  );

  useEffect(() => {
    let mounted = true;
    if (!user?.userId) return;

    let socketCleanup: (() => void) | null = null;
    connectSocket()
      .then((socket) => {
        if (!mounted) return;
        const eventName = `notification_${user.userId}`;
        const handler = () => {
          if (mounted) fetchNotifications(1, true);
        };
        socket.on(eventName, handler);
        socketCleanup = () => socket.off(eventName, handler);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      socketCleanup?.();
    };
  }, [fetchNotifications, user?.userId]);

  async function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    await fetchNotifications(1, true);
    setRefreshing(false);
  }

  async function handleMarkAllRead() {
    await markAsRead("all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleNotificationPress(item: Notification) {
    if (!item.isRead) {
      await markAsRead(item._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    }

    if (item.notificationType === "message" && item.relatedId) {
      router.push(`/chat/${item.relatedId}`);
    } else if (item.notificationType === "support") {
      router.push("/support");
    }
  }

  function handleLoadMore() {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchNotifications(next);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Thông báo
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}> ({unreadCount})</Text>
          )}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0a7ea4"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>Chưa có thông báo mới</Text>
            <Text style={styles.emptySubtitle}>
              Khi có thông báo về đơn hàng, tin nhắn hoặc sự kiện, chúng sẽ hiển
              thị tại đây
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#11181C" },
  unreadCount: { color: "#0a7ea4" },
  markAllText: { fontSize: 14, color: "#0a7ea4", fontWeight: "600" },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151" },
  emptySubtitle: {
    fontSize: 14,
    color: "#9BA1A6",
    textAlign: "center",
    lineHeight: 21,
  },
});
