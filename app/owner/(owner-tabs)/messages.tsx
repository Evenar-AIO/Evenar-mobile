import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/store';
import { chatService } from '@/features/customer/services/chat.service';

export default function OwnerMessagesScreen() {
  const router = useRouter();
  const { state } = useAuthStore();
  const { conversations, loading, fetchConversations } = useChatStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter(c => {
        const other = c.participants?.find((p: any) => p._id !== state.user?.id);
        return other?.username?.toLowerCase().includes(search.toLowerCase()) || 
               c.lastMessagePreview?.toLowerCase().includes(search.toLowerCase());
    });
  }, [conversations, search, state.user?.id]);

  const handleDelete = async (convId: string) => {
    try {
      await chatService.deleteConversation(convId);
      fetchConversations();
    } catch (err) {
      console.error('Lỗi khi xóa cuộc hội thoại:', err);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={s.root}>
        {/* Header Section */}
        <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.title}>Hội thoại</Text>
              <Pressable style={s.headerIcon}>
                <Ionicons name="options-outline" size={20} color="#F8FAFC" />
              </Pressable>
            </View>
            
            {/* Search Bar */}
            <View style={s.searchWrap}>
              <Ionicons name="search" size={18} color="#64748B" style={s.searchIcon} />
              <TextInput 
                style={s.search}
                placeholder="Tìm khách hàng hoặc tin nhắn..."
                placeholderTextColor="#64748B"
                value={search}
                onChangeText={setSearch}
              />
            </View>
        </View>

        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {filteredConversations.length === 0 ? (
             <View style={s.empty}>
                <View style={s.emptyIconWrap}>
                   <Ionicons name="chatbubbles-outline" size={48} color="#1E293B" />
                </View>
                <Text style={s.emptyTitle}>Không có kết quả</Text>
                <Text style={s.emptySub}>Chưa có cuộc hội thoại nào phù hợp với tìm kiếm của bạn.</Text>
             </View>
          ) : (
            filteredConversations.map((item) => {
              const other = item.participants?.find((p: any) => p._id !== state.user?.id);
              const lastMsg = item.lastMessagePreview || 'Chưa có tin nhắn...';
              const date = item.lastMessageAt ? new Date(item.lastMessageAt) : null;
              const timeStr = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const hasUnread = (item.unreadCount ?? 0) > 0;

              return (
                <View key={item._id} style={s.itemGutter}>
                  <Pressable 
                    style={({ pressed }) => [s.convCard, pressed && { backgroundColor: 'rgba(255,255,255,0.03)' }]}
                    onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item._id } })}
                  >
                    <View style={s.avatarWrap}>
                      {other?.avatar ? (
                        <Image source={{ uri: other.avatar }} style={s.avatar} />
                      ) : (
                        <View style={[s.avatar, s.avatarPlaceholder]}>
                          <Text style={s.avatarTxt}>{other?.username?.charAt(0).toUpperCase() || '?'}</Text>
                        </View>
                      )}
                      {hasUnread && <View style={s.unreadBadge} />}
                    </View>

                    <View style={s.content}>
                      <View style={s.row}>
                        <Text style={[s.name, hasUnread && s.unreadName]} numberOfLines={1}>{other?.username || 'Khách hàng'}</Text>
                        <Text style={s.time}>{timeStr}</Text>
                      </View>
                      <Text style={[s.preview, hasUnread && s.unreadPreview]} numberOfLines={1}>{lastMsg}</Text>
                    </View>

                    <Pressable 
                      style={({ pressed }) => [s.deleteBtn, pressed && { opacity: 0.5 }]} 
                      onPress={() => handleDelete(item._id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#334155" />
                    </Pressable>
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  
  header: { padding: 20, paddingTop: 60, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
  
  searchWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1E293B', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  searchIcon: { marginRight: 12 },
  search: { flex: 1, color: '#F8FAFC', fontSize: 15, fontWeight: '500' },
  
  list: { paddingHorizontal: 12, paddingBottom: 60 },
  itemGutter: { marginBottom: 4 },
  convCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 20, 
    gap: 14 
  },
  
  avatarWrap: { position: 'relative' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E293B' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  avatarTxt: { color: '#F8FAFC', fontSize: 22, fontWeight: '800' },
  unreadBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#0F172A' },
  
  content: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', letterSpacing: -0.2 },
  unreadName: { color: '#fff' },
  time: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  preview: { fontSize: 14, color: '#94A3B8', lineHeight: 20 },
  unreadPreview: { color: '#E2E8F0', fontWeight: '600' },

  deleteBtn: { padding: 8 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 80, gap: 16 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  emptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
});
