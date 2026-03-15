import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StarRating } from "@/features/feedback/components/StarRating";
import { createFeedback } from "@/features/feedback/services/feedbackService";

export default function CreateFeedbackScreen() {
  const { eventId, orderId, eventName } = useLocalSearchParams<{
    eventId: string;
    orderId: string;
    eventName?: string;
  }>();

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const RATING_LABELS = [
    "",
    "Tệ",
    "Không ổn",
    "Bình thường",
    "Tốt",
    "Tuyệt vời!",
  ];

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert("Chọn số sao", "Vui lòng chọn đánh giá từ 1 đến 5 sao");
      return;
    }
    if (content.trim().length < 10) {
      Alert.alert("Nội dung quá ngắn", "Vui lòng viết ít nhất 10 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      await createFeedback({
        eventId: parseInt(eventId),
        orderId: parseInt(orderId),
        rating,
        content: content.trim(),
      });
      Alert.alert("Cảm ơn!", "Đánh giá của bạn đã được ghi nhận", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Không thể gửi đánh giá",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="close" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Viết đánh giá</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {eventName && (
            <View style={styles.eventChip}>
              <Ionicons name="calendar-outline" size={14} color="#0a7ea4" />
              <Text style={styles.eventChipText} numberOfLines={1}>
                {eventName}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Đánh giá của bạn</Text>
            <View style={styles.starsRow}>
              <StarRating value={rating} onChange={setRating} size={40} />
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nhận xét chi tiết</Text>
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Chia sẻ trải nghiệm của bạn về sự kiện..."
              placeholderTextColor="#9BA1A6"
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitText}>Gửi đánh giá</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#11181C" },
  scroll: { padding: 20, gap: 24 },
  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#f0f7fb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eventChipText: { fontSize: 13, color: "#0a7ea4", fontWeight: "500" },
  section: { gap: 10 },
  sectionLabel: { fontSize: 15, fontWeight: "600", color: "#11181C" },
  starsRow: { alignItems: "center", paddingVertical: 8 },
  ratingLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#f59e0b",
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#11181C",
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: { textAlign: "right", fontSize: 12, color: "#9BA1A6" },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  submitBtn: {
    backgroundColor: "#0a7ea4",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
