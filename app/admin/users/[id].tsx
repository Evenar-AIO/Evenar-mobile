import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ADMIN_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E', 
  accentAlt: '#3b82f6', 
  danger: '#ef4444', 
  warning: '#f59e0b',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

const DEFAULT_AVATAR = 'https://avatar.vercel.sh/user?size=100';

export default function AdminUserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? 'dark';
  
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    role: '',
  });

  const loadUser = async () => {
    try {
      if (!id) return;
      const data: any = await adminService.getUserById(id);
      setUser(data);
      setEditData({
        username: data.username || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        gender: data.gender || '',
        role: data.role || 'user',
      });
    } catch (error) {
       console.error(error);
       Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleSave = async () => {
    if (!id || !user) return;
    setSaving(true);
    try {
      await adminService.updateUser(id, editData);
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng.');
      setIsEditing(false);
      await loadUser();
    } catch (error) {
       console.error(error);
       Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const handleLockToggle = async () => {
    if (!user) return;
    try {
      if (user.isLocked) {
        await adminService.unlockUser(user._id);
      } else {
        await adminService.lockUser(user._id);
      }
      await loadUser();
      Alert.alert('Thành công', user.isLocked ? 'Đã mở khóa người dùng.' : 'Đã khóa người dùng.');
    } catch (error) {
       Alert.alert('Lỗi', 'Thao tác thất bại.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={ADMIN_COLORS.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
         <ThemedText style={{ color: ADMIN_COLORS.textDim }}>Không tìm thấy người dùng.</ThemedText>
         <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
            <ThemedText style={{ color: ADMIN_COLORS.accent }}>Quay lại</ThemedText>
         </Pressable>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HEADER SECTION */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerContainer}>
           <Image
              source={{ uri: user.avatar || DEFAULT_AVATAR }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
           />
           <View style={styles.headerOverlay} />
           
           <Pressable 
              style={[styles.backBtn, { top: Math.max(insets.top, 20) }]} 
              onPress={() => router.back()}
           >
              <Ionicons name="chevron-back" size={24} color="#fff" />
           </Pressable>

           <View style={styles.headerInfo}>
              {isEditing ? (
                <View style={styles.editTitleRow}>
                    <TextInput 
                        value={editData.username}
                        onChangeText={t => setEditData(prev => ({ ...prev, username: t }))}
                        style={styles.editTitleInput}
                        placeholder="Tên người dùng"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                </View>
              ) : (
                <ThemedText style={styles.usernameText}>{user.username || 'No Name'}</ThemedText>
              )}
              
              <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? ADMIN_COLORS.danger + '30' : ADMIN_COLORS.accentAlt + '30' }]}>
                 <ThemedText style={[styles.roleText, { color: user.role === 'admin' ? ADMIN_COLORS.danger : ADMIN_COLORS.accentAlt }]}>
                   {(user.role || 'user').toUpperCase()}
                 </ThemedText>
              </View>
           </View>
        </Animated.View>

        <View style={styles.mainContent}>
            {/* TOGGLE EDIT BUTTON */}
            <View style={styles.actionHeader}>
                <Pressable 
                    onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    style={[styles.editToggleBtn, { backgroundColor: isEditing ? ADMIN_COLORS.accent : ADMIN_COLORS.surfaceLight }]}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <>
                            <Ionicons name={isEditing ? "checkmark-circle" : "create"} size={18} color={isEditing ? "#000" : ADMIN_COLORS.accent} />
                            <ThemedText style={[styles.editToggleText, { color: isEditing ? "#000" : ADMIN_COLORS.accent }]}>
                                {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
                            </ThemedText>
                        </>
                    )}
                </Pressable>
                {isEditing && (
                    <Pressable onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                        <ThemedText style={styles.cancelText}>Hủy</ThemedText>
                    </Pressable>
                )}
            </View>

            {/* STATS SECTION */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <ThemedText style={styles.statLabel}>Trạng thái</ThemedText>
                    <ThemedText style={[styles.statValue, { color: user.isLocked ? ADMIN_COLORS.danger : ADMIN_COLORS.accent }]}>
                        {user.isLocked ? 'Bị khóa' : 'Hoạt động'}
                    </ThemedText>
                </View>
                <View style={styles.statCard}>
                    <ThemedText style={styles.statLabel}>Xác minh</ThemedText>
                    <ThemedText style={[styles.statValue, { color: user.isVerified ? ADMIN_COLORS.accent : ADMIN_COLORS.warning }]}>
                        {user.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </ThemedText>
                </View>
            </View>

            {/* INFO SECTION */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person" size={18} color={ADMIN_COLORS.accent} />
                    <ThemedText style={styles.sectionTitle}>Thông tin cá nhân</ThemedText>
                </View>
                
                <View style={styles.infoGrid}>
                    <InfoItem 
                        label="Email" 
                        value={editData.email} 
                        originalValue={user.email}
                        icon="mail-outline" 
                        isEditing={isEditing}
                        onChange={t => setEditData(prev => ({ ...prev, email: t }))}
                    />
                    <InfoItem 
                        label="Số điện thoại" 
                        value={editData.phoneNumber} 
                        originalValue={user.phoneNumber || 'Chưa cập nhật'}
                        icon="call-outline" 
                        isEditing={isEditing}
                        onChange={t => setEditData(prev => ({ ...prev, phoneNumber: t }))}
                    />
                    <InfoItem 
                        label="Giới tính" 
                        value={editData.gender} 
                        originalValue={user.gender || 'Bảo mật'}
                        icon="transgender-outline" 
                        isEditing={isEditing}
                        onChange={t => setEditData(prev => ({ ...prev, gender: t }))}
                    />
                    <InfoItem 
                        label="Vai trò" 
                        value={editData.role} 
                        originalValue={user.role}
                        icon="shield-outline" 
                        isEditing={isEditing}
                        onChange={t => setEditData(prev => ({ ...prev, role: t }))}
                    />
                    <InfoItem 
                        label="Địa chỉ" 
                        value={editData.address} 
                        originalValue={user.address || 'Chưa cập nhật'}
                        icon="location-outline" 
                        fullWidth 
                        isEditing={isEditing}
                        onChange={t => setEditData(prev => ({ ...prev, address: t }))}
                    />
                    
                    {!isEditing && (
                        <>
                            <InfoItem label="Ngày tham gia" value={new Date(user.createdAt).toLocaleDateString('vi-VN')} icon="time-outline" />
                            <InfoItem label="Lần cuối hoạt động" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'N/A'} icon="log-in-outline" fullWidth />
                        </>
                    )}
                </View>
            </Animated.View>

            {/* ACTION SECTION */}
            {!isEditing && (
                <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="shield-checkmark" size={18} color={ADMIN_COLORS.accent} />
                        <ThemedText style={styles.sectionTitle}>Tác vụ quản trị</ThemedText>
                    </View>
                    
                    <View style={styles.actionPanel}>
                        <Pressable 
                            style={[styles.adminActionBtn, { borderColor: user.isLocked ? ADMIN_COLORS.accent : ADMIN_COLORS.danger }]}
                            onPress={handleLockToggle}
                        >
                            <Ionicons name={user.isLocked ? "lock-open" : "lock-closed"} size={20} color={user.isLocked ? ADMIN_COLORS.accent : ADMIN_COLORS.danger} />
                            <ThemedText style={[styles.adminActionText, { color: user.isLocked ? ADMIN_COLORS.accent : ADMIN_COLORS.danger }]}>
                                {user.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
                            </ThemedText>
                        </Pressable>
                        
                        <ThemedText style={styles.actionNote}>
                            * Việc khóa tài khoản sẽ ngăn người dùng đăng nhập và thực hiện các giao dịch trên hệ thống.
                        </ThemedText>
                    </View>
                </Animated.View>
            )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoItem({ 
    label, value, originalValue, icon, fullWidth = false, isEditing = false, onChange 
}: { 
    label: string; value: string; originalValue: string; icon: string; fullWidth?: boolean; isEditing?: boolean; onChange?: (t: string) => void 
}) {
    return (
        <View style={[styles.infoItem, fullWidth && { width: '100%' }]}>
            <View style={styles.infoLabelRow}>
                <Ionicons name={icon as any} size={14} color={ADMIN_COLORS.textDim} />
                <ThemedText style={styles.infoLabel}>{label}</ThemedText>
            </View>
            {isEditing && onChange ? (
                <TextInput 
                    value={value}
                    onChangeText={onChange}
                    style={styles.inlineInput}
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    placeholderTextColor={ADMIN_COLORS.textDim + '80'}
                />
            ) : (
                <ThemedText style={styles.infoValue} numberOfLines={fullWidth ? 0 : 1}>{originalValue}</ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerContainer: { height: 260, position: 'relative', justifyContent: 'flex-end' },
  avatar: { ...StyleSheet.absoluteFillObject },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.6)' },
  backBtn: { position: 'absolute', left: 20, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { padding: 24, gap: 8 },
  usernameText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  editTitleRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingBottom: 4 },
  editTitleInput: { fontSize: 28, fontWeight: '800', color: '#fff', padding: 0 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  mainContent: { padding: 20, gap: 24 },
  actionHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  editToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12, borderRadius: 16, borderWeight: 1, borderColor: 'rgba(255,255,255,0.05)' },
  editToggleText: { fontSize: 14, fontWeight: '700' },
  cancelBtn: { paddingHorizontal: 16 },
  cancelText: { color: ADMIN_COLORS.danger, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: ADMIN_COLORS.surface, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', ...Shadows.soft },
  statLabel: { fontSize: 12, color: ADMIN_COLORS.textDim, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700' },
  section: { backgroundColor: ADMIN_COLORS.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: ADMIN_COLORS.text },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  infoItem: { width: '47%' },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: ADMIN_COLORS.textDim, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: ADMIN_COLORS.text, fontWeight: '500' },
  inlineInput: { fontSize: 14, color: ADMIN_COLORS.accentAlt, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: ADMIN_COLORS.accentAlt + '40', paddingVertical: 4 },
  actionPanel: { gap: 12 },
  adminActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed' },
  adminActionText: { fontSize: 15, fontWeight: '700' },
  actionNote: { fontSize: 11, color: ADMIN_COLORS.textDim, fontStyle: 'italic', textAlign: 'center', lineHeight: 16 }
});
