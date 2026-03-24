import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, ScrollView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

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

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=600&auto=format&fit=crop';

export default function AdminEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Editable Fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [ticketCount, setTicketCount] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  
  // Local File State for Preview & Upload
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<any>(null);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalImageUri(result.assets[0].uri);
        setLocalImageFile(result.assets[0]);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  const loadEvent = async () => {
    try {
      if (!id) return;
      const data: any = await adminService.getEventById(id);
      setEvent(data);
      setName(data?.name ?? '');
      setLocation(data?.physicalLocation ?? data?.location ?? '');
      setTicketCount(data?.totalTicketCount?.toString() ?? '');
      setImageURL(data?.imageURL ?? '');
      setLocalImageUri(null);
      setLocalImageFile(null);
      
      // Load TicketInfo 
      if (data?.ticketInfo && Array.isArray(data.ticketInfo)) {
         setTickets(data.ticketInfo.map((t: any) => ({
             ...t,
             editPrice: t.price?.toString() || '0',
             editName: t.ticketName || t.type || 'Standard'
         })));
      } else {
         setTickets([]);
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!id) return;
      
      let finalImageUrl = imageURL;

      // 1. Upload local image first if selected
      if (localImageUri && localImageFile) {
        try {
           const res: any = await adminService.uploadImage(localImageUri, localImageFile.fileName || 'event_banner.jpg');
           if (res?.url) {
             finalImageUrl = res.url;
             setImageURL(finalImageUrl); // Update state directly
           } else {
             Alert.alert('Lỗi', 'Tải ảnh lên mây thất bại (Dữ liệu trả về thiếu Link), vui lòng thử lại.');
             setSaving(false);
             return;
           }
        } catch (uploadError) {
           console.error('Lỗi upload', uploadError);
           Alert.alert('Lỗi', 'Có lỗi khi tải ảnh lên. Sự thay đổi ảnh đã bị hủy.');
           setSaving(false);
           return;
        }
      }

      // 2. Perform event data update
      const payload = { 
        name, 
        physicalLocation: location,
        totalTicketCount: parseInt(ticketCount) || 0,
        imageURL: finalImageUrl,
        ticketInfo: tickets.map(t => ({
           _id: t._id,
           type: t.editName,
           price: parseInt(t.editPrice) || 0,
           quantity: t.quantity || 0
        }))
      };

      await adminService.updateEvent(id, payload as any);
      
      Alert.alert('Thành công', 'Đã cập nhật thông tin sự kiện.');
      setIsEditing(false);
      setLocalImageUri(null); // Clear preview 
      setLocalImageFile(null);
      await loadEvent(); 
    } catch (error) {
       Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const updateTicketField = (index: number, field: string, value: string) => {
      const newTix = [...tickets];
      newTix[index][field] = value;
      setTickets(newTix);
  };

  const handleApprove = async () => {
    try {
      if (!id) return;
      await adminService.approveEvent(id);
      setEvent({ ...event, isApproved: true });
      Alert.alert('Hoàn tất', 'Sự kiện đã được duyệt.');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận vô hiệu hóa (Xóa mềm)',
      'Sự kiện này sẽ bị ẩn khỏi hệ thống (isDeleted = true) nhưng dữ liệu vẫn được lưu trữ.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Vô hiệu hóa', 
          style: 'destructive',
          onPress: async () => {
             try {
               await adminService.deleteEvent(id as string);
               Alert.alert('Thành công', 'Sự kiện đã bị vô hiệu hóa.');
               router.back();
             } catch (error) {
               Alert.alert('Lỗi', 'Không thể vô hiệu hóa sự kiện.');
             }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: ADMIN_COLORS.bg }]}>
         <ActivityIndicator size="large" color={ADMIN_COLORS.accentAlt} />
      </ThemedView>
    );
  }

  if (!event) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: ADMIN_COLORS.bg }]}>
         <ThemedText style={{ color: ADMIN_COLORS.textDim }}>Sự kiện không tồn tại.</ThemedText>
         <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
            <ThemedText style={{ color: ADMIN_COLORS.accentAlt }}>Quay lại</ThemedText>
         </Pressable>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: ADMIN_COLORS.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HERO IMAGE SECTION */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroContainer}>
           <Image
              source={{ uri: localImageUri || (isEditing ? imageURL : event?.imageURL) || DEFAULT_IMAGE }}
              style={styles.heroImage}
              contentFit="cover"
              transition={300}
           />
           <View style={styles.heroOverlay} />
           
           <Pressable 
              style={[styles.backBtn, { top: Math.max(insets.top, 20) }]} 
              onPress={() => router.back()}
           >
              <Ionicons name="chevron-back" size={24} color="#fff" />
           </Pressable>
           
           <View style={styles.heroContent}>
              <View style={[styles.statusBadge, { backgroundColor: event.isApproved ? ADMIN_COLORS.accent : ADMIN_COLORS.warning }]}>
                 <ThemedText style={styles.statusText}>
                   {event.isApproved ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                 </ThemedText>
              </View>
           </View>
        </Animated.View>

        {/* CONTENT SECTION */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.contentWrap}>
           
           <View style={styles.basicInfoCard}>
              <View style={styles.rowBetween}>
                 <ThemedText style={styles.infoLabel}>Mã: {event._id}</ThemedText>
                 <ThemedText style={[styles.infoLabel, { color: ADMIN_COLORS.accentAlt }]}>
                    {event.status?.toUpperCase() || 'ACTIVE'}
                 </ThemedText>
              </View>
              <ThemedText style={styles.basicTitle}>{event.name}</ThemedText>
              
              <View style={styles.metaRowList}>
                 <View style={styles.metaBadge}>
                    <Ionicons name="person" size={12} color={ADMIN_COLORS.textDim} />
                    <ThemedText style={styles.metaBadgeText}>{event.organizerName || 'N/A'}</ThemedText>
                 </View>
                 <View style={styles.metaBadge}>
                    <Ionicons name="calendar" size={12} color={ADMIN_COLORS.textDim} />
                    <ThemedText style={styles.metaBadgeText}>
                      {new Date(event.startDate || event.createdAt).toLocaleDateString('vi-VN')}
                    </ThemedText>
                 </View>
                 <View style={styles.metaBadge}>
                    <Ionicons name="ticket" size={12} color={ADMIN_COLORS.textDim} />
                    <ThemedText style={styles.metaBadgeText}>
                      {event.totalTicketCount || 0} Vé
                    </ThemedText>
                 </View>
              </View>
           </View>

           {!isEditing && (
             <Animated.View entering={FadeInUp.delay(300)}>
               <ThemedText style={styles.sectionTitle}>Thông tin thêm</ThemedText>
               <View style={styles.detailsCard}>
                 
                 <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                       <Ionicons name="time" size={18} color={ADMIN_COLORS.accentAlt} />
                    </View>
                    <View style={styles.detailTextCol}>
                       <ThemedText style={styles.detailLabel}>Thời gian diễn ra</ThemedText>
                       <ThemedText style={styles.detailValue}>Bắt đầu: {event.startTime ? new Date(event.startTime).toLocaleString('vi-VN') : 'N/A'}</ThemedText>
                       <ThemedText style={styles.detailValue}>Kết thúc: {event.endTime ? new Date(event.endTime).toLocaleString('vi-VN') : 'N/A'}</ThemedText>
                    </View>
                 </View>

                 <View style={styles.divider} />

                 <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                       <Ionicons name="document-text" size={18} color={ADMIN_COLORS.accent} />
                    </View>
                    <View style={styles.detailTextCol}>
                       <ThemedText style={styles.detailLabel}>Mô tả</ThemedText>
                       <ThemedText style={styles.detailValueLong}>
                         {event.description || 'Chưa có thông tin.'}
                       </ThemedText>
                    </View>
                 </View>

                 <View style={styles.divider} />

                 <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                       <Ionicons name="pricetag" size={18} color={ADMIN_COLORS.warning} />
                    </View>
                    <View style={styles.detailTextCol}>
                       <ThemedText style={styles.detailLabel}>Thông tin vé</ThemedText>
                       {tickets.length > 0 ? tickets.map((t, idx) => (
                           <ThemedText key={idx} style={styles.detailValue}>
                               • {t.ticketName || t.type || 'Quyền lợi chung'}: {t.price ? `${t.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'} 
                           </ThemedText>
                       )) : <ThemedText style={styles.detailValue}>Không có dữ liệu vé.</ThemedText>}
                    </View>
                 </View>

               </View>
             </Animated.View>
           )}

           {isEditing && (
             <Animated.View entering={FadeInUp}>
               <ThemedText style={styles.sectionTitle}>Chỉnh sửa Thông tin</ThemedText>
               <View style={styles.formCard}>
                  <View style={styles.inputGroup}>
                     <ThemedText style={styles.inputLabel}>Tên sự kiện</ThemedText>
                     <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={ADMIN_COLORS.textDim} multiline />
                  </View>

                  <View style={styles.inputGroup}>
                     <ThemedText style={styles.inputLabel}>Link ảnh Banner (URL)</ThemedText>
                     <View style={{ flexDirection: 'row', gap: 10 }}>
                       <TextInput 
                         value={localImageUri ? '[ Ảnh đã chọn từ thiết bị / Tạm thời ẩn URL ]' : imageURL} 
                         onChangeText={setImageURL} 
                         editable={!localImageUri}
                         style={[styles.input, { flex: 1, color: localImageUri ? ADMIN_COLORS.accent : ADMIN_COLORS.text }]} 
                         placeholderTextColor={ADMIN_COLORS.textDim} 
                       />
                       <Pressable 
                         style={[styles.uploadBtn, { backgroundColor: localImageUri ? ADMIN_COLORS.surfaceLight : ADMIN_COLORS.accentAlt }]}
                         onPress={handlePickImage}
                         disabled={saving}
                       >
                            <Ionicons name={localImageUri ? "checkmark-circle" : "cloud-upload"} size={20} color={localImageUri ? ADMIN_COLORS.accent : "#fff"} />
                       </Pressable>
                     </View>
                  </View>

                  <View style={styles.inputGroup}>
                     <ThemedText style={styles.inputLabel}>Địa điểm tổ chức</ThemedText>
                     <TextInput value={location} onChangeText={setLocation} style={styles.input} placeholderTextColor={ADMIN_COLORS.textDim} />
                  </View>

                  <View style={styles.inputRow}>
                     <View style={[styles.inputGroup, { flex: 1 }]}>
                        <ThemedText style={styles.inputLabel}>Tổng số lượng</ThemedText>
                        <TextInput value={ticketCount} onChangeText={setTicketCount} style={styles.input} keyboardType="numeric" placeholderTextColor={ADMIN_COLORS.textDim} />
                     </View>
                  </View>
               </View>

               <ThemedText style={[styles.sectionTitle, { marginTop: 20 }]}>Chỉnh sửa Loại Vé</ThemedText>
               {tickets.map((t, idx) => (
                 <View key={t._id} style={styles.formCard}>
                    <View style={styles.inputGroup}>
                       <ThemedText style={styles.inputLabel}>Tên Loại vé #{idx + 1}</ThemedText>
                       <TextInput 
                         value={t.editName} 
                         onChangeText={(val) => updateTicketField(idx, 'editName', val)} 
                         style={styles.input} 
                         placeholderTextColor={ADMIN_COLORS.textDim} 
                       />
                    </View>
                    <View style={styles.inputGroup}>
                       <ThemedText style={styles.inputLabel}>Giá vé (VNĐ)</ThemedText>
                       <TextInput 
                         value={t.editPrice} 
                         onChangeText={(val) => updateTicketField(idx, 'editPrice', val)} 
                         style={styles.input} 
                         keyboardType="numeric" 
                         placeholderTextColor={ADMIN_COLORS.textDim} 
                       />
                    </View>
                 </View>
               ))}
               
               <View style={{ height: 40 }} />
             </Animated.View>
           )}

        </Animated.View>
      </ScrollView>

      {/* FIXED BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
         {isEditing ? (
            <>
               <Pressable
                 style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }]}
                 onPress={() => {
                   setIsEditing(false);
                   setName(event?.name ?? '');
                   setLocation(event?.physicalLocation ?? event?.location ?? '');
                   setTicketCount(event?.totalTicketCount?.toString() ?? '');
                   setImageURL(event?.imageURL ?? '');
                   setLocalImageUri(null);
                   setLocalImageFile(null);
                   if (event?.ticketInfo) {
                       setTickets(event.ticketInfo.map((t: any) => ({
                           ...t,
                           editPrice: t.price?.toString() || '0',
                           editName: t.ticketName || t.type || 'Standard'
                       })));
                   }
                 }}
               >
                 <ThemedText style={styles.btnTextPrimary}>Hủy</ThemedText>
               </Pressable>
               <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                 {saving ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={styles.btnTextPrimary}>Lưu thay đổi</ThemedText>}
               </Pressable>
            </>
         ) : (
            <>
               {(!event.isApproved) && (
                 <Pressable style={[styles.actionBtn, styles.approveBtn]} onPress={handleApprove}>
                   <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                   <ThemedText style={styles.btnTextPrimary}>Phê duyệt</ThemedText>
                 </Pressable>
               )}
               <Pressable style={[styles.actionBtn, { backgroundColor: ADMIN_COLORS.surfaceLight }]} onPress={() => setIsEditing(true)}>
                 <Ionicons name="pencil" size={16} color="#fff" />
                 <ThemedText style={styles.btnTextPrimary}>Sửa</ThemedText>
               </Pressable>
               <Pressable style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', flex: 0.5 }]} onPress={handleDelete}>
                 <Ionicons name="trash" size={18} color={ADMIN_COLORS.danger} />
               </Pressable>
            </>
         )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { width: '100%', height: 280, position: 'relative', backgroundColor: ADMIN_COLORS.surface },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20, alignItems: 'flex-start' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  contentWrap: { padding: 16, marginTop: -20 },
  basicInfoCard: { backgroundColor: ADMIN_COLORS.surface, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24, ...Shadows.medium },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  infoLabel: { fontSize: 10, color: ADMIN_COLORS.textDim, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  basicTitle: { fontSize: 22, fontWeight: '800', color: ADMIN_COLORS.text, lineHeight: 28, marginBottom: 16 },
  metaRowList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  metaBadgeText: { fontSize: 11, fontWeight: '600', color: ADMIN_COLORS.textDim },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: ADMIN_COLORS.text, marginLeft: 4, marginBottom: 12 },
  formCard: { backgroundColor: ADMIN_COLORS.surface, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 16, marginBottom: 16 },
  inputGroup: { gap: 8 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: ADMIN_COLORS.textDim },
  input: { backgroundColor: ADMIN_COLORS.bg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: ADMIN_COLORS.text, fontSize: 14, fontWeight: '500' },
  uploadBtn: { backgroundColor: ADMIN_COLORS.accentAlt, justifyContent: 'center', alignItems: 'center', width: 52, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingTop: 16, paddingHorizontal: 20, backgroundColor: 'rgba(2, 6, 23, 0.9)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 16, gap: 8, ...Shadows.soft },
  saveBtn: { backgroundColor: ADMIN_COLORS.accentAlt },
  approveBtn: { backgroundColor: ADMIN_COLORS.accent },
  btnTextPrimary: { fontSize: 14, fontWeight: '700', color: '#fff' },
  detailsCard: { backgroundColor: ADMIN_COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 16, marginBottom: 24 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: ADMIN_COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  detailTextCol: { flex: 1 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: ADMIN_COLORS.text, marginBottom: 4 },
  detailValue: { fontSize: 12, color: ADMIN_COLORS.textDim, lineHeight: 18 },
  detailValueLong: { fontSize: 13, color: ADMIN_COLORS.textDim, lineHeight: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 }
});
