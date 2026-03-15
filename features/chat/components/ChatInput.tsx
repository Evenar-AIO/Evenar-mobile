import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
}

interface Props {
  onSendText: (text: string) => Promise<void>;
  onSendFiles: (text: string, files: SelectedFile[]) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
}

export function ChatInput({ onSendText, onSendFiles, onTyping }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [sending, setSending] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTextChange(val: string) {
    setText(val);
    onTyping?.(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping?.(false), 1500);
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const picked: SelectedFile[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `image_${Date.now()}.jpg`,
        mimeType: a.mimeType ?? "image/jpeg",
      }));
      setFiles((prev) => [...prev, ...picked]);
    }
  }

  async function pickDocument() {
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

  async function handleSend() {
    if (sending) return;
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;

    setSending(true);
    try {
      if (files.length > 0) {
        await onSendFiles(trimmed, files);
      } else {
        await onSendText(trimmed);
      }
      setText("");
      setFiles([]);
    } finally {
      setSending(false);
    }
  }

  const canSend = (text.trim().length > 0 || files.length > 0) && !sending;

  return (
    <View style={styles.wrapper}>
      {files.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewScroll}
          contentContainerStyle={styles.previewContent}
        >
          {files.map((f, i) => {
            const isImage = f.mimeType.startsWith("image/");
            return (
              <View key={i} style={styles.previewItem}>
                {isImage ? (
                  <Image
                    source={{ uri: f.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.previewFile}>
                    <Ionicons
                      name="document-outline"
                      size={24}
                      color="#0a7ea4"
                    />
                  </View>
                )}
                <Text style={styles.previewName} numberOfLines={1}>
                  {f.name}
                </Text>
                <TouchableOpacity
                  style={styles.previewRemove}
                  onPress={() =>
                    setFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  <Ionicons name="close-circle" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.row}>
        <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#687076" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={pickDocument}>
          <Ionicons name="attach-outline" size={24} color="#687076" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#9BA1A6"
          multiline
          maxLength={2000}
          returnKeyType="default"
        />

        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
    backgroundColor: "#fff",
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
  },
  previewScroll: {
    maxHeight: 110,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  previewContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  previewItem: { width: 80, alignItems: "center", position: "relative" },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  previewFile: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f7fb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1e8f2",
  },
  previewName: {
    fontSize: 10,
    color: "#687076",
    marginTop: 2,
    textAlign: "center",
    width: 76,
  },
  previewRemove: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#374151",
    borderRadius: 9,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  iconBtn: { padding: 6 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: "#11181C",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0a7ea4",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#b0d4e3" },
});
