import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ScrollView, Text, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerAnalyticsScreen() {
  const { width: W } = useWindowDimensions();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setMetrics(await ownerService.getAnalytics()); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <View style={s.loadWrap}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  const cards = [
    { label: 'Doanh thu tuần', val: metrics?.weeklyRevenue ?? '₫0', icon: 'cash-outline' as const, color: '#10B981', bg: 'rgba(16,185,129,0.12)', trend: '+8%' },
    { label: 'Tỉ lệ chuyển đổi', val: metrics?.conversionRate ?? '0%', icon: 'swap-horizontal-outline' as const, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', trend: '+2.3%' },
    { label: 'Giá vé TB', val: metrics?.avgTicketPrice ?? '₫0', icon: 'pricetag-outline' as const, color: '#6366F1', bg: 'rgba(99,102,241,0.12)', trend: '+5%' },
    { label: 'Khách mới', val: metrics?.newCustomers ?? '0', icon: 'person-add-outline' as const, color: '#EC4899', bg: 'rgba(236,72,153,0.12)', trend: '+15' },
  ];

  const cardW = (W - 48 - 12) / 2;

  return (
    <View style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── KPI 2×2 ── */}
        <View style={s.grid}>
          {cards.map((c) => (
            <View key={c.label} style={[s.card, { width: cardW }]}>
              <View style={s.cardTop}>
                <View style={[s.iconDot, { backgroundColor: c.bg }]}>
                  <Ionicons name={c.icon} size={16} color={c.color} />
                </View>
                <View style={s.trendPill}>
                  <Ionicons name="trending-up" size={10} color="#10B981" />
                  <Text style={s.trendTxt}>{c.trend}</Text>
                </View>
              </View>
              <Text style={s.cardVal}>{c.val}</Text>
              <Text style={s.cardLbl}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Revenue Trend / Sparkline ── */}
        <View style={s.section}>
          <Text style={s.secTitle}>Xu hướng doanh thu</Text>
          <Text style={s.secSub}>{metrics?.revenueNote ?? 'Phân tích theo thời gian thực'}</Text>

          <View style={s.sparkWrap}>
            {[30, 50, 38, 62, 45, 78, 55, 85, 68, 95, 80, 100].map((h, i) => (
              <View key={i} style={[s.sparkBar, { height: h * 0.85, backgroundColor: i >= 10 ? '#10B981' : '#1E293B' }]} />
            ))}
          </View>

          <View style={s.periods}>
            {['1 ngày', '7 ngày', '30 ngày', '90 ngày'].map((p, i) => (
              <View key={p} style={[s.periodChip, i === 1 && s.periodActive]}>
                <Text style={[s.periodTxt, i === 1 && s.periodTxtActive]}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Conversion Funnel ── */}
        <View style={s.section}>
          <Text style={s.secTitle}>Phễu chuyển đổi</Text>
          <FunnelRow label="Xem trang" value="1,250" pct={100} color="#6366F1" />
          <FunnelRow label="Thêm giỏ hàng" value="340" pct={65} color="#8B5CF6" />
          <FunnelRow label="Thanh toán" value="180" pct={40} color="#F59E0B" />
          <FunnelRow label="Hoàn tất" value="156" pct={32} color="#10B981" />
        </View>

      </ScrollView>
    </View>
  );
}

function FunnelRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <View style={s.funnelRow}>
      <View style={s.funnelInfo}>
        <Text style={s.funnelLbl}>{label}</Text>
        <Text style={s.funnelVal}>{value}</Text>
      </View>
      <View style={s.funnelTrack}>
        <View style={[s.funnelFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  loadWrap: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 32, paddingTop: 16 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  iconDot: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  trendTxt: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  cardVal: { fontSize: 20, fontWeight: '700', color: '#F8FAFC' },
  cardLbl: { fontSize: 10, fontWeight: '500', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },

  section: { marginTop: 24, marginHorizontal: 20, backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  secTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  secSub: { fontSize: 12, fontWeight: '400', color: '#64748B', marginTop: 2, marginBottom: 16 },

  sparkWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, gap: 4, marginBottom: 16 },
  sparkBar: { flex: 1, borderRadius: 4 },

  periods: { flexDirection: 'row', gap: 8 },
  periodChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#0F172A' },
  periodActive: { backgroundColor: 'rgba(16,185,129,0.12)' },
  periodTxt: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  periodTxtActive: { color: '#10B981' },

  funnelRow: { marginTop: 14, gap: 6 },
  funnelInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  funnelLbl: { fontSize: 13, fontWeight: '400', color: '#94A3B8' },
  funnelVal: { fontSize: 13, fontWeight: '700', color: '#F8FAFC' },
  funnelTrack: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  funnelFill: { height: '100%', borderRadius: 3 },
});
