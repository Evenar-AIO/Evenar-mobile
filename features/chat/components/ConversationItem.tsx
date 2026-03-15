import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Conversation } from "../types";

interface Props {
  item: Conversation;
  currentUserId: number;
  onPress: () => void;
}

export function ConversationItem({ item, currentUserId, onPress }: Props) {
  const otherName = item.otherUser?.username ?? "Unknown";
  const lastText = item.lastMessage?.content ?? "Chưa có tin nhắn";
  const hasUnread = (item.unreadCount ?? 0) > 0;
  const isLastMine = item.lastMessage?.senderId === currentUserId;

  const timeLabel = item.lastMessageAt ? formatTime(item.lastMessageAt) : "";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrap}>
        {item.otherUser?.avatar ? (
          <Image
            source={{ uri: item.otherUser.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>
              {otherName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.status === "active" && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, hasUnread && styles.bold]}
            numberOfLines={1}
          >
            {otherName}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {item.subject}
        </Text>
        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMsg, hasUnread && styles.bold]}
            numberOfLines={1}
          >
            {isLastMine ? "Bạn: " : ""}
            {lastText}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("vi-VN", { weekday: "short" });
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: {
    backgroundColor: "#0a7ea4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 20, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
  },
  content: { flex: 1, gap: 2 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 15, color: "#11181C", flex: 1 },
  subject: { fontSize: 12, color: "#687076" },
  time: { fontSize: 12, color: "#687076", marginLeft: 8 },
  bottomRow: { flexDirection: "row", alignItems: "center" },
  lastMsg: { fontSize: 13, color: "#687076", flex: 1 },
  bold: { fontWeight: "700", color: "#11181C" },
  badge: {
    backgroundColor: "#0a7ea4",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
