import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/store';
import * as ImagePicker from 'expo-image-picker';
import { request } from '@/services/apiClient';

// Enhanced upload helper for Web & Mobile
const uploadImage = async (uri: string) => {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const fetchRes = await fetch(uri);
    const blob = await fetchRes.blob();
    formData.append('file', blob, 'chat-image.jpg');
  } else {
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    formData.append('file', { uri, name: filename, type } as any);
  }

  const res: any = await request('/upload', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.url || res.data?.url;
};

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useAuthStore();
  const { messages, loading, fetchMessages, sendMessage, socket } = useChatStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [picking, setPicking] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) fetchMessages(id);
  }, [id]);

  useEffect(() => {
    if (id && socket) {
      socket.emit('chat:join', id);
      return () => { socket.emit('chat:leave', id); };
    }
  }, [id, socket]);

  const thread = useMemo(() => (id ? messages[id] ?? [] : []), [id, messages]);

  const handleSend = async () => {
    if (!input.trim() || !id || sending) return;
    setSending(true);
    try {
      await sendMessage({ conversationId: id, content: input.trim() });
      setInput('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    if (!id || picking) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleConfirmSendImage = async () => {
    if (!previewUri || !id) return;
    setPicking(true);
    try {
      const url = await uploadImage(previewUri);
      if (url) {
        await sendMessage({
          conversationId: id,
          content: '',
          attachments: [{ 
            url, 
            originalName: 'image.jpg', 
            filename: 'chat-image.jpg',
            size: 1024, // placeholder size
            mimeType: 'image/jpeg' 
          }]
        });
        setPreviewUri(null);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      }
    } catch (err) {
       console.error('[Chat] Upload fail:', err);
    } finally {
      setPicking(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    // Robust isMe check for different senderId formats (populated vs string, id vs _id)
    const senderId = typeof item.senderId === 'object' ? (item.senderId._id || item.senderId.id) : item.senderId;
    const myId = state.user?.id || state.user?._id;
    const isMe = String(senderId) === String(myId);

    const date = item.createdAt ? new Date(item.createdAt) : null;
    const time = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <View style={[s.msgRow, isMe ? s.msgMe : s.msgOther]}>
        {!isMe && (
          <View style={s.tinyAvatar}>
            <Text style={s.tinyTxt}>{item.senderId?.username?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
        )}
        <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleOther, (item.attachments?.length > 0) && s.bubbleWithImage]}>
          {(item.attachments ?? []).map((att: any, idx: number) => (
            <Image key={idx} source={{ uri: att.url }} style={s.attachedImg} />
          ))}
          {(item.content || item.text) ? (
            <Text style={[s.msgTxt, isMe ? s.msgTxtMe : s.msgTxtOther]}>{item.content || item.text}</Text>
          ) : null}
          <Text style={[s.msgTime, isMe ? s.msgTimeMe : s.msgTimeOther]}>{time}</Text>
        </View>
      </View>
    );
  };

  if (loading && thread.length === 0) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </Pressable>
          <View style={s.headerInfo}>
            <Text style={s.headerTitle}>Hội thoại</Text>
            <View style={s.statusRow}>
              <View style={s.onlineDot} />
              <Text style={s.statusText}>Đang trực tuyến</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={thread}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          contentContainerStyle={s.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input */}
        <View style={s.inputArea}>
          <View style={s.inputRow}>
            <Pressable style={s.toolBtn} onPress={handlePickImage} disabled={picking || sending}>
              {picking ? <ActivityIndicator size="small" color="#10B981" /> : <Ionicons name="image-outline" size={22} color="#94A3B8" />}
            </Pressable>
            
            <TextInput
              style={s.input}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#64748B"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
            />
            <Pressable 
                style={[s.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]} 
                onPress={handleSend}
                disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
        {/* Preview Modal */}
        {previewUri && (
          <View style={s.previewModal}>
             <View style={s.previewContent}>
               <Text style={s.previewTitle}>Gửi hình ảnh?</Text>
               <Image source={{ uri: previewUri }} style={s.fullPreview} />
               <View style={s.previewActs}>
                  <Pressable style={s.cancelBtn} onPress={() => setPreviewUri(null)} disabled={picking}>
                    <Text style={s.cancelTxt}>Hủy</Text>
                  </Pressable>
                  <Pressable style={s.confirmBtn} onPress={handleConfirmSendImage} disabled={picking}>
                    {picking ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.confirmTxt}>Gửi</Text>}
                  </Pressable>
               </View>
             </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 11, color: '#64748B' },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },

  list: { padding: 16, paddingBottom: 24, gap: 16 },

  msgRow: { flexDirection: 'row', maxWidth: '85%', gap: 8 },
  msgMe: { alignSelf: 'flex-end', flexDirection: 'row' },
  msgOther: { alignSelf: 'flex-start' },

  tinyAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  tinyTxt: { color: '#F8FAFC', fontSize: 11, fontWeight: '700' },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#6366F1', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4 },
  bubbleWithImage: { padding: 4 }, // Tight padding for images

  attachedImg: { width: 220, height: 220, borderRadius: 12, marginBottom: 4 },

  msgTxt: { fontSize: 14, lineHeight: 20 },
  msgTxtMe: { color: '#fff' },
  msgTxtOther: { color: '#F8FAFC' },

  msgTime: { fontSize: 9, marginTop: 4 },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end' },
  msgTimeOther: { color: '#64748B' },

  inputArea: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  input: { flex: 1, color: '#F8FAFC', fontSize: 14, maxHeight: 100, paddingTop: 4, paddingBottom: 4 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  toolBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  previewModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewContent: { backgroundColor: '#1E293B', borderRadius: 24, padding: 20, width: '100%', maxWidth: 400, gap: 16 },
  previewTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  fullPreview: { width: '100%', height: 300, borderRadius: 16 },
  previewActs: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  cancelTxt: { color: '#94A3B8', fontWeight: '600' },
  confirmBtn: { flex: 2, height: 48, borderRadius: 24, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  confirmTxt: { color: '#fff', fontWeight: '700' },
});
