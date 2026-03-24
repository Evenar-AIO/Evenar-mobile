import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventItem } from '../types/event.type';

type Props = {
  item: EventItem;
  onEdit?: () => void;
  onDelete?: () => void;
};

const STATUS_MAP: Record<string, { color: string; label: string; bg: string }> = {
  pending: { color: '#F59E0B', label: 'Chờ duyệt', bg: 'rgba(245,158,11,0.1)' },
  approved: { color: '#10B981', label: 'Đã duyệt', bg: 'rgba(16,185,129,0.1)' },
  rejected: { color: '#EF4444', label: 'Từ chối', bg: 'rgba(239,68,68,0.1)' },
  active: { color: '#10B981', label: 'Đang mở', bg: 'rgba(16,185,129,0.1)' },
  draft: { color: '#64748B', label: 'Bản nháp', bg: 'rgba(100,116,139,0.1)' },
};

export default function EventCard({ item, onEdit, onDelete }: Props) {
  const statusInfo = STATUS_MAP[item.status?.toLowerCase() || 'draft'] || STATUS_MAP.draft;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <View style={s.card}>
      {item.imageURL ? (
        <Image source={{ uri: item.imageURL }} style={s.image} />
      ) : (
        <View style={s.imagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#334155" />
        </View>
      )}

      {/* Status Badge */}
      <View style={[s.badge, { backgroundColor: statusInfo.bg }]}>
        <View style={[s.dot, { backgroundColor: statusInfo.color }]} />
        <Text style={[s.badgeTxt, { color: statusInfo.color }]}>{statusInfo.label}</Text>
      </View>

      <View style={s.content}>
        <Text style={s.name} numberOfLines={1}>{item.name}</Text>

        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Ionicons name="calendar-outline" size={12} color="#64748B" />
            <Text style={s.metaTxt}>{formatDate(item.startTime)}</Text>
          </View>
          <View style={s.metaItem}>
            <Ionicons name="location-outline" size={12} color="#64748B" />
            <Text style={s.metaTxt} numberOfLines={1}>{item.physicalLocation || 'Chưa có địa điểm'}</Text>
          </View>
        </View>

        <View style={s.stats}>
          <View>
            <Text style={s.statVal}>{item.totalTicketCount || 0}</Text>
            <Text style={s.statLbl}>Tổng vé</Text>
          </View>
          <View style={s.divider} />
          <View>
            <Text style={[s.statVal, { color: '#10B981' }]}>₫0</Text>
            <Text style={s.statLbl}>Doanh thu</Text>
          </View>
        </View>

        <View style={s.actions}>
          <Pressable style={s.editBtn} onPress={onEdit}>
            <Ionicons name="create-outline" size={16} color="#F8FAFC" />
            <Text style={s.btnTxt}>Chỉnh sửa</Text>
          </Pressable>
          <Pressable style={s.delBtn} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  image: { width: '100%', height: 160 },
  imagePlaceholder: { width: '100%', height: 160, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },

  content: { padding: 18 },
  name: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaTxt: { fontSize: 11, fontWeight: '400', color: '#64748B' },

  stats: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16 },
  statVal: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  statLbl: { fontSize: 10, fontWeight: '400', color: '#475569', marginTop: 1 },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 20 },

  actions: { flexDirection: 'row', gap: 10 },
  editBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', gap: 6 },
  btnTxt: { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
  delBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },
});