import { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ScrollView, Text, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/store';
import { chatService } from '@/features/customer/services/chat.service';

export default function CustomerChatListScreen() {
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
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <View style={s.root}>
        {/* Header Section */}
        <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.title}>Tin nhắn</Text>
              <Pressable style={s.headerIcon}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
              </Pressable>
            </View>
            
            {/* Search Bar */}
            <View style={s.searchWrap}>
              <Ionicons name="search" size={18} color="#64748b" style={s.searchIcon} />
              <TextInput 
                style={s.search}
                placeholder="Tìm chủ sự kiện hoặc nội dung..."
                placeholderTextColor="#64748b"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                   <Ionicons name="close-circle" size={16} color="#64748b" />
                </Pressable>
              )}
            </View>
        </View>
        
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {filteredConversations.length === 0 ? (
             <View style={s.empty}>
                <View style={s.emptyIconWrap}>
                   <Ionicons name="chatbubbles-outline" size={48} color="#334155" />
                </View>
                <Text style={s.emptyTitle}>{search ? 'Không tìm thấy kết quả' : 'Chưa có hội thoại'}</Text>
                <Text style={s.emptySub}>
                    {search ? 'Hãy thử đổi từ khóa tìm kiếm khác của bạn' : 'Hãy liên hệ với ban tổ chức để bắt đầu cuộc trò chuyện'}
                </Text>
             </View>
          ) : (
            filteredConversations.map((item) => {
              const other = item.participants?.find((p: any) => p._id !== state.user?.id);
              const lastMsg = item.lastMessagePreview || 'Bắt đầu cuộc trò chuyện...';
              const date = item.lastMessageAt ? new Date(item.lastMessageAt) : null;
              const timeStr = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

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
                      <View style={s.onlineStatus} />
                    </View>

                    <View style={s.content}>
                      <View style={s.row}>
                        <Text style={s.name} numberOfLines={1}>{other?.username || 'Chủ sự kiện'}</Text>
                        <Text style={s.time}>{timeStr}</Text>
                      </View>
                      <Text style={s.preview} numberOfLines={1}>{lastMsg}</Text>
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
  root: { flex: 1, backgroundColor: '#0b0a14' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0a14' },
  
  header: { padding: 20, paddingTop: 60, gap: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  
  searchWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#16142a', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  searchIcon: { marginRight: 12 },
  search: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500' },
  
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
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1e1b36' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' },
  avatarTxt: { color: '#fff', fontSize: 22, fontWeight: '800' },
  onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#0b0a14' },
  
  content: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  time: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  preview: { fontSize: 14, color: '#94a3b8', lineHeight: 20 },

  deleteBtn: { padding: 8 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: 80, gap: 16 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#16142a', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
});
