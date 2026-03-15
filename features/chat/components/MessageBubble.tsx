import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "@/services/api";
import type { Message } from "../types";

interface Props {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <View
      style={[
        styles.wrapper,
        isMine ? styles.wrapperRight : styles.wrapperLeft,
      ]}
    >
      <View
        style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
      >
        {!!message.messageContent && (
          <Text
            style={[styles.text, isMine ? styles.textMine : styles.textOther]}
          >
            {message.messageContent}
          </Text>
        )}

        {hasAttachments &&
          message.attachments!.map((att) => {
            const url = `${BASE_URL}${att.filePath}`;
            const isImage = att.mimeType.startsWith("image/");

            if (isImage) {
              return (
                <Image
                  key={att._id}
                  source={{ uri: url }}
                  style={styles.imageAttachment}
                  resizeMode="cover"
                />
              );
            }

            return (
              <TouchableOpacity
                key={att._id}
                style={styles.fileAttachment}
                onPress={() => Linking.openURL(url)}
              >
                <Ionicons
                  name="document-attach-outline"
                  size={20}
                  color="#0a7ea4"
                />
                <Text style={styles.fileName} numberOfLines={1}>
                  {att.originalFilename}
                </Text>
                <Text style={styles.fileSize}>{formatSize(att.fileSize)}</Text>
              </TouchableOpacity>
            );
          })}

        <View style={styles.footer}>
          <Text
            style={[styles.time, isMine ? styles.timeMine : styles.timeOther]}
          >
            {time}
          </Text>
          {isMine && (
            <Ionicons
              name={message.isRead ? "checkmark-done" : "checkmark"}
              size={14}
              color={message.isRead ? "#60a5fa" : "rgba(255,255,255,0.6)"}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 3, paddingHorizontal: 12 },
  wrapperRight: { alignItems: "flex-end" },
  wrapperLeft: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: "#0a7ea4",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 15, lineHeight: 21 },
  textMine: { color: "#fff" },
  textOther: { color: "#11181C" },
  imageAttachment: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginTop: 4,
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: 8,
    gap: 6,
    marginTop: 4,
    maxWidth: 220,
  },
  fileName: { flex: 1, fontSize: 13, color: "#0a7ea4" },
  fileSize: { fontSize: 11, color: "#687076" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  time: { fontSize: 11 },
  timeMine: { color: "rgba(255,255,255,0.7)" },
  timeOther: { color: "#687076" },
});
