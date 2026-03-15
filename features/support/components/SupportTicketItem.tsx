import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SupportTicket } from "../types";

interface Props {
  item: SupportTicket;
  onPress: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "time-outline" as const,
  },
  in_progress: {
    label: "Đang xử lý",
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "sync-outline" as const,
  },
  resolved: {
    label: "Đã giải quyết",
    color: "#22c55e",
    bg: "#dcfce7",
    icon: "checkmark-circle-outline" as const,
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Thấp", color: "#6b7280" },
  medium: { label: "Trung bình", color: "#f59e0b" },
  high: { label: "Cao", color: "#ef4444" },
  urgent: { label: "Khẩn cấp", color: "#dc2626" },
};

export function SupportTicketItem({ item, onPress }: Props) {
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium;
  const date = new Date(item.sendTimestamp).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Text style={styles.subject} numberOfLines={2}>
          {item.subject}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={13} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <Text style={styles.preview} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons name="pricetag-outline" size={12} color="#687076" />
            <Text style={styles.tagText}>{item.category}</Text>
          </View>
          <Text style={[styles.priority, { color: priority.color }]}>
            ● {priority.label}
          </Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>

      {item.adminResponse && (
        <View style={styles.replyIndicator}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={13}
            color="#0a7ea4"
          />
          <Text style={styles.replyText}>Có phản hồi từ hỗ trợ</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 1px 4px rgba(0,0,0,0.06)" },
    }),
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  subject: { flex: 1, fontSize: 15, fontWeight: "600", color: "#11181C" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  preview: { fontSize: 13, color: "#687076", lineHeight: 19 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tags: { flexDirection: "row", alignItems: "center", gap: 10 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4 },
  tagText: { fontSize: 12, color: "#687076" },
  priority: { fontSize: 12, fontWeight: "600" },
  date: { fontSize: 12, color: "#9BA1A6" },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  replyText: { fontSize: 12, color: "#0a7ea4", fontWeight: "500" },
});
