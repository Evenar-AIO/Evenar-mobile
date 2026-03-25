import { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const HERO_VIDEO_URL =
  'https://res.cloudinary.com/dss5bmgcf/video/upload/v1762952736/hero_knusjw.mp4';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/* ---------- Web: HTML5 <video> ---------- */
function WebVideo({ uri }: { uri: string }) {
  const ref = useRef<any>(null);
  useEffect(() => { ref.current?.play().catch(() => { }); }, []);
  return (
    <video
      ref={ref}
      src={uri}
      autoPlay loop muted playsInline
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

export default function LandingScreen() {
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(HERO_VIDEO_URL, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    if (Platform.OS !== 'web' && player) {
      player.play();
    }
  }, [player]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Video Background */}
      <View style={styles.videoWrapper}>
        {Platform.OS === 'web' ? (
          <WebVideo uri={HERO_VIDEO_URL} />
        ) : (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
            showsTimecodes={false}
          />
        )}
      </View>

      {/* Overlay for depth */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }]}>
        <Animated.View entering={FadeInDown.duration(1000)} style={styles.header}>
          <View style={styles.glassContainer}>
            <Text style={styles.logo}>Evenar</Text>
          </View>
          <Text style={styles.tagline}>Nơi những khoảnh khắc âm nhạc{'\n'}trở nên bất tận.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(1000).delay(500)} style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Khám phá ngay</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={20} color="#7C3AED" />
            </View>
          </Pressable>

          <View style={styles.secondaryLinks}>
            <Text style={styles.hintText}>Chưa có tài khoản?</Text>
            <Pressable onPress={() => router.push('/signup-role')}>
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly lighter for more vibrance
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    gap: 20,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#FFF',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  logo: {
    fontSize: 58,
    fontFamily: 'Righteous_400Regular',
    color: '#FFF',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 20,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  footer: {
    alignItems: 'center',
    gap: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingLeft: 40,
    paddingRight: 10,
    borderRadius: 50,
    gap: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryLinks: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
  },
  linkText: {
    color: '#7C3AED',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
