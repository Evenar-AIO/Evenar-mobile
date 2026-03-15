import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SupportTicketItem } from "@/features/support/components/SupportTicketItem";
import { getSupportList } from "@/features/support/services/supportService";
import type { SupportTicket, SupportStatus } from "@/features/support/types";

const STATUS_FILTERS: { label: string; value: SupportStatus | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đang xử lý", value: "in_progress" },
  { label: "Đã xong", value: "resolved" },
];

export default function SupportScreen() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SupportStatus | "">("");
  const [error, setError] = useState<string | null>(null);
  const hasInitialLoad = useRef(false);

  const fetchTickets = useCallback(async (status?: SupportStatus | "") => {
    try {
      setError(null);
      const res = await getSupportList({
        status: status || undefined,
        page: 1,
      });
      setTickets(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách");
    }
  }, []);

  useEffect(() => {
    fetchTickets(activeFilter).finally(() => {
      setLoading(false);
      hasInitialLoad.current = true;
    });
  }, [activeFilter, fetchTickets]);

  useFocusEffect(
    useCallback(() => {
      if (hasInitialLoad.current) fetchTickets(activeFilter);
    }, [activeFilter, fetchTickets]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await fetchTickets(activeFilter);
    setRefreshing(false);
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
        <Text style={styles.headerTitle}>Hỗ trợ</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push("/support/create")}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.createBtnText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.chip,
                activeFilter === f.value && styles.chipActive,
              ]}
              onPress={() => setActiveFilter(f.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f.value && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchTickets(activeFilter)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item) => String(item.legacyId)}
        renderItem={({ item }) => (
          <SupportTicketItem item={item} onPress={() => {}} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0a7ea4"
          />
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="headset-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Chưa có yêu cầu nào</Text>
            <Text style={styles.emptySubtitle}>
              Nhấn "Gửi yêu cầu" để liên hệ với bộ phận hỗ trợ
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
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a7ea4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  createBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  filterWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "flex-start",
  },
  chipActive: { backgroundColor: "#0a7ea4", borderColor: "#0a7ea4" },
  chipText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
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
