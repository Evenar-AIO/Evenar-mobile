import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ADMIN_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E', // Emerald for success/approve
  danger: '#ef4444',
  warning: '#f59e0b',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

// Fallback pattern image if no URL
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=600&auto=format&fit=crop';

export default function AdminEventsScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadEvents = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1 && !isRefresh) setLoading(true);
      const limit = 10;
      const data: any = await adminService.getEvents({ page: pageNum, limit });
      
      const newItems = data?.data ?? data ?? [];
      
      if (pageNum === 1) {
        setEvents(newItems);
      } else {
        setEvents(prev => [...prev, ...newItems]);
      }
      
      setHasMore(newItems.length === limit);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadEvents(1, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    loadEvents(page + 1);
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveEvent(id);
      loadEvents(1, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteEvent(id);
      loadEvents(1, true);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter events based on active tab
  const filteredEvents = events.filter((e) => 
    activeTab === 'pending' ? !e.isApproved : e.isApproved
  );

  const renderEvent = ({ item: event, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 50)}
      style={styles.card}
    >
      <Pressable 
        onPress={() => router.push(`/admin/events/${event._id}`)}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        {/* Cover Image & Status Badge overlay */}
        <View style={styles.imageContainer}>
           <Image
              source={{ uri: event.imageURL || DEFAULT_IMAGE }}
              style={styles.image}
              contentFit="cover"
              transition={200}
           />
           <View style={styles.overlayGradient} />
           <View style={[styles.statusBadge, { backgroundColor: event.isApproved ? ADMIN_COLORS.accent : ADMIN_COLORS.warning }]}>
              <ThemedText style={styles.statusText}>
                {event.isApproved ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
              </ThemedText>
           </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
           <View style={styles.titleRow}>
              <ThemedText style={styles.eventName} numberOfLines={2}>
                {event.name}
              </ThemedText>
           </View>
           
           <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                 <Ionicons name="calendar-outline" size={12} color={ADMIN_COLORS.textDim} />
                 <ThemedText style={styles.metaText}>
                   {new Date(event.startDate || event.createdAt).toLocaleDateString('vi-VN')}
                 </ThemedText>
              </View>
              <View style={styles.metaItem}>
                 <Ionicons name="person-outline" size={12} color={ADMIN_COLORS.textDim} />
                 <ThemedText style={styles.metaText} numberOfLines={1}>
                   {event.organizerName || 'Ban tổ chức'}
                 </ThemedText>
              </View>
           </View>
           
           <View style={styles.metaItemFull}>
              <Ionicons name="location-outline" size={12} color={ADMIN_COLORS.textDim} />
              <ThemedText style={styles.metaText} numberOfLines={1}>
                 {event.location || 'Chưa cập nhật địa điểm'}
              </ThemedText>
           </View>
        </View>
      </Pressable>

      {/* Action Footer (Compact) */}
      <View style={styles.cardFooter}>
         {!event.isApproved ? (
            <View style={styles.actionSplit}>
               <Pressable 
                 onPress={() => handleDelete(event._id)} 
                 style={[styles.actionBtn, { backgroundColor: ADMIN_COLORS.danger + '15' }]}
               >
                 <Ionicons name="close" size={16} color={ADMIN_COLORS.danger} style={styles.btnIcon} />
                 <ThemedText style={[styles.btnText, { color: ADMIN_COLORS.danger }]}>Từ chối</ThemedText>
               </Pressable>
               <Pressable 
                 onPress={() => handleApprove(event._id)} 
                 style={[styles.actionBtn, { backgroundColor: ADMIN_COLORS.accent }]}
               >
                 <Ionicons name="checkmark" size={16} color="#fff" style={styles.btnIcon} />
                 <ThemedText style={[styles.btnText, { color: '#000' }]}>Duyệt Ngay</ThemedText>
               </Pressable>
            </View>
         ) : (
            <View style={styles.actionSplit}>
               <Pressable 
                 onPress={() => handleDelete(event._id)} 
                 style={[styles.actionBtn, { backgroundColor: ADMIN_COLORS.danger + '15', flex: 0.3 }]}
               >
                 <Ionicons name="trash-outline" size={16} color={ADMIN_COLORS.danger} />
               </Pressable>
               <Pressable 
                 onPress={() => router.push(`/admin/events/${event._id}`)} 
                 style={[styles.actionBtn, { backgroundColor: ADMIN_COLORS.surfaceLight, flex: 0.7 }]}
               >
                 <ThemedText style={[styles.btnText, { color: ADMIN_COLORS.text }]}>Xem chi tiết</ThemedText>
               </Pressable>
            </View>
         )}
      </View>
    </Animated.View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: ADMIN_COLORS.bg }]}>
      {/* Top Bar for Tabs */}
      <View style={styles.headerArea}>
         <ThemedText style={styles.headerTitle}>Quản lý Sự kiện</ThemedText>
         <View style={styles.tabContainer}>
            <Pressable 
              onPress={() => setActiveTab('pending')}
              style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
            >
               <ThemedText style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
                 Cần duyệt ({events.filter(e => !e.isApproved).length})
               </ThemedText>
            </Pressable>
            <Pressable 
              onPress={() => setActiveTab('approved')}
              style={[styles.tabBtn, activeTab === 'approved' && styles.tabBtnActive]}
            >
               <ThemedText style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
                 Đã duyệt
               </ThemedText>
            </Pressable>
         </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_COLORS.accent} />
          }
          ListFooterComponent={() => 
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={ADMIN_COLORS.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
             <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color={ADMIN_COLORS.textDim} style={{ marginBottom: 12, opacity: 0.5 }} />
                <ThemedText style={styles.emptyText}>
                   {activeTab === 'pending' ? 'Không có sự kiện nào cần xử lý.' : 'Chưa có sự kiện nào được duyệt.'}
                </ThemedText>
             </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: ADMIN_COLORS.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: ADMIN_COLORS.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: ADMIN_COLORS.textDim,
  },
  tabTextActive: {
    color: ADMIN_COLORS.text,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  imageContainer: {
    height: 140, // Elegant aspect ratio
    position: 'relative',
    backgroundColor: ADMIN_COLORS.surfaceLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Slight dim for text contrast
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000', // High contrast for badges
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
    lineHeight: 22,
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: ADMIN_COLORS.textDim,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnIcon: {
    marginRight: 6,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 13,
    color: ADMIN_COLORS.textDim,
  }
});
