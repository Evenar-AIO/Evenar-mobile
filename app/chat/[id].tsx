import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/authStore";
import {
  getMessages,
  sendTextMessage,
  sendMessageWithFiles,
  markConversationRead,
} from "@/features/chat/services/chatService";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { ChatInput } from "@/features/chat/components/ChatInput";
import {
  connectSocket,
  joinConversation,
  leaveConversation,
  emitTyping,
} from "@/services/socket";
import type { Message, Conversation } from "@/features/chat/types";
import type { Socket } from "socket.io-client";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const convId = parseInt(id);
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const onNewMessageRef = useRef<((incoming: Message) => void) | null>(null);
  const onTypingRef = useRef<
    ((payload: { userId: number; isTyping: boolean }) => void) | null
  >(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await getMessages(convId);
      setMessages(res.data);
      setConversation(res.conversation);
      markConversationRead(convId).catch(() => {});
    } catch (e) {
      console.error("fetchMessages error:", e);
    }
  }, [convId]);

  useEffect(() => {
    let mounted = true;

    fetchMessages().finally(() => {
      if (mounted) setLoading(false);
    });

    const rejoinRoom = () => joinConversation(convId);

    connectSocket()
      .then((socket) => {
        if (!mounted) return;
        socketRef.current = socket;
        joinConversation(convId);

        onNewMessageRef.current = (incoming) => {
          if (!mounted) return;
          setMessages((prev) => {
            if (
              prev.find(
                (m) =>
                  m._id === incoming._id || m.legacyId === incoming.legacyId,
              )
            )
              return prev;
            return [...prev, incoming];
          });
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100,
          );
          markConversationRead(convId).catch(() => {});
        };

        onTypingRef.current = ({ userId, isTyping }) => {
          if (userId !== user?.userId) setTypingUser(isTyping ? userId : null);
        };

        socket.on("new_message", onNewMessageRef.current);
        socket.on("typing", onTypingRef.current);
        socket.on("connect", rejoinRoom);
      })
      .catch(console.error);

    return () => {
      mounted = false;
      leaveConversation(convId);
      if (socketRef.current) {
        socketRef.current.off("connect", rejoinRoom);
        if (onNewMessageRef.current)
          socketRef.current.off("new_message", onNewMessageRef.current);
        if (onTypingRef.current)
          socketRef.current.off("typing", onTypingRef.current);
      }
    };
  }, [convId, fetchMessages, user?.userId]);

  async function handleSendText(text: string) {
    setSendError(null);
    try {
      await sendTextMessage({ conversationId: convId, messageContent: text });
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Không thể gửi tin nhắn");
    }
  }

  async function handleSendFiles(
    text: string,
    files: Array<{ uri: string; name: string; mimeType: string }>,
  ) {
    setSendError(null);
    try {
      await sendMessageWithFiles(
        { conversationId: convId, messageContent: text },
        files,
      );
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Không thể gửi file");
    }
  }

  const otherName = conversation?.otherUser?.username ?? "Hội thoại";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherName}
          </Text>
          {conversation?.subject && (
            <Text style={styles.headerSubject} numberOfLines={1}>
              {conversation.subject}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                conversation?.status === "active" ? "#22c55e" : "#9BA1A6",
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id ?? String(item.legacyId)}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={item.senderId === user?.userId}
            />
          )}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyText}>
                Chưa có tin nhắn. Hãy bắt đầu trò chuyện!
              </Text>
            </View>
          }
        />

        {sendError && (
          <Pressable
            style={styles.sendErrorBar}
            onPress={() => setSendError(null)}
          >
            <Ionicons name="alert-circle-outline" size={15} color="#ef4444" />
            <Text style={styles.sendErrorText} numberOfLines={1}>
              {sendError}
            </Text>
            <Ionicons name="close" size={15} color="#ef4444" />
          </Pressable>
        )}

        {typingUser && (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>Đang nhập...</Text>
          </View>
        )}

        {conversation?.status === "active" ? (
          <ChatInput
            onSendText={handleSendText}
            onSendFiles={handleSendFiles}
            onTyping={(isTyping) => emitTyping(convId, isTyping)}
          />
        ) : (
          <View style={styles.closedBanner}>
            <Ionicons name="lock-closed-outline" size={16} color="#687076" />
            <Text style={styles.closedText}>Hội thoại này đã đóng</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "700", color: "#11181C" },
  headerSubject: { fontSize: 12, color: "#687076", marginTop: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  messageList: { paddingTop: 12, paddingBottom: 8 },
  emptyMessages: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9BA1A6", fontSize: 14 },
  sendErrorBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fef2f2",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#fecaca",
  },
  sendErrorText: { flex: 1, fontSize: 12, color: "#ef4444" },
  typingRow: { paddingHorizontal: 16, paddingVertical: 6 },
  typingText: { fontSize: 12, color: "#687076", fontStyle: "italic" },
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    backgroundColor: "#f4f4f4",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  closedText: { fontSize: 14, color: "#687076" },
});
