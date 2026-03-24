import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, Platform, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { adminService } from '@/features/admin/services/admin.service';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const ADMIN_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E', 
  accentAlt: '#3b82f6',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function AdminDashboardScreen() {
  const { logoutAction } = useAuthActions();
  const insets = useSafeAreaInsets();
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await adminService.getDashboard();
        setDashboard(data);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: ADMIN_COLORS.bg }]}>
        <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
      </ThemedView>
    );
  }

  const kpis = [
    { label: 'Người dùng', value: dashboard?.totalUsers ?? '0', icon: 'people', color: '#3b82f6' },
    { label: 'Sự kiện', value: dashboard?.totalEvents ?? '0', icon: 'calendar', color: '#a855f7' },
    { label: 'Doanh thu', value: dashboard?.totalRevenue ? `${Math.floor(dashboard.totalRevenue / 1000000)}M` : '0', icon: 'cash', color: '#10b981' },
    { label: 'Yêu cầu', value: dashboard?.totalOrganizerRequests ?? '0', icon: 'briefcase', color: '#f59e0b' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: ADMIN_COLORS.bg }]}>
      {/* Sleek Minimal Header */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
         <View style={styles.topBarLeft}>
            <View style={styles.avatarMini}>
               <ThemedText style={styles.avatarInitials}>A</ThemedText>
            </View>
            <View>
               <ThemedText style={styles.topBarTitle}>Admin</ThemedText>
               <ThemedText style={styles.topBarSubtitle}>Dashboard</ThemedText>
            </View>
         </View>
         <View style={styles.topBarRight}>
            <Pressable onPress={() => {}} style={styles.iconBtn}>
               <Ionicons name="notifications-outline" size={18} color={ADMIN_COLORS.textDim} />
               <View style={styles.notifDot} />
            </Pressable>
            <Pressable onPress={logoutAction} style={[styles.iconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
               <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            </Pressable>
         </View>
      </View>

      <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
      >
        {/* Compact KPI Grid (Data-Dense Form) */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, i) => (
            <Animated.View 
              key={kpi.label} 
              entering={ZoomIn.delay(100 + i * 50)}
              style={[styles.kpiCard, { backgroundColor: ADMIN_COLORS.surface }]}
            >
              <View style={styles.kpiCardInner}>
                 <View style={[styles.iconCircle, { backgroundColor: kpi.color + '15' }]}>
                    <Ionicons name={kpi.icon as any} size={14} color={kpi.color} />
                 </View>
                 <View style={styles.kpiTexts}>
                    <ThemedText style={styles.kpiValue}>{kpi.value}</ThemedText>
                    <ThemedText style={styles.kpiLabel}>{kpi.label}</ThemedText>
                 </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Minimalist Chart Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={[styles.widgetBox, { backgroundColor: ADMIN_COLORS.surface }]}>
          <View style={styles.widgetHeader}>
             <ThemedText style={styles.widgetTitle}>Doanh thu ưu tiên</ThemedText>
             <Pressable onPress={() => router.push('/admin/transactions')}>
                <ThemedText style={styles.widgetAction}>Giao dịch</ThemedText>
             </Pressable>
          </View>
          <View style={styles.barChartArea}>
             {(dashboard?.revenueTrends?.slice(-7) ?? [30, 45, 38, 70, 50, 85, 60]).map((item: any, i: number) => {
                const val = typeof item === 'number' ? item : (item.revenue ?? 0);
                const max = Math.max(...(dashboard?.revenueTrends?.map((t: any) => t.revenue) ?? [100]));
                const height = (val / (max || 1)) * 90;
                return (
                   <View key={i} style={styles.barItem}>
                      <View style={[styles.barValue, { 
                          height: Math.max(height, 4), 
                          backgroundColor: i === 6 ? ADMIN_COLORS.accent : ADMIN_COLORS.surfaceLight 
                      }]} />
                      <ThemedText style={styles.barLabel}>{['T2','T3','T4','T5','T6','T7','CN'][i]}</ThemedText>
                   </View>
                );
             })}
          </View>
        </Animated.View>

        {/* Dense Action Row */}
        <View style={styles.actionRow}>
           <Animated.View entering={FadeInUp.delay(400)} style={[styles.denseActionCard, { backgroundColor: ADMIN_COLORS.surface }]}>
              <View style={styles.denseActionLeft}>
                 <View style={[styles.denseIconBg, { backgroundColor: ADMIN_COLORS.accentAlt + '15' }]}>
                     <Ionicons name="shield-checkmark" size={16} color={ADMIN_COLORS.accentAlt} />
                 </View>
                 <View>
                    <ThemedText style={styles.denseValue}>{dashboard?.pendingApprovals ?? 0}</ThemedText>
                    <ThemedText style={styles.denseLabel}>Chờ duyệt</ThemedText>
                 </View>
              </View>
              <Pressable style={styles.denseBtn} onPress={() => router.push('/admin/events')}>
                 <ThemedText style={styles.denseBtnText}>Xem</ThemedText>
              </Pressable>
           </Animated.View>

           <Animated.View entering={FadeInUp.delay(450)} style={[styles.denseActionCard, { backgroundColor: ADMIN_COLORS.surface }]}>
              <View style={styles.denseActionLeft}>
                 <View style={[styles.denseIconBg, { backgroundColor: ADMIN_COLORS.accent + '15' }]}>
                     <Ionicons name="trending-up" size={16} color={ADMIN_COLORS.accent} />
                 </View>
                 <View>
                    <ThemedText style={styles.denseValue}>+12%</ThemedText>
                    <ThemedText style={styles.denseLabel}>User mới</ThemedText>
                 </View>
              </View>
           </Animated.View>
        </View>

        {/* Dense List Events */}
        <Animated.View entering={FadeInUp.delay(500)} style={[styles.widgetBox, { backgroundColor: ADMIN_COLORS.surface }]}>
           <View style={[styles.widgetHeader, { marginBottom: 12 }]}>
             <ThemedText style={styles.widgetTitle}>Cần xử lý gần đây</ThemedText>
           </View>
           {(dashboard?.pendingEventsList ?? []).slice(0, 3).length === 0 ? (
             <ThemedText style={styles.emptyText}>Trống.</ThemedText>
           ) : (
             (dashboard?.pendingEventsList ?? []).slice(0, 3).map((event: any, i: number) => (
               <View key={event._id} style={[styles.compactRow, i !== 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' }]}>
                  <View style={styles.compactInfo}>
                     <ThemedText style={styles.compactName} numberOfLines={1}>{event.name}</ThemedText>
                     <ThemedText style={styles.compactSub}>{event.organizerName || 'N/A'}</ThemedText>
                  </View>
                  <Pressable onPress={() => adminService.approveEvent(event._id)} style={styles.compactBtn}>
                     <Ionicons name="checkmark" size={12} color={ADMIN_COLORS.bg} />
                  </Pressable>
               </View>
             ))
           )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    backgroundColor: ADMIN_COLORS.bg,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: ADMIN_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    lineHeight: 18,
  },
  topBarSubtitle: {
    fontSize: 10,
    color: ADMIN_COLORS.textDim,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: ADMIN_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    width: (width - 32 - 8) / 2, // 2 columns exactly
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  kpiCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiTexts: {
    flex: 1,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    lineHeight: 20,
  },
  kpiLabel: {
    fontSize: 10,
    color: ADMIN_COLORS.textDim,
  },
  widgetBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
  },
  widgetAction: {
    fontSize: 11,
    color: ADMIN_COLORS.textDim,
    fontWeight: '600',
  },
  barChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100, // Reduced height for data-density
    paddingHorizontal: 4,
  },
  barItem: {
    alignItems: 'center',
    gap: 6,
  },
  barValue: {
    width: 12,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: 8,
    color: ADMIN_COLORS.textDim,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  denseActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  denseActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  denseIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  denseValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    lineHeight: 18,
  },
  denseLabel: {
    fontSize: 9,
    color: ADMIN_COLORS.textDim,
  },
  denseBtn: {
    backgroundColor: ADMIN_COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  denseBtnText: {
    fontSize: 9,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  compactInfo: {
    flex: 1,
    paddingRight: 12,
  },
  compactName: {
    fontSize: 12,
    fontWeight: '600',
    color: ADMIN_COLORS.text,
    marginBottom: 2,
  },
  compactSub: {
    fontSize: 9,
    color: ADMIN_COLORS.textDim,
  },
  compactBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: ADMIN_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: ADMIN_COLORS.textDim,
    fontStyle: 'italic',
  }
});
