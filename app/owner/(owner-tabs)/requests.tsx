import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ScrollView, Text, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ownerService } from '@/features/owner/services/owner.service';
import { useToast } from '@/context/ToastContext';

const STATUS_MAP: Record<string, { color: string; label: string; icon: any; bg: string }> = {
  pending: { color: '#F59E0B', label: 'Đang chờ duyệt', icon: 'time', bg: 'rgba(245,158,11,0.1)' },
  approved: { color: '#10B981', label: 'Đã được duyệt', icon: 'checkmark-circle', bg: 'rgba(16,185,129,0.1)' },
  rejected: { color: '#EF4444', label: 'Bị từ chối', icon: 'close-circle', bg: 'rgba(239,68,68,0.1)' },
};

export default function OwnerRequestsScreen() {
  const { showToast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const d: any = await ownerService.getOrganizerRequest(); setRequest(d?.data ?? d); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !organizationName.trim() || !identityNumber.trim() || !phoneNumber.trim() || !address.trim()) { 
      showToast({ message: 'Vui lòng điền đầy đủ các thông tin', type: 'error' }); 
      return; 
    }
    setSubmitting(true);
    try {
      await ownerService.requestOrganizer({ 
        reason: reason.trim(),
        organizationName: organizationName.trim(),
        identityNumber: identityNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim()
      });
      showToast({ message: 'Đã gửi yêu cầu!', type: 'success' });
      setReason('');
      setOrganizationName('');
      setIdentityNumber('');
      setPhoneNumber('');
      setAddress('');
      await load();
    } catch (e: any) {
      showToast({ message: e.message || 'Gửi thất bại', type: 'error' });
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <View style={s.loadWrap}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  const key = request?.status?.toLowerCase() || '';
  const info = STATUS_MAP[key];

  return (
    <View style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Status */}
          <View style={s.card}>
            <View style={s.cardHead}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#6366F1" />
              <Text style={s.cardTitle}>Trạng thái hiện tại</Text>
            </View>
            {info ? (
              <View style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: info.bg }]}>
                  <Ionicons name={info.icon} size={22} color={info.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.statusLabel, { color: info.color }]}>{info.label}</Text>
                  <Text style={s.statusNote}>
                    {key === 'pending' && 'Yêu cầu đang được admin xem xét'}
                    {key === 'approved' && 'Chúc mừng! Bạn đã là nhà tổ chức'}
                    {key === 'rejected' && (request?.rejectionReason || 'Yêu cầu đã bị từ chối')}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: '#1E293B' }]}>
                  <Ionicons name="help-circle-outline" size={22} color="#64748B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.statusLabel}>Chưa gửi hồ sơ</Text>
                  <Text style={s.statusNote}>Hãy hoàn tất hồ sơ để trở thành nhà tổ chức chính thức.</Text>
                </View>
              </View>
            )}
          </View>

          {/* Steps */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Quy trình</Text>
            <View style={s.timeline}>
              <Step n={1} title="Gửi hồ sơ" done={!!info} active={!info} />
              <Step n={2} title="Admin xác minh" done={key === 'approved'} active={key === 'pending'} />
              <Step n={3} title="Hoàn tất" done={key === 'approved'} active={false} last />
            </View>
          </View>

          {/* Form */}
          {key !== 'pending' && key !== 'approved' && (
            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="create-outline" size={18} color="#F59E0B" />
                <Text style={s.cardTitle}>Hồ sơ nhà tổ chức</Text>
              </View>

              <Text style={s.fieldLabel}>Tên Tổ Chức / Cá Nhân</Text>
              <TextInput style={s.input} value={organizationName} onChangeText={setOrganizationName} placeholder="Nhập tên tổ chức..." placeholderTextColor="#475569" />

              <Text style={s.fieldLabel}>CCCD / Mã Số Thuế</Text>
              <TextInput style={s.input} value={identityNumber} onChangeText={setIdentityNumber} placeholder="Nhập số giấy tờ tùy thân..." placeholderTextColor="#475569" />

              <Text style={s.fieldLabel}>Số Điện Thoại Liên Hệ</Text>
              <TextInput style={s.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Nhập số điện thoại..." placeholderTextColor="#475569" keyboardType="phone-pad" />

              <Text style={s.fieldLabel}>Địa Chỉ Trụ Sở</Text>
              <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="Nhập địa chỉ..." placeholderTextColor="#475569" />

              <Text style={s.fieldLabel}>Mục Đích & Kinh Nghiệm</Text>
              <TextInput
                style={[s.input, s.textAreaInput]}
                value={reason}
                onChangeText={setReason}
                placeholder="Mô tả lý do và kinh nghiệm tổ chức sự kiện của bạn..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Pressable style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={s.submitTxt}>Gửi hồ sơ kiểm duyệt</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Step({ n, title, done, active, last = false }: any) {
  return (
    <View style={s.step}>
      <View style={s.stepDotCol}>
        <View style={[s.stepDot, done && { backgroundColor: '#10B981' }, active && { backgroundColor: '#6366F1', borderWidth: 2, borderColor: '#818CF8' }]}>
          {done ? <Ionicons name="checkmark" size={12} color="#fff" /> : <Text style={s.stepN}>{n}</Text>}
        </View>
        {!last && <View style={[s.stepLine, done && { backgroundColor: '#10B981' }]} />}
      </View>
      <Text style={[s.stepTitle, (done || active) && { color: '#E2E8F0' }]}>{title}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  loadWrap: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },

  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#F8FAFC' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusDot: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statusLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#F8FAFC' },
  statusNote: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 18 },

  timeline: { marginTop: 12 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepDotCol: { alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  stepN: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#475569' },
  stepLine: { width: 2, height: 24, backgroundColor: '#1E293B', marginVertical: 4 },
  stepTitle: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#64748B', marginTop: 4 },

  fieldLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, marginBottom: 8 },
  input: { fontFamily: 'Poppins_400Regular', backgroundColor: '#0F172A', borderRadius: 14, padding: 16, color: '#F8FAFC', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  textAreaInput: { minHeight: 100 },
  submitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16, borderRadius: 14, paddingVertical: 16, backgroundColor: '#10B981' },
  submitTxt: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff' },
});
