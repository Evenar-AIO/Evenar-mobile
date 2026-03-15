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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { submitSupport } from "@/features/support/services/supportService";
import type { SupportPriority } from "@/features/support/types";

const CATEGORIES = [
  "Thanh toán",
  "Đổi/Hoàn vé",
  "Kỹ thuật",
  "Hóa đơn",
  "Hoàn tiền",
  "Khác",
];
const PRIORITIES: { value: SupportPriority; label: string; color: string }[] = [
  { value: "low", label: "Thấp", color: "#6b7280" },
  { value: "medium", label: "Trung bình", color: "#f59e0b" },
  { value: "high", label: "Cao", color: "#ef4444" },
  { value: "urgent", label: "Khẩn cấp", color: "#dc2626" },
];

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
}

export default function CreateSupportScreen() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<SupportPriority>("medium");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const picked: SelectedFile[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        mimeType: a.mimeType ?? "application/octet-stream",
      }));
      setFiles((prev) => [...prev, ...picked]);
    }
  }

  async function handleSubmit() {
    if (!subject.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng mô tả vấn đề");
      return;
    }
    if (!category) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn danh mục");
      return;
    }

    setSubmitting(true);
    try {
      await submitSupport(
        {
          subject: subject.trim(),
          content: content.trim(),
          category,
          priority,
        },
        files,
      );
      Alert.alert(
        "Gửi thành công!",
        "Yêu cầu hỗ trợ của bạn đã được tiếp nhận. Chúng tôi sẽ phản hồi sớm nhất có thể.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e: unknown) {
      Alert.alert(
        "Lỗi",
        e instanceof Error ? e.message : "Không thể gửi yêu cầu",
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gửi yêu cầu hỗ trợ</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <Text style={styles.label}>Tiêu đề *</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Mô tả ngắn gọn vấn đề của bạn"
              placeholderTextColor="#9BA1A6"
              maxLength={200}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Danh mục *</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === c && styles.chipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mức độ ưu tiên</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityBtn,
                    priority === p.value && {
                      borderColor: p.color,
                      backgroundColor: `${p.color}12`,
                    },
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p.value && {
                        color: p.color,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mô tả chi tiết *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải, thông tin đơn hàng liên quan..."
              placeholderTextColor="#9BA1A6"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{content.length}/2000</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tệp đính kèm (tuỳ chọn)</Text>
            <TouchableOpacity style={styles.attachBtn} onPress={pickFile}>
              <Ionicons name="attach-outline" size={20} color="#0a7ea4" />
              <Text style={styles.attachText}>
                Chọn tệp (ảnh, PDF, video...)
              </Text>
            </TouchableOpacity>
            {files.map((f, i) => (
              <View key={i} style={styles.fileRow}>
                <Ionicons name="document-outline" size={16} color="#687076" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {f.name}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
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
                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                <Text style={styles.submitText}>Gửi yêu cầu</Text>
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#11181C" },
  scroll: { padding: 20, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#11181C",
  },
  textArea: { minHeight: 140, lineHeight: 22 },
  charCount: { textAlign: "right", fontSize: 12, color: "#9BA1A6" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    backgroundColor: "#f9f9f9",
  },
  chipActive: { borderColor: "#0a7ea4", backgroundColor: "#f0f7fb" },
  chipText: { fontSize: 13, color: "#687076" },
  chipTextActive: { color: "#0a7ea4", fontWeight: "600" },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    alignItems: "center",
  },
  priorityText: { fontSize: 12, color: "#687076" },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#0a7ea4",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
  },
  attachText: { color: "#0a7ea4", fontSize: 14 },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
  },
  fileName: { flex: 1, fontSize: 13, color: "#374151" },
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
