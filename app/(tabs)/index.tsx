import { useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Text,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEventStore } from '@/store/event.store';
import { useCartStore } from '@/store/cart.store';
import type { EventItem } from '@/features/event/types/event.type';
import { Ionicons } from '@expo/vector-icons';

const HERO_VIDEO_URL =
  'https://res.cloudinary.com/dss5bmgcf/video/upload/v1762952736/hero_knusjw.mp4';
// const { width: SCREEN_W } = Dimensions.get('window');
const HERO_H = 340;

/* ---------- conditional expo-video (native only) ---------- */
let useVideoPlayer: any = null;
let VideoViewComp: any = null;
if (Platform.OS !== 'web') {
  try {
    const mod = require('expo-video');
    useVideoPlayer = mod.useVideoPlayer;
    VideoViewComp = mod.VideoView;
  } catch { }
}

/* ---------- Web: HTML5 <video> ---------- */
function WebVideo({ uri }: { uri: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { ref.current?.play().catch(() => { }); }, []);
  return (
    <video
      ref={ref as any}
      src={uri}
      autoPlay loop muted playsInline
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

/* ---------- Native: expo-video ---------- */
function NativeVideo({ uri }: { uri: string }) {
  if (!useVideoPlayer || !VideoViewComp) return null;
  const player = useVideoPlayer(uri, (p: any) => { p.loop = true; p.muted = true; p.play(); });
  return <VideoViewComp player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

/* ========== MAIN SCREEN ========== */
export default function HomeScreen() {
  const { events, fetchEvents } = useEventStore();
  const { items: cartItems, fetchCart } = useCartStore();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const insets = useSafeAreaInsets();
  const { width: SCREEN_W } = useWindowDimensions();

  useEffect(() => {
    fetchEvents();
    fetchCart();
  }, [fetchEvents, fetchCart]);

  // Just using the same event list for placeholders, randomly shuffling or slicing
  const trendingEvents = events.slice(0, 5);
  const liveMusicEvents = [...events].reverse().slice(0, 5);
  const workshopEvents = events.length > 2 ? [events[0], events[2], ...events.slice(1, 2)] : events;

  // Render a horizontal event card
  const renderHorizontalCard = ({ item }: { item: EventItem }) => {
    const date = item.startTime ? new Date(item.startTime) : null;
    let dateStr = 'TBA';
    if (date) {
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      dateStr = `${d} Tháng ${m}, ${y}`;
    }

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/events/[id]', params: { id: item._id } })}
        style={({ pressed }) => [
          styles.cardHorizontal,
          { width: Math.min(SCREEN_W * 0.75, 300) },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.cardImgWrap}>
          {item.imageURL ? (
            <Image source={{ uri: item.imageURL }} style={styles.cardImg} />
          ) : (
            <View style={[styles.cardImg, { backgroundColor: palette.surface2, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="musical-notes-outline" size={32} color={palette.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.cardPrice, { color: palette.success }]}>
            Từ 120.000 đ
          </Text>
          <View style={styles.cardDateRow}>
            <Ionicons name="calendar-outline" size={13} color={palette.textMuted} />
            <Text style={[styles.cardDateText, { color: palette.textSecondary }]} numberOfLines={1}>
              {dateStr}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSection = (title: string, data: EventItem[]) => {
    if (!data || data.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
          <Pressable style={styles.sectionLinkWrap} onPress={() => router.push('/events')}>
            <Text style={[styles.sectionLink, { color: palette.textSecondary }]}>Xem thêm</Text>
            <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
          </Pressable>
        </View>

        <FlatList
          horizontal
          data={data}
          keyExtractor={(i) => i._id + Math.random().toString()} // Added random for duplicated mock data
          renderItem={renderHorizontalCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          snapToInterval={Math.min(SCREEN_W * 0.75, 300) + 16}
          decelerationRate="fast"
          style={{ width: SCREEN_W }}
        />
      </View>
    );
  };

  return (
    <ThemedView style={[styles.root, { width: SCREEN_W }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: palette.background, paddingTop: insets.top || 16 }]}>
        <Text style={[styles.logoText, { color: palette.text }]}>combos</Text>
        <View style={styles.headerIcons}>
          <Pressable style={[styles.iconBtn, { backgroundColor: palette.surface1 }]} onPress={() => router.push('/events')}>
            <Ionicons name="search" size={20} color={palette.text} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: palette.surface1 }]} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={20} color={palette.text} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: palette.surface1 }]} onPress={() => router.push('/cart')}>
            <Ionicons name="cart-outline" size={20} color={palette.text} />
            {cartItems.length > 0 && (
              <View style={[styles.badge, { backgroundColor: palette.accentAlt }]}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ width: SCREEN_W }}
      >
        {/* Video Hero */}
        <View style={styles.heroContainer}>
          {Platform.OS === 'web' ? <WebVideo uri={HERO_VIDEO_URL} /> : <NativeVideo uri={HERO_VIDEO_URL} />}
          <View style={styles.heroOverlay} />

          <View style={styles.heroInner}>
            <Text style={styles.heroTitle}>Experience The Extraordinary</Text>
            <Pressable
              style={({ pressed }) => [styles.btnPrimary, { backgroundColor: palette.accent }, pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/events')}
            >
              <Text style={styles.btnPrimaryTxt}>Khám phá sự kiện</Text>
            </Pressable>
          </View>
        </View>

        {/* Categories */}
        {renderSection('🔥 Sự kiện xu hướng', trendingEvents)}
        {renderSection('Nhạc sống', liveMusicEvents)}
        {renderSection('Hội thảo & Workshop', workshopEvents)}
        {renderSection('Sân khấu & Nghệ thuật', trendingEvents)}

      </ScrollView>
    </ThemedView>
  );
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  /* --- Header --- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  logoText: {
    fontFamily: 'Righteous_400Regular',
    fontSize: 28,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
  },

  /* --- Hero --- */
  heroContainer: {
    width: '100%',
    height: HERO_H,
    position: 'relative',
    marginBottom: 8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroInner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontFamily: 'Righteous_400Regular',
    fontSize: 34,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 20,
  },
  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8, // Less rounded per ticketbox style
  },
  btnPrimaryTxt: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#fff',
  },

  /* --- Horizontal Sections --- */
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  sectionLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLink: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },

  /* --- Horizontal Event Card --- */
  cardHorizontal: {
    // Width is now dynamic
  },
  cardImgWrap: {
    width: '100%',
    aspectRatio: 16 / 9, // Wide format
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBody: {
    paddingRight: 8,
    gap: 4,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
  },
  cardPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    marginTop: 2,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cardDateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
});
