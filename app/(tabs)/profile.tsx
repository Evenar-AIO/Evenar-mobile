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
    Platform,
    TouchableOpacity,
    FlatList
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

const { width, height } = Dimensions.get('window');

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
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [selDay, setSelDay] = useState<string | null>(null);
  const [selMonth, setSelMonth] = useState<string | null>(null);
  const [selYear, setSelYear] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'day' | 'month' | 'year' | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [uploading, setUploading] = useState(false);

  // Password State
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const user = (state.user as any) || {
    fullName: 'Guest User',
    email: 'guest@example.com',
    role: 'customer',
    avatar: '',
    gender: null,
    birthday: null,
    phoneNumber: '',
    address: '',
  };

  useEffect(() => {
    if (state.user) {
        const u = state.user as any;
        setEditName(u.fullName || '');
        setEditGender((u.gender?.toLowerCase() as any) || null);
        setEditPhone(u.phoneNumber || '');
        setEditAddress(u.address || '');
        
        if (u.birthday) {
          const bday = new Date(u.birthday);
          if (!isNaN(bday.getTime())) {
            setSelDay(bday.getDate().toString().padStart(2, '0'));
            setSelMonth((bday.getMonth() + 1).toString().padStart(2, '0'));
            setSelYear(bday.getFullYear().toString());
          }
        }
    }
  }, [state.user, isEditModalVisible]);

  const handleLogout = () => {
    setIsEditModalVisible(false);
    setIsPassModalVisible(false);

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
        let birthday: string | undefined = undefined;
        if (selDay && selMonth && selYear) {
          birthday = `${selYear}-${selMonth}-${selDay}`;
        }

        const updatedUser: any = await profileService.updateProfile({
            fullName: editName.trim(),
            gender: editGender,
            birthday,
            phoneNumber: editPhone.trim(),
            address: editAddress.trim(),
        });
        
        await setSession({ user: updatedUser, accessToken: state.accessToken! });
        showToast({ message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        setIsEditModalVisible(false);
    } catch (err: any) {
        showToast({ message: 'Lỗi: ' + (err.message || 'Cập nhật thất bại'), type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPass || !confirmPass) {
        showToast({ message: 'Vui lòng điền mật khẩu mới', type: 'error' });
        return;
    }
    if (newPass !== confirmPass) {
        showToast({ message: 'Mật khẩu xác nhận không khớp', type: 'error' });
        return;
    }
    if (newPass.length < 8) {
        showToast({ message: 'Mật khẩu mới phải từ 8 ký tự', type: 'error' });
        return;
    }

    setLoading(true);
    try {
        await profileService.changePassword({ newPassword: newPass });
        showToast({ message: 'Đổi mật khẩu thành công!', type: 'success' });
        setIsPassModalVisible(false);
        setNewPass('');
        setConfirmPass('');
    } catch (err: any) {
        showToast({ message: 'Lỗi: ' + (err.message || 'Cập nhật thất bại'), type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const renderPickerModal = () => {
    if (!activePicker) return null;

    let data: string[] = [];
    let title = '';
    let curr = '';
    let setter = (v: string) => {};

    if (activePicker === 'day') {
      data = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
      title = 'Chọn Ngày';
      curr = selDay || '';
      setter = setSelDay;
    } else if (activePicker === 'month') {
      data = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
      title = 'Chọn Tháng';
      curr = selMonth || '';
      setter = setSelMonth;
    } else {
      data = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());
      title = 'Chọn Năm';
      curr = selYear || '';
      setter = setSelYear;
    }

    return (
      <Modal visible transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
          <View style={styles.modalPickerContent}>
            <View style={styles.modalPickerHeader}>
              <ThemedText style={styles.modalPickerTitle}>{title}</ThemedText>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const active = item === curr;
                return (
                  <TouchableOpacity 
                    onPress={() => {
                      setter(item);
                      setActivePicker(null);
                    }}
                    style={[styles.listItem, active ? styles.listItemActive : null]}
                  >
                    <ThemedText style={[styles.listItemText, active ? styles.listItemTextActive : null]}>
                      {item}
                    </ThemedText>
                    {active && <Ionicons name="checkmark" size={20} color={PROFILE_COLORS.accentAlt} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    );
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
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBg}
        >
            <ThemedView style={[styles.modalContent, { backgroundColor: PROFILE_COLORS.bg }]}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Chỉnh sửa hồ sơ</ThemedText>
                    <Pressable onPress={() => setIsEditModalVisible(false)}>
                        <Ionicons name="close" size={28} color={PROFILE_COLORS.textDim} />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editForm}>
                    <View style={styles.editSection}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="person-circle-outline" size={18} color={PROFILE_COLORS.accentAlt} />
                            <ThemedText style={styles.sectionTitle}>Thông tin cơ bản</ThemedText>
                        </View>
                        <View style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Tên hiển thị</ThemedText>
                                <TextInput 
                                    style={styles.input}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Nhập tên mới"
                                    placeholderTextColor="#475569"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Email (Không thể sửa)</ThemedText>
                                <View style={[styles.input, styles.inputDisabled]}>
                                    <ThemedText style={styles.disabledText}>{user.email}</ThemedText>
                                    <Ionicons name="lock-closed" size={16} color="#475569" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Giới tính</ThemedText>
                                <View style={styles.genderRow}>
                                    {([
                                        { label: 'Nam', value: 'male', icon: 'male' },
                                        { label: 'Nữ', value: 'female', icon: 'female' },
                                        { label: 'Khác', value: 'other', icon: 'ellipsis-horizontal' },
                                    ] as const).map(option => {
                                        const active = editGender === option.value;
                                        return (
                                            <TouchableOpacity 
                                                key={option.value}
                                                onPress={() => setEditGender(option.value)}
                                                style={[styles.genderChip, active ? styles.genderChipActive : null]}
                                            >
                                                <Ionicons name={option.icon as any} size={14} color={active ? '#fff' : '#64748B'} />
                                                <ThemedText style={[styles.genderText, active ? styles.genderTextActive : null]}>{option.label}</ThemedText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.editSection}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="calendar-outline" size={18} color={PROFILE_COLORS.accentAlt} />
                            <ThemedText style={styles.sectionTitle}>Ngày sinh</ThemedText>
                        </View>
                        <View style={styles.dateSelectorRow}>
                            <TouchableOpacity onPress={() => setActivePicker('day')} style={styles.dateBox}>
                                <ThemedText style={styles.dateLabel}>Nngày</ThemedText>
                                <ThemedText style={styles.dateValue}>{selDay || '--'}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActivePicker('month')} style={styles.dateBox}>
                                <ThemedText style={styles.dateLabel}>Tháng</ThemedText>
                                <ThemedText style={styles.dateValue}>{selMonth || '--'}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActivePicker('year')} style={styles.dateBox}>
                                <ThemedText style={styles.dateLabel}>Năm</ThemedText>
                                <ThemedText style={styles.dateValue}>{selYear || '----'}</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.editSection}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="call-outline" size={18} color={PROFILE_COLORS.accentAlt} />
                            <ThemedText style={styles.sectionTitle}>Liên hệ & Địa chỉ</ThemedText>
                        </View>
                        <View style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
                                <TextInput 
                                    style={styles.input}
                                    value={editPhone}
                                    onChangeText={setEditPhone}
                                    keyboardType="phone-pad"
                                    placeholder="09xx xxx xxx"
                                    placeholderTextColor="#475569"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.inputLabel}>Địa chỉ</ThemedText>
                                <TextInput 
                                    style={[styles.input, { height: 100, paddingTop: 16 }]}
                                    value={editAddress}
                                    onChangeText={setEditAddress}
                                    multiline
                                    placeholder="Nhập địa chỉ giao hàng của bạn"
                                    placeholderTextColor="#475569"
                                />
                            </View>
                        </View>
                    </View>

                    <Pressable 
                        style={[styles.saveBtn, { backgroundColor: PROFILE_COLORS.accentAlt }]}
                        onPress={handleUpdateProfile}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={[styles.saveBtnText, { color: '#fff' }]}>Lưu thay đổi</ThemedText>}
                    </Pressable>
                </ScrollView>
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
            <ThemedView style={[styles.modalContent, { backgroundColor: PROFILE_COLORS.surface, height: 'auto', paddingBottom: 40 }]}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Đổi mật khẩu</ThemedText>
                    <Pressable onPress={() => setIsPassModalVisible(false)}>
                        <Ionicons name="close" size={24} color={PROFILE_COLORS.textDim} />
                    </Pressable>
                </View>

                <View style={[styles.editForm, { gap: 20 }]}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Mật khẩu mới</ThemedText>
                        <View style={styles.passwordInputWrapper}>
                            <TextInput 
                                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                                value={newPass}
                                onChangeText={setNewPass}
                                secureTextEntry={!showNewPass}
                                placeholder="Tối thiểu 8 ký tự"
                                placeholderTextColor={PROFILE_COLORS.textDim}
                            />
                            <Pressable 
                                style={styles.visibilityToggle} 
                                onPress={() => setShowNewPass(!showNewPass)}
                            >
                                <Ionicons name={showNewPass ? "eye-off" : "eye"} size={20} color="#64748B" />
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Xác nhận mật khẩu</ThemedText>
                        <View style={styles.passwordInputWrapper}>
                            <TextInput 
                                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                                value={confirmPass}
                                onChangeText={setConfirmPass}
                                secureTextEntry={!showConfirmPass}
                                placeholder="••••••••"
                                placeholderTextColor={PROFILE_COLORS.textDim}
                            />
                            <Pressable 
                                style={styles.visibilityToggle} 
                                onPress={() => setShowConfirmPass(!showConfirmPass)}
                            >
                                <Ionicons name={showConfirmPass ? "eye-off" : "eye"} size={20} color="#64748B" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Criteria Box */}
                    <View style={styles.criteriaBox}>
                        <View style={styles.criteriaHeader}>
                            <Ionicons name="shield-checkmark" size={16} color="#7C3AED" />
                            <ThemedText style={styles.criteriaTitle}>Yêu cầu bảo mật</ThemedText>
                        </View>
                        <View style={styles.criteriaList}>
                            <View style={styles.criteriaItem}>
                                <View style={[styles.criteriaDot, newPass.length >= 8 && styles.criteriaDotActive]} />
                                <ThemedText style={[styles.criteriaText, newPass.length >= 8 && styles.criteriaTextActive]}>Tối thiểu 8 ký tự</ThemedText>
                            </View>
                            <View style={styles.criteriaItem}>
                                <View style={[styles.criteriaDot, /[0-9]/.test(newPass) && styles.criteriaDotActive]} />
                                <ThemedText style={[styles.criteriaText, /[0-9]/.test(newPass) && styles.criteriaTextActive]}>Có ít nhất 1 chữ số</ThemedText>
                            </View>
                            <View style={styles.criteriaItem}>
                                <View style={[styles.criteriaDot, (newPass === confirmPass && newPass.length > 0) && styles.criteriaDotActive]} />
                                <ThemedText style={[styles.criteriaText, (newPass === confirmPass && newPass.length > 0) && styles.criteriaTextActive]}>Khớp nhau</ThemedText>
                            </View>
                        </View>
                    </View>

                    <Pressable 
                        style={[styles.saveBtn, { backgroundColor: '#a855f7' }]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={[styles.saveBtnText, { color: '#fff' }]}>Cập nhật mật khẩu</ThemedText>}
                    </Pressable>
                </View>
            </ThemedView>
        </KeyboardAvoidingView>
      </Modal>

      {renderPickerModal()}
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
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PROFILE_COLORS.accentAlt },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: PROFILE_COLORS.accentAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: PROFILE_COLORS.bg },
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
  modalBg: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.9)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  
  editForm: { gap: 24, paddingBottom: 60 },
  editSection: { gap: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  formCard: { backgroundColor: '#0F172A', borderRadius: 20, padding: 16, gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', marginLeft: 4 },
  input: { backgroundColor: '#020617', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1.5, borderColor: '#1E293B' },
  inputDisabled: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', borderColor: '#1E293B', opacity: 0.6 },
  disabledText: { color: '#64748B', fontSize: 16 },
  
  genderRow: { flexDirection: 'row', gap: 8 },
  genderChip: { flex: 1, flexDirection: 'row', height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#1E293B', backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center', gap: 6 },
  genderChipActive: { borderColor: PROFILE_COLORS.accentAlt, backgroundColor: 'rgba(59, 130, 246, 0.08)' },
  genderText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  genderTextActive: { color: PROFILE_COLORS.accentAlt },

  dateSelectorRow: { flexDirection: 'row', gap: 8 },
  dateBox: { flex: 1, height: 60, borderRadius: 12, borderWidth: 1.5, borderColor: '#1E293B', backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', gap: 2 },
  dateLabel: { fontSize: 9, color: '#64748B', fontWeight: '800', textTransform: 'uppercase' },
  dateValue: { fontSize: 16, color: '#F8FAFC', fontWeight: '800' },

  saveBtn: { borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveBtnText: { fontSize: 16, fontWeight: '900' },

  // Picker Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalPickerContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: height * 0.45, paddingHorizontal: 24 },
  modalPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderColor: '#1E293B' },
  modalPickerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  listItemActive: { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: 12, marginHorizontal: -12, paddingHorizontal: 12 },
  listItemText: { fontSize: 16, color: '#94A3B8' },
  listItemTextActive: { color: PROFILE_COLORS.accentAlt, fontWeight: '800' },

  // Password Specific Styles
  passwordInputWrapper: { flexDirection: 'row', alignItems: 'center' },
  visibilityToggle: { 
    height: 56, // Matches input height
    width: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#020617', 
    borderWidth: 1.5, 
    borderColor: '#1E293B', 
    borderLeftWidth: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16
  },
  criteriaBox: { backgroundColor: 'rgba(124, 58, 237, 0.05)', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
  criteriaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  criteriaTitle: { fontSize: 13, fontWeight: '800', color: '#F8FAFC' },
  criteriaList: { gap: 8 },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  criteriaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#334155' },
  criteriaDotActive: { backgroundColor: '#22C55E' },
  criteriaText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  criteriaTextActive: { color: '#F8FAFC' },
});
