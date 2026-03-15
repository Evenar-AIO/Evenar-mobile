import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import { StarRating } from "./StarRating";
import type { Feedback } from "../types";

interface Props {
  item: Feedback;
}

export function FeedbackCard({ item }: Props) {
  const date = new Date(item.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {item.user?.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>
              {(item.user?.username ?? "U").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.username}>
            {item.user?.username ?? "Ẩn danh"}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <StarRating value={item.rating} size={18} readonly />
      </View>

      <Text style={styles.content}>{item.content}</Text>

      {item.adminResponse && (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Phản hồi từ ban tổ chức:</Text>
          <Text style={styles.responseText}>{item.adminResponse}</Text>
        </View>
      )}
    </View>
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
    gap: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    backgroundColor: "#0a7ea4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerInfo: { flex: 1 },
  username: { fontSize: 14, fontWeight: "600", color: "#11181C" },
  date: { fontSize: 12, color: "#687076", marginTop: 2 },
  content: { fontSize: 14, color: "#374151", lineHeight: 21 },
  responseBox: {
    backgroundColor: "#f0f7fb",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#0a7ea4",
    gap: 4,
  },
  responseLabel: { fontSize: 12, fontWeight: "600", color: "#0a7ea4" },
  responseText: { fontSize: 13, color: "#374151" },
});
