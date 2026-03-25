import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ScrollView, Text, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/store';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerDashboardScreen() {
  const { state } = useAuthStore();
  const { width: W } = useWindowDimensions();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setStats(await ownerService.getStats()); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <View style={s.loadWrap}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  const name = state.user?.fullName || 'Nhà tổ chức';

  const kpis = [
    { label: 'Doanh thu', val: stats?.totalRevenue ?? '₫0', icon: 'wallet-outline' as const, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Vé đã bán', val: stats?.ticketsSold ?? '0', icon: 'ticket-outline' as const, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Sự kiện', val: stats?.activeEvents ?? '0', icon: 'calendar-outline' as const, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Đánh giá', val: stats?.avgRating ?? '4.8', icon: 'star-outline' as const, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  ];

  const cardW = (W - 48 - 12) / 2;

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <View>
            <Text style={s.heroHi}>Xin chào,</Text>
            <Text style={s.heroName}>{name}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { transform: [{ scale: 0.92 }] }]}
            onPress={() => router.push('/owner/event/create')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* ── KPI 2 × 2 Grid ── */}
        <View style={s.kpiGrid}>
          {kpis.map((k) => (
            <View key={k.label} style={[s.kpiCard, { width: cardW }]}>
              <View style={[s.kpiIcon, { backgroundColor: k.bg }]}>
                <Ionicons name={k.icon} size={18} color={k.color} />
              </View>
              <Text style={s.kpiVal}>{k.val}</Text>
              <Text style={s.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Weekly Revenue Chart ── */}
        <View style={s.section}>
          <Text style={s.secTitle}>Doanh thu 7 ngày</Text>
          <View style={s.chartWrap}>
            {(() => {
              const trend = stats?.weeklyTrend || [];
              const maxRev = Math.max(...trend.map((t: any) => t.revenue), 1000);
              
              return trend.map((t: any, i: number) => {
                const height = Math.max((t.revenue / maxRev) * 60, 4); // Min 4px height
                const isToday = i === trend.length - 1;
                
                return (
                  <View key={i} style={s.barCol}>
                    <View style={[s.bar, { height, backgroundColor: isToday ? '#10B981' : '#334155' }]} />
                    <Text style={[s.barLbl, isToday && { color: '#F8FAFC', fontWeight: '600' }]}>
                      {t.day}
                    </Text>
                  </View>
                );
              });
            })()}
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={s.section}>
          <Text style={s.secTitle}>Truy cập nhanh</Text>
          <View style={s.actionRow}>
            <QuickBtn icon="albums-outline" label="Sự kiện" color="#10B981" onPress={() => router.push('/owner/event')} />
            <QuickBtn icon="add-circle-outline" label="Tạo mới" color="#F59E0B" onPress={() => router.push('/owner/event/create')} />
            <QuickBtn icon="help-buoy-outline" label="Yêu cầu" color="#EC4899" onPress={() => router.push('/support/new')} />
          </View>
        </View>

        {/* ── Top Events ── */}
        <View style={s.section}>
          <View style={s.secHeader}>
            <Text style={s.secTitle}>Top sự kiện</Text>
            <Pressable onPress={() => router.push('/owner/event')}>
              <Text style={s.link}>Xem tất cả</Text>
            </Pressable>
          </View>
          {(stats?.topEvents ?? []).length === 0 ? (
            <View style={s.emptyBlock}>
              <Ionicons name="trophy-outline" size={36} color="#334155" />
              <Text style={s.emptyTxt}>Chưa có dữ liệu</Text>
            </View>
          ) : (
            stats.topEvents.map((e: any, i: number) => (
              <View key={e._id} style={s.eventRow}>
                <View style={[s.rank, i === 0 && { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                  <Text style={[s.rankTxt, i === 0 && { color: '#FBBF24' }]}>{i + 1}</Text>
                </View>
                <Text style={s.eventName} numberOfLines={1}>{e.name}</Text>
                <Text style={s.eventRev}>{e.revenue ?? '₫0'}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

function QuickBtn({ icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.quickBtn, pressed && { opacity: 0.7 }]}>
      <View style={[s.quickIcon, { backgroundColor: color + '14', borderColor: color + '25' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={s.quickLbl}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  loadWrap: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 32 },

  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  heroHi: { fontSize: 14, color: '#94A3B8', fontWeight: '400' },
  heroName: { fontSize: 24, color: '#F8FAFC', fontWeight: '700', marginTop: 2 },
  fab: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  kpiCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  kpiVal: { fontSize: 22, color: '#F8FAFC', fontWeight: '700' },
  kpiLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },

  section: { marginTop: 24, paddingHorizontal: 20 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle: { fontSize: 16, color: '#F8FAFC', fontWeight: '600', marginBottom: 14 },
  link: { fontSize: 13, color: '#10B981', fontWeight: '500' },

  chartWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  barCol: { alignItems: 'center', flex: 1, gap: 8 },
  bar: { width: 22, borderRadius: 6 },
  barLbl: { fontSize: 10, color: '#64748B', fontWeight: '400' },

  actionRow: { flexDirection: 'row', gap: 12 },
  quickBtn: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  quickLbl: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  emptyBlock: { alignItems: 'center', paddingVertical: 32, gap: 8, backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  emptyTxt: { fontSize: 13, color: '#475569', fontWeight: '400' },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  rank: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankTxt: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  eventName: { flex: 1, fontSize: 14, color: '#E2E8F0', fontWeight: '500' },
  eventRev: { fontSize: 14, color: '#10B981', fontWeight: '700' },
});
