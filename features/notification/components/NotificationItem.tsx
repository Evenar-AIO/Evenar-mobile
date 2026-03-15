import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Notification, NotificationType } from "../types";

interface Props {
  item: Notification;
  onPress: () => void;
}

const TYPE_ICON: Record<
  NotificationType,
  { name: React.ComponentProps<typeof Ionicons>["name"]; color: string }
> = {
  order: { name: "receipt-outline", color: "#3b82f6" },
  message: { name: "chatbubble-outline", color: "#0a7ea4" },
  event: { name: "calendar-outline", color: "#8b5cf6" },
  support: { name: "help-circle-outline", color: "#f59e0b" },
  system: { name: "notifications-outline", color: "#6b7280" },
};

export function NotificationItem({ item, onPress }: Props) {
  const icon = TYPE_ICON[item.notificationType] ?? TYPE_ICON.system;
  const timeLabel = formatRelativeTime(item.createdAt);

  return (
    <TouchableOpacity
      style={[styles.container, !item.isRead && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${icon.color}18` }]}>
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, !item.isRead && styles.titleUnread]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.time}>{timeLabel}</Text>
      </View>

      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  unread: { backgroundColor: "#f0f7fb" },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, gap: 3 },
  title: { fontSize: 14, color: "#687076" },
  titleUnread: { fontWeight: "700", color: "#11181C" },
  body: { fontSize: 13, color: "#374151", lineHeight: 19 },
  time: { fontSize: 12, color: "#9BA1A6", marginTop: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0a7ea4",
    alignSelf: "center",
  },
});
