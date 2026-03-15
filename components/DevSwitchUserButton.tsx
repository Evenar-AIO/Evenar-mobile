import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/store/authStore";

const ROLE_EMOJI: Record<string, string> = {
  admin: "🛡️",
  event_owner: "🎪",
  customer: "👤",
};

export function DevSwitchUserButton() {
  const { user, logout } = useAuth();
  if (!user) return null;

  async function handleSwitch() {
    await logout();
    router.replace("/(auth)/dev-login");
  }

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={handleSwitch}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{ROLE_EMOJI[user.role] ?? "👤"}</Text>
      <Text style={styles.name} numberOfLines={1}>
        {user.username}
      </Text>
      <Text style={styles.switch}>↩</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    bottom: 96,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 3px 6px rgba(0,0,0,0.25)" },
    }),
    zIndex: 999,
    maxWidth: 180,
  },
  emoji: { fontSize: 14 },
  name: { fontSize: 12, color: "#f1f5f9", fontWeight: "600", flex: 1 },
  switch: { fontSize: 14, color: "#94a3b8" },
});
