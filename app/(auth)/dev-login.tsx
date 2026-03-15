import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/authStore";
import { BASE_URL } from "@/services/api";

interface SeedUser {
  legacyId: number;
  username: string;
  email: string;
  role: "admin" | "event_owner" | "customer";
  avatar: string | null;
}

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: "shield-checkmark" as const,
  },
  event_owner: {
    label: "Event Owner",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: "business" as const,
  },
  customer: {
    label: "Customer",
    color: "#0a7ea4",
    bg: "#f0f7fb",
    icon: "person" as const,
  },
};

export default function DevLoginScreen() {
  const { login } = useAuth();
  const [users, setUsers] = useState<SeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/auth/dev-users`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setUsers(json.data);
      })
      .catch(() =>
        Alert.alert(
          "Lỗi kết nối",
          `Không thể kết nối tới backend.\nURL: ${BASE_URL}`,
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(user: SeedUser) {
    setLoggingIn(user.legacyId);
    try {
      const res = await fetch(`${BASE_URL}/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.legacyId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      await login(json.token, json.user);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setLoggingIn(null);
    }
  }

  const grouped = users.reduce<Record<string, SeedUser[]>>((acc, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {});

  const sections: { role: string; data: SeedUser[] }[] = [
    ...(grouped["admin"] ? [{ role: "admin", data: grouped["admin"] }] : []),
    ...(grouped["event_owner"]
      ? [{ role: "event_owner", data: grouped["event_owner"] }]
      : []),
    ...(grouped["customer"]
      ? [{ role: "customer", data: grouped["customer"] }]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Ionicons name="construct" size={22} color="#f59e0b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Dev Mode — Chọn user để test</Text>
          <Text style={styles.bannerSub}>
            Màn hình này chỉ tồn tại khi backend ở chế độ development
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Đang tải danh sách users...</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s.role}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item: section }) => {
            const cfg = ROLE_CONFIG[section.role as keyof typeof ROLE_CONFIG];
            return (
              <View>
                <View style={[styles.roleHeader, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                  <Text style={[styles.roleLabel, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                  <Text style={styles.roleCount}>
                    {section.data.length} users
                  </Text>
                </View>

                {section.data.map((user) => (
                  <TouchableOpacity
                    key={user.legacyId}
                    style={styles.userCard}
                    onPress={() => handleLogin(user)}
                    disabled={loggingIn !== null}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[styles.avatar, { backgroundColor: cfg.color }]}
                    >
                      <Text style={styles.avatarLetter}>
                        {user.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.username}</Text>
                      <Text style={styles.userEmail} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>

                    <View style={styles.idBadge}>
                      <Text style={styles.idText}>#{user.legacyId}</Text>
                    </View>

                    {loggingIn === user.legacyId ? (
                      <ActivityIndicator size="small" color="#0a7ea4" />
                    ) : (
                      <Ionicons
                        name="log-in-outline"
                        size={20}
                        color="#9BA1A6"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="warning-outline" size={48} color="#f59e0b" />
              <Text style={styles.emptyText}>Không tìm thấy users</Text>
              <Text style={styles.emptySub}>
                Hãy chắc chắn đã chạy init-db.js và backend đang hoạt động
              </Text>
              <Text
                style={[styles.emptySub, { color: "#0a7ea4", marginTop: 4 }]}
              >
                {BASE_URL}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: { fontSize: 14, fontWeight: "700", color: "#92400e" },
  bannerSub: { fontSize: 12, color: "#b45309", marginTop: 2 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 10,
  },
  loadingText: { fontSize: 14, color: "#687076" },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
  },
  roleLabel: { fontSize: 13, fontWeight: "700", flex: 1 },
  roleCount: { fontSize: 12, color: "#9BA1A6" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 18, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "600", color: "#11181C" },
  userEmail: { fontSize: 12, color: "#687076", marginTop: 2 },
  idBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  idText: { fontSize: 11, color: "#687076", fontWeight: "600" },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#374151" },
  emptySub: {
    fontSize: 13,
    color: "#9BA1A6",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
