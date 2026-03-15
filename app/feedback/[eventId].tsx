import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StarRating } from "@/features/feedback/components/StarRating";
import { FeedbackCard } from "@/features/feedback/components/FeedbackCard";
import { getFeedbackByEvent } from "@/features/feedback/services/feedbackService";
import type { Feedback, FeedbackStats } from "@/features/feedback/types";

export default function FeedbackListScreen() {
  const { eventId, eventName } = useLocalSearchParams<{
    eventId: string;
    eventName?: string;
  }>();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function fetchFeedback(pageNum = 1, replace = false) {
    try {
      const res = await getFeedbackByEvent(parseInt(eventId), pageNum);
      setFeedbacks((prev) => (replace ? res.data : [...prev, ...res.data]));
      setStats(res.stats);
      setHasMore(pageNum < res.pagination.totalPages);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchFeedback(1, true).finally(() => setLoading(false));
  }, [eventId]);

  async function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    await fetchFeedback(1, true);
    setRefreshing(false);
  }

  function handleLoadMore() {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchFeedback(next);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {eventName ?? "Đánh giá sự kiện"}
        </Text>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() =>
            router.push({ pathname: "/feedback/create", params: { eventId } })
          }
        >
          <Ionicons name="pencil-outline" size={20} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <FeedbackCard item={item} />}
        ListHeaderComponent={stats ? <StatsHeader stats={stats} /> : null}
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
            <Ionicons name="star-outline" size={56} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
            <Text style={styles.emptySubtitle}>
              Hãy là người đầu tiên đánh giá sự kiện này
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

function StatsHeader({ stats }: { stats: FeedbackStats }) {
  const pct = (n: number) =>
    stats.totalReviews > 0 ? Math.round((n / stats.totalReviews) * 100) : 0;
  return (
    <View style={statsStyles.card}>
      <View style={statsStyles.top}>
        <Text style={statsStyles.avgNumber}>{stats.avgRating.toFixed(1)}</Text>
        <View>
          <StarRating value={Math.round(stats.avgRating)} size={20} readonly />
          <Text style={statsStyles.totalText}>
            {stats.totalReviews} đánh giá
          </Text>
        </View>
      </View>
      {[5, 4, 3, 2, 1].map((star) => {
        const count =
          stats.distribution[star as keyof typeof stats.distribution] ?? 0;
        const percent = pct(count);
        return (
          <View key={star} style={statsStyles.barRow}>
            <Text style={statsStyles.barLabel}>{star}</Text>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <View style={statsStyles.barBg}>
              <View style={[statsStyles.barFill, { width: `${percent}%` }]} />
            </View>
            <Text style={statsStyles.barCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#11181C" },
  writeBtn: { padding: 4 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#374151" },
  emptySubtitle: { fontSize: 14, color: "#9BA1A6", textAlign: "center" },
});

const statsStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 6px rgba(0,0,0,0.07)" },
    }),
  },
  top: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 8 },
  avgNumber: { fontSize: 52, fontWeight: "700", color: "#11181C" },
  totalText: { fontSize: 13, color: "#687076", marginTop: 4 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  barLabel: { fontSize: 13, color: "#374151", width: 14, textAlign: "right" },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: 8, backgroundColor: "#f59e0b", borderRadius: 4 },
  barCount: { fontSize: 12, color: "#9BA1A6", width: 24, textAlign: "right" },
});
