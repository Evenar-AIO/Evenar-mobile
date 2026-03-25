import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EventCard from '../components/EventCard';
import { EventItem } from '../types/event.type';
import { deleteEvent, getMyEvents } from '../services/event.service';

export default function MyEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data: any = await getMyEvents();
      // Handle array or object response
      setEvents(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleDelete = async (id?: string) => {
    if (!id) return;

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa sự kiện này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(id);
            fetchEvents();
          } catch (error: any) {
            Alert.alert('Thông báo', error?.message || 'Có lỗi xảy ra khi xóa sự kiện');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.topRow}>
        <View>
          <Text style={s.title}>Sự kiện của tôi</Text>
          <Text style={s.subtitle}>{events.length} sự kiện đang tham gia</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.createBtn, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={() => router.push('/owner/event/create')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.createBtnTxt}>Tạo sự kiện</Text>
        </Pressable>
      </View>

      {events.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={32} color="#334155" />
          </View>
          <Text style={s.emptyTitle}>Chưa có sự kiện nào</Text>
          <Text style={s.emptySub}>Bắt đầu tổ chức sự kiện đầu tiên của bạn ngay hôm nay!</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item._id)}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onEdit={() => router.push(`/owner/event/edit/${item._id}`)}
              onDelete={() => handleDelete(item._id)}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  subtitle: { fontSize: 13, fontWeight: '400', color: '#64748B', marginTop: 2 },

  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  createBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },

  list: { paddingHorizontal: 20, paddingBottom: 40 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -40 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#E2E8F0', marginBottom: 8 },
  emptySub: { fontSize: 13, fontWeight: '400', color: '#64748B', textAlign: 'center', lineHeight: 20 },
});
