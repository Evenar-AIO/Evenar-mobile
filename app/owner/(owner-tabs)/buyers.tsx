import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ownerService } from '@/features/owner/services/owner.service';

export default function OwnerBuyersScreen() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const d = await ownerService.getBuyers(); setBuyers(d?.data ?? d ?? []); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <View style={s.loadWrap}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  return (
    <View style={s.root}>
      {/* Summary Strip */}
      <View style={s.strip}>
        <StripCell label="Tổng KH" value={String(buyers.length)} />
        <View style={s.stripDiv} />
        <StripCell label="Tổng vé" value={String(buyers.reduce((a, b) => a + (b.tickets ?? b.totalTickets ?? 0), 0))} />
        <View style={s.stripDiv} />
        <StripCell label="Doanh thu" value="--" />
      </View>

      {buyers.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="people-outline" size={48} color="#334155" />
          <Text style={s.emptyTitle}>Chưa có khách hàng</Text>
          <Text style={s.emptySub}>Khách hàng sẽ xuất hiện khi có đơn hàng đầu tiên</Text>
        </View>
      ) : (
        <FlatList
          data={buyers}
          keyExtractor={(item) => item._id?.toString()}
          contentContainerStyle={{ padding: 20, gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={s.row}>
              {/* Avatar circle */}
              <View style={[s.avatar, { backgroundColor: COLORS[index % COLORS.length] }]}>  
                <Text style={s.avatarTxt}>{(item.name ?? item.fullName ?? 'K')[0].toUpperCase()}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.name}>{item.name ?? item.fullName ?? 'Khách hàng'}</Text>
                <Text style={s.email}>{item.email ?? '---'}</Text>
              </View>
              <View style={s.right}>
                <View style={s.badge}>
                  <Ionicons name="ticket-outline" size={11} color="#F59E0B" />
                  <Text style={s.badgeTxt}>{item.tickets ?? item.totalTickets ?? 0}</Text>
                </View>
                <Text style={s.rev}>{item.total ?? item.totalSpend ?? '₫0'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const COLORS = ['#6366F1','#10B981','#F59E0B','#EC4899','#EF4444','#14B8A6'];

function StripCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.stripCell}>
      <Text style={s.stripVal}>{value}</Text>
      <Text style={s.stripLbl}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  loadWrap: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },

  strip: { flexDirection: 'row', backgroundColor: '#1E293B', marginHorizontal: 20, marginTop: 16, borderRadius: 16, paddingVertical: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  stripCell: { flex: 1, alignItems: 'center' },
  stripVal: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  stripLbl: { fontSize: 10, fontWeight: '500', color: '#64748B', textTransform: 'uppercase', marginTop: 2 },
  stripDiv: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.06)', alignSelf: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  avatar: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  email: { fontSize: 11, fontWeight: '400', color: '#64748B', marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },
  rev: { fontSize: 14, fontWeight: '700', color: '#10B981' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#E2E8F0' },
  emptySub: { fontSize: 13, fontWeight: '400', color: '#64748B', textAlign: 'center', paddingHorizontal: 40 },
});
