import { useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    Pressable, 
    StyleSheet, 
    View, 
    ScrollView, 
    Dimensions, 
    Alert,
    ImageBackground,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthStore } from '@/store/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Shadows, Spacing } from '@/constants/theme';
import { profileService } from '@/features/customer/services/profile.service';
import { useToast } from '@/context/ToastContext';
import { API_BASE_URL } from '@/services/apiClient';

const { width } = Dimensions.get('window');

const PROFILE_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E', 
  accentAlt: '#3b82f6', 
  danger: '#ef4444', 
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

const DEFAULT_AVATAR = 'https://avatar.vercel.sh/user?size=150';

export default function ProfileScreen() {
  const { state, setSession } = useAuthStore();
  const { logoutAction } = useAuthActions();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPassModalVisible, setIsPassModalVisible] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Password State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const user = state.user || {
    fullName: 'Guest User',
    email: 'guest@example.com',
    role: 'customer',
    avatar: '',
  };

  useEffect(() => {
    if (state.user) {
        setEditName(state.user.fullName || '');
    }
  }, [state.user]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
        const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
        if (confirmed) logoutAction();
        return;
    }
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn thoát phiên đăng nhập?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logoutAction }
    ]);
  };

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast({ message: 'Quyền truy cập ảnh bị từ chối', type: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploading(true);
    try {
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const result: any = await profileService.uploadImage(uri, filename);
        
        if (result?.url) {
            const newAvatar = result.url;
            const updatedUser: any = await profileService.updateProfile({
                avatar: newAvatar
            });
            
            await setSession({ user: updatedUser, accessToken: state.accessToken! });
            showToast({ message: 'Cập nhật ảnh thành công!', type: 'success' });
        } else {
            throw new Error('Upload failed');
        }
    } catch (err: any) {
        console.error('Upload error:', err);
        showToast({ message: 'Lỗi tải ảnh: ' + (err.message || 'Lỗi mạng'), type: 'error' });
    } finally {
        setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
        showToast({ message: 'Tên không được để trống', type: 'error' });
        return;
    }

    setLoading(true);
    try {
        const updatedUser: any = await profileService.updateProfile({
            fullName: editName,
        });
        
        await setSession({ user: updatedUser, accessToken: state.accessToken! });
        showToast({ message: 'Cập nhật tên thành công!', type: 'success' });
        setIsEditModalVisible(false);
    } catch (err: any) {
        showToast({ message: 'Lỗi: ' + (err.message || 'Cập nhật thất bại'), type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
        showToast({ message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
        return;
    }
    if (newPass !== confirmPass) {
        showToast({ message: 'Mật khẩu xác nhận không khớp', type: 'error' });
        return;
    }
    if (newPass.length < 6) {
        showToast({ message: 'Mật khẩu mới phải từ 6 ký tự', type: 'error' });
        return;
    }

    setLoading(true);
    try {
        await profileService.changePassword({ oldPassword: oldPass, newPassword: newPass });
        showToast({ message: 'Đổi mật khẩu thành công!', type: 'success' });
        setIsPassModalVisible(false);
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
    } catch (err: any) {
        showToast({ message: 'Lỗi: ' + (err.message || 'Cập nhật thất bại'), type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000' }}
            style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
            <View style={styles.heroOverlay} />
            
            <Animated.View entering={ZoomIn.duration(600)} style={styles.avatarWrapper}>
                <Image 
                    source={{ uri: user.avatar || DEFAULT_AVATAR }}
                    style={styles.avatar}
                />
                <Pressable 
                    style={styles.editAvatarBtn} 
                    onPress={handleSelectImage}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="camera" size={14} color="#fff" />
                    )}
                </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200)} style={styles.heroInfo}>
                <ThemedText style={styles.fullName}>{user.fullName || 'User Name'}</ThemedText>
                <ThemedText style={styles.email}>{user.email}</ThemedText>
                <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? PROFILE_COLORS.danger + '30' : PROFILE_COLORS.accentAlt + '30' }]}>
                    <ThemedText style={[styles.roleText, { color: user.role === 'admin' ? PROFILE_COLORS.danger : PROFILE_COLORS.accentAlt }]}>
                        {(user.role || 'customer').toUpperCase()}
                    </ThemedText>
                </View>
            </Animated.View>
        </ImageBackground>

        {/* STATS STRIP */}
        <View style={styles.statsStrip}>
            <StatItem label="Đang chờ" value="0" />
            <View style={styles.statDivider} />
            <StatItem label="Đơn hàng" value="-" />
            <View style={styles.statDivider} />
            <StatItem label="Vouchers" value="3" />
        </View>

        {/* BENTO MENU GRID */}
        <View style={styles.menuGrid}>
            <BentoCard 
                icon="receipt-outline" 
                title="Đơn hàng của tôi" 
                subtitle="Xem lịch sử giao dịch"
                color="#22C55E"
                onPress={() => router.push('/orders')}
                fullWidth
            />
            
            <View style={styles.row}>
                <BentoCard 
                    icon="person-outline" 
                    title="Cá nhân" 
                    subtitle="Sửa hồ sơ"
                    color="#3b82f6"
                    onPress={() => setIsEditModalVisible(true)}
                />
                <BentoCard 
                    icon="shield-checkmark-outline" 
                    title="Bảo mật" 
                    subtitle="Đổi mật khẩu"
                    color="#a855f7"
                    onPress={() => setIsPassModalVisible(true)}
                />
            </View>

            {/* LOGOUT BUTTON (DANGER) */}
            <Pressable 
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderStyle: 'dashed', borderWidth: 1, borderColor: PROFILE_COLORS.danger }]}
            >
                <Ionicons name="log-out-outline" size={20} color={PROFILE_COLORS.danger} />
                <ThemedText style={styles.logoutText}>Đăng xuất tài khoản</ThemedText>
            </Pressable>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBg}
        >
            <ThemedView style={[styles.modalContent, { backgroundColor: PROFILE_COLORS.surface }]}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Sửa hồ sơ</ThemedText>
                    <Pressable onPress={() => setIsEditModalVisible(false)}>
                        <Ionicons name="close" size={24} color={PROFILE_COLORS.textDim} />
                    </Pressable>
                </View>

                <View style={styles.editForm}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Họ và tên</ThemedText>
                        <TextInput 
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Nhập tên của bạn"
                            placeholderTextColor={PROFILE_COLORS.textDim}
                        />
                    </View>

                    <Pressable 
                        style={[styles.saveBtn, { backgroundColor: PROFILE_COLORS.accent }]}
                        onPress={handleUpdateProfile}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.saveBtnText}>Lưu thay đổi</ThemedText>}
                    </Pressable>
                </View>
            </ThemedView>
        </KeyboardAvoidingView>
      </Modal>

      {/* PASSWORD MODAL */}
      <Modal
        visible={isPassModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPassModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBg}
        >
            <ThemedView style={[styles.modalContent, { backgroundColor: PROFILE_COLORS.surface }]}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Đổi mật khẩu</ThemedText>
                    <Pressable onPress={() => setIsPassModalVisible(false)}>
                        <Ionicons name="close" size={24} color={PROFILE_COLORS.textDim} />
                    </Pressable>
                </View>

                <View style={styles.editForm}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Mật khẩu hiện tại</ThemedText>
                        <TextInput 
                            style={styles.input}
                            value={oldPass}
                            onChangeText={setOldPass}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor={PROFILE_COLORS.textDim}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Mật khẩu mới</ThemedText>
                        <TextInput 
                            style={styles.input}
                            value={newPass}
                            onChangeText={setNewPass}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor={PROFILE_COLORS.textDim}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Xác nhận mật khẩu</ThemedText>
                        <TextInput 
                            style={styles.input}
                            value={confirmPass}
                            onChangeText={setConfirmPass}
                            secureTextEntry
                            placeholder="••••••••"
                            placeholderTextColor={PROFILE_COLORS.textDim}
                        />
                    </View>

                    <Pressable 
                        style={[styles.saveBtn, { backgroundColor: PROFILE_COLORS.accentAlt }]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={[styles.saveBtnText, { color: '#fff' }]}>Cập nhật mật khẩu</ThemedText>}
                    </Pressable>
                </View>
            </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{value}</ThemedText>
            <ThemedText style={styles.statLabel}>{label}</ThemedText>
        </View>
    );
}

function BentoCard({ icon, title, subtitle, color, onPress, fullWidth = false }: any) {
    return (
        <Pressable 
            onPress={onPress}
            style={[
                styles.bentoCard, 
                { width: fullWidth ? '100%' : (width - 32 - 12) / 2 },
                { backgroundColor: PROFILE_COLORS.surface }
            ]}
        >
            <View style={[styles.bentoIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <ThemedText style={styles.bentoTitle}>{title}</ThemedText>
            <ThemedText style={styles.bentoSub}>{subtitle}</ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PROFILE_COLORS.bg },
  hero: { height: 320, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.7)' },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PROFILE_COLORS.accent },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: PROFILE_COLORS.accent, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: PROFILE_COLORS.bg },
  heroInfo: { alignItems: 'center', gap: 6 },
  fullName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  email: { fontSize: 14, color: PROFILE_COLORS.textDim },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  
  statsStrip: { flexDirection: 'row', backgroundColor: PROFILE_COLORS.surface, marginHorizontal: 16, marginTop: -35, borderRadius: 20, paddingVertical: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', ...Shadows.soft },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: PROFILE_COLORS.text },
  statLabel: { fontSize: 10, color: PROFILE_COLORS.textDim, textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'center' },

  menuGrid: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  bentoCard: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bentoIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  bentoTitle: { fontSize: 15, fontWeight: '700', color: PROFILE_COLORS.text },
  bentoSub: { fontSize: 11, color: PROFILE_COLORS.textDim, marginTop: 2 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 20, marginTop: 12, gap: 10 },
  logoutText: { fontSize: 14, fontWeight: '700', color: PROFILE_COLORS.danger },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  editForm: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 12, color: PROFILE_COLORS.textDim, fontWeight: '700', textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  saveBtn: { borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' }
});
