import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  sendTextMessage,
  getUsers,
  type ChatUser,
} from "@/features/chat/services/chatService";
import { useAuth } from "@/store/authStore";

const ROLE_LABEL: Record<string, string> = {
  event_owner: "Event Owner",
  admin: "Admin",
  customer: "Khách hàng",
};

const ROLE_COLOR: Record<string, string> = {
  event_owner: "#7c3aed",
  admin: "#dc2626",
  customer: "#0a7ea4",
};

export default function NewChatScreen() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ChatUser | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => setError("Không thể tải danh sách người dùng"))
      .finally(() => setLoadingUsers(false));
  }, []);

  const filtered = users.filter((u) => {
    if (u.legacyId === currentUser?.userId) return false;
    if (u.role === "admin") return false;
    const q = search.toLowerCase();
    return (
      q === "" ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      ROLE_LABEL[u.role]?.toLowerCase().includes(q)
    );
  });

  const canSend =
    selected !== null && subject.trim().length > 0 && message.trim().length > 0;

  async function handleSend() {
    if (!canSend || !selected) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendTextMessage({
        recipientId: selected.legacyId,
        subject: subject.trim(),
        messageContent: message.trim(),
      });
      router.replace(`/chat/${res.data.conversationId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể gửi tin nhắn");
      setSending(false);
    }
  }

  function renderUserItem({ item }: { item: ChatUser }) {
    const isSelected = selected?.legacyId === item.legacyId;
    const roleColor = ROLE_COLOR[item.role] ?? "#687076";

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => setSelected(isSelected ? null : item)}
        activeOpacity={0.7}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View
            style={[styles.avatarPlaceholder, { backgroundColor: roleColor }]}
          >
            <Text style={styles.avatarLetter}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View style={[styles.roleBadge, { backgroundColor: roleColor + "18" }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>
            {ROLE_LABEL[item.role] ?? item.role}
          </Text>
        </View>

        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#0a7ea4"
            style={{ marginLeft: 6 }}
          />
        )}
      </TouchableOpacity>
    );
  }

  if (currentUser?.role === "admin") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin nhắn mới</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={52} color="#d1d5db" />
          <Text style={styles.restrictedTitle}>Không có quyền truy cập</Text>
          <Text style={styles.restrictedSub}>
            Tài khoản Admin không thể tạo hội thoại mới
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn mới</Text>
        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {selected && (
          <View style={styles.selectedBar}>
            <Ionicons name="person" size={14} color="#0a7ea4" />
            <Text style={styles.selectedName} numberOfLines={1}>
              {selected.username}
            </Text>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Ionicons name="close-circle" size={18} color="#9BA1A6" />
            </TouchableOpacity>
          </View>
        )}

        {!selected && (
          <View style={styles.listSection}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={16}
                color="#9BA1A6"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm tên, email..."
                placeholderTextColor="#9BA1A6"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={16} color="#9BA1A6" />
                </TouchableOpacity>
              )}
            </View>

            {loadingUsers ? (
              <View style={styles.center}>
                <ActivityIndicator color="#0a7ea4" />
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(u) => String(u.legacyId)}
                renderItem={renderUserItem}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyList}>
                    <Ionicons name="people-outline" size={36} color="#d1d5db" />
                    <Text style={styles.emptyText}>
                      Không tìm thấy người dùng
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}

        {selected && (
          <View style={styles.formSection}>
            <View style={styles.field}>
              <Text style={styles.label}>Chủ đề</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập chủ đề hội thoại..."
                placeholderTextColor="#9BA1A6"
                value={subject}
                onChangeText={setSubject}
                returnKeyType="next"
                maxLength={100}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.label}>Tin nhắn</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#9BA1A6"
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  restrictedTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  restrictedSub: {
    fontSize: 14,
    color: "#9BA1A6",
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#11181C" },
  sendBtn: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "#b0d4e3" },
  sendBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  selectedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e8f4f8",
    borderRadius: 20,
  },
  selectedName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0a7ea4" },

  listSection: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 8,
    borderRadius: 12,
    marginHorizontal: 0,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f4f4f5",
    borderRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#11181C", paddingVertical: 0 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
    gap: 12,
    backgroundColor: "#fff",
  },
  userItemSelected: { backgroundColor: "#f0f7fb" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
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
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleText: { fontSize: 11, fontWeight: "600" },
  emptyList: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 14, color: "#9BA1A6" },

  formSection: { backgroundColor: "#fff", marginTop: 8, flex: 1 },
  field: { paddingHorizontal: 16, paddingVertical: 14 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#687076",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: { fontSize: 15, color: "#11181C", paddingVertical: 0 },
  messageInput: {
    fontSize: 15,
    color: "#11181C",
    minHeight: 140,
    paddingVertical: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 16,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
  errorText: { color: "#ef4444", fontSize: 13, flex: 1 },
});
