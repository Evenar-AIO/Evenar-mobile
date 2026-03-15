import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/authStore";
import { getConversations } from "@/features/chat/services/chatService";
import { ConversationItem } from "@/features/chat/components/ConversationItem";
import {
  connectSocket,
  joinUserRoom,
  leaveUserRoom,
  joinConversation,
  leaveConversation,
} from "@/services/socket";
import type { Conversation } from "@/features/chat/types";
import type { Socket } from "socket.io-client";

export default function ChatScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<number[]>([]);
  const onNewMessageRef = useRef<(() => void) | null>(null);
  const onNewConversationRef = useRef<(() => void) | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const res = await getConversations(1);
      setConversations(res.data);

      joinedRoomsRef.current.forEach((id) => leaveConversation(id));
      const roomIds = res.data.map((c) => c.legacyId);
      roomIds.forEach((id) => joinConversation(id));
      joinedRoomsRef.current = roomIds;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể tải hội thoại");
    }
  }, []);

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false));
  }, [fetchConversations]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      const pollInterval = setInterval(fetchConversations, 3_000);
      return () => clearInterval(pollInterval);
    }, [fetchConversations]),
  );

  useEffect(() => {
    if (!user?.userId) return;
    let mounted = true;

    const joinAllRooms = () => {
      joinUserRoom(user.userId);
      joinedRoomsRef.current.forEach((id) => joinConversation(id));
    };

    connectSocket()
      .then((socket) => {
        if (!mounted) return;
        socketRef.current = socket;

        joinAllRooms();

        onNewConversationRef.current = () => {
          if (mounted) fetchConversations();
        };
        onNewMessageRef.current = () => {
          if (mounted) fetchConversations();
        };

        socket.on("new_conversation", onNewConversationRef.current);
        socket.on("new_message", onNewMessageRef.current);
        socket.on(`notification_${user.userId}`, onNewMessageRef.current);

        socket.on("connect", joinAllRooms);
      })
      .catch(console.error);

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.off("connect", joinAllRooms);
        if (onNewConversationRef.current)
          socketRef.current.off(
            "new_conversation",
            onNewConversationRef.current,
          );
        if (onNewMessageRef.current) {
          socketRef.current.off("new_message", onNewMessageRef.current);
          socketRef.current.off(
            `notification_${user.userId}`,
            onNewMessageRef.current,
          );
        }
      }
      leaveUserRoom(user.userId);
      joinedRoomsRef.current.forEach((id) => leaveConversation(id));
      joinedRoomsRef.current = [];
    };
  }, [user?.userId, fetchConversations]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }

  if (user?.role === "admin") {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={52} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Không có quyền truy cập</Text>
          <Text style={styles.emptySubtitle}>
            Tính năng nhắn tin không dành cho tài khoản Admin
          </Text>
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity
          style={styles.composeBtn}
          onPress={() => router.push("/chat/new")}
        >
          <Ionicons name="create-outline" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchConversations}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.legacyId)}
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            currentUserId={user?.userId ?? 0}
            onPress={() => {
              setConversations((prev) =>
                prev.map((c) =>
                  c.legacyId === item.legacyId ? { ...c, unreadCount: 0 } : c,
                ),
              );
              router.push(`/chat/${item.legacyId}`);
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0a7ea4"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Chưa có hội thoại nào</Text>
            <Text style={styles.emptySubtitle}>
              Nhấn vào nút bút để bắt đầu chat với ban tổ chức sự kiện
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
  composeBtn: { padding: 4 },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: { color: "#ef4444", fontSize: 13, flex: 1 },
  retryText: {
    color: "#0a7ea4",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
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
