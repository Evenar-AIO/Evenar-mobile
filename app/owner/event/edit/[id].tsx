import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  ActivityIndicator, Platform, Image, KeyboardAvoidingView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEventStore } from '@/store/event.store';
import { request } from '@/services/apiClient';
import type { EventPayload, TicketInfoPayload } from '@/features/event/types/event.type';
import { getEventByIdApi } from '@/features/event/api/event.api';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateEvent } = useEventStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'startDate' | 'startTime' | 'endDate' | 'endTime' | null>(null);

  const [tickets, setTickets] = useState<TicketInfoPayload[]>([]);
  const [values, setValues] = useState<EventPayload>({
    name: '', description: '', startTime: '', endTime: '',
    physicalLocation: '', layout: '', imageURL: '', genreId: '', totalTicketCount: '0',
    ticketInfo: []
  });

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const event = await getEventByIdApi(id!);
      
      if (event) {
        setValues({
          name: event.name || '',
          description: event.description || '',
          physicalLocation: event.physicalLocation || '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          imageURL: event.imageURL || '',
          layout: event.layout || '',
          genreId: event.genreId?._id || event.genreId || '',
          totalTicketCount: String(event.totalTicketCount || '0'),
        });
        
        if (event.startTime) setStartDate(new Date(event.startTime));
        if (event.endTime) setEndDate(new Date(event.endTime));
        
        // Map ticket info if available
        if (Array.isArray(event.ticketInfo)) {
          setTickets(event.ticketInfo.map((t: any) => ({
            _id: t._id, // Keep ID for updates
            type: t.ticketName || t.type || '',
            price: String(t.price || '0'),
            quantity: String(t.available || t.quantity || '0'),
            description: t.ticketDescription || t.description || ''
          })));
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải thông tin sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof EventPayload, value: any) =>
    setValues((p) => ({ ...p, [field]: value }));

  // ── Image Upload ──
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append('file', blob, 'event.jpg');
      } else {
        formData.append('file', { uri, name: 'event.jpg', type: 'image/jpeg' } as any);
      }
      const data: any = await request('/upload', { method: 'POST', body: formData });
      if (data?.url) set('imageURL', data.url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  // ── Date/Time Helpers ──
  const formatDate = (d: Date | null) => {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (d: Date | null) => {
    if (!d) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
  };

  const toISO = (d: Date | null) => d ? d.toISOString() : '';

  const handleDateChange = (type: 'startDate' | 'startTime' | 'endDate' | 'endTime', selectedDate?: Date) => {
    if (!selectedDate) { setShowPicker(null); return; }
    if (type === 'startDate') {
      const newD = startDate ? new Date(startDate) : new Date();
      newD.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setStartDate(newD); set('startTime', toISO(newD));
    } else if (type === 'startTime') {
      const newD = startDate ? new Date(startDate) : new Date();
      newD.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setStartDate(newD); set('startTime', toISO(newD));
    } else if (type === 'endDate') {
      const newD = endDate ? new Date(endDate) : new Date();
      newD.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setEndDate(newD); set('endTime', toISO(newD));
    } else if (type === 'endTime') {
      const newD = endDate ? new Date(endDate) : new Date();
      newD.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEndDate(newD); set('endTime', toISO(newD));
    }
    setShowPicker(null);
  };

  const handleWebDateTimeChange = (type: 'start' | 'end', value: string) => {
    if (!value) return;
    const d = new Date(value);
    if (isNaN(d.getTime())) return;
    if (type === 'start') { setStartDate(d); set('startTime', d.toISOString()); }
    else { setEndDate(d); set('endTime', d.toISOString()); }
  };

  // ── Ticket Tiers ──
  const addTicket = () => setTickets([...tickets, { type: '', price: '', quantity: '', description: '' }]);
  const removeTicket = (idx: number) => setTickets(tickets.filter((_, i) => i !== idx));
  const updateTicket = (idx: number, f: keyof TicketInfoPayload, v: string) => {
    const next = [...tickets];
    next[idx] = { ...next[idx], [f]: v };
    setTickets(next);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!values.name.trim() || !values.startTime || !values.endTime || !values.physicalLocation.trim() || !values.description.trim()) {
      const msg = 'Vui lòng điền đủ: Tên, Mô tả, Bắt đầu, Kết thúc, Địa điểm';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Lỗi', msg);
      return;
    }

    setSubmitting(true);
    try {
      const totalCount = tickets.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
      await updateEvent(id!, {
        ...values,
        totalTicketCount: String(totalCount),
        ticketInfo: tickets
      });
      if (Platform.OS === 'web') window.alert('Cập nhật sự kiện thành công!');
      router.replace('/owner/event');
    } catch (err: any) {
      const msg = err.message || 'Cập nhật sự kiện thất bại!';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Lỗi', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <View style={s.centerRoot}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={s.loadingTxt}>Đang tải thông tin...</Text>
        </View>
    );
  }

  return (
    <View style={s.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
            </Pressable>
            <Text style={s.headerTitle}>Chỉnh sửa sự kiện</Text>
            <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* 📸 Image Upload */}
          <Pressable onPress={pickImage} style={s.imagePicker}>
            {imageUri || values.imageURL ? (
              <Image source={{ uri: imageUri || values.imageURL }} style={s.imagePreview} />
            ) : (
              <View style={s.imagePlaceholder}>
                <View style={s.uploadIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={28} color="#10B981" />
                </View>
                <Text style={s.uploadText}>Tải ảnh sự kiện</Text>
                <Text style={s.uploadSub}>Nhấn để chọn ảnh từ thiết bị</Text>
              </View>
            )}
            {uploading && (
              <View style={s.uploadOverlay}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={s.overlayTxt}>Đang tải lên...</Text>
              </View>
            )}
          </Pressable>

          {/* 📝 Info Cards */}
          <View style={s.card}>
            <Field label="Tên sự kiện" icon="text-outline" required>
              <TextInput style={s.input} value={values.name} onChangeText={(v) => set('name', v)} placeholder="VD: Đêm nhạc Acoustic..." placeholderTextColor="#475569" />
            </Field>

            <Field label="Mô tả" icon="document-text-outline" required>
              <TextInput style={[s.input, s.textArea]} value={values.description} onChangeText={(v) => set('description', v)} placeholder="Mô tả chi tiết sự kiện..." placeholderTextColor="#475569" multiline textAlignVertical="top" />
            </Field>

            <Field label="Địa điểm" icon="location-outline" required>
              <TextInput style={s.input} value={values.physicalLocation} onChangeText={(v) => set('physicalLocation', v)} placeholder="VD: Nhà hát lớn, Quận 1..." placeholderTextColor="#475569" />
            </Field>
          </View>

          {/* 📅 Date/Time Card */}
          <View style={s.card}>
            <View style={s.row}>
                <View style={s.halfField}>
                    <Field label="Bắt đầu" icon="calendar-outline" required>
                        {Platform.OS === 'web' ? (
                        <input type="datetime-local" value={startDate ? startDate.toISOString().slice(0, 16) : ''} onChange={(e) => handleWebDateTimeChange('start', e.target.value)} style={webInputStyle} />
                        ) : (
                        <View style={s.dateRow}>
                            <Pressable style={s.dateBtn} onPress={() => setShowPicker('startDate')}>
                                <Text style={s.dateTxt}>{startDate ? formatDate(startDate) : 'Ngày'}</Text>
                            </Pressable>
                            <Pressable style={[s.dateBtn, { flex: 0.8 }]} onPress={() => setShowPicker('startTime')}>
                                <Text style={s.dateTxt}>{startDate ? formatTime(startDate) : 'Giờ'}</Text>
                            </Pressable>
                        </View>
                        )}
                    </Field>
                </View>
                <View style={s.halfField}>
                    <Field label="Kết thúc" icon="calendar-outline" required>
                        {Platform.OS === 'web' ? (
                        <input type="datetime-local" value={endDate ? endDate.toISOString().slice(0, 16) : ''} onChange={(e) => handleWebDateTimeChange('end', e.target.value)} style={webInputStyle} />
                        ) : (
                        <View style={s.dateRow}>
                            <Pressable style={s.dateBtn} onPress={() => setShowPicker('endDate')}>
                                <Text style={s.dateTxt}>{endDate ? formatDate(endDate) : 'Ngày'}</Text>
                            </Pressable>
                            <Pressable style={[s.dateBtn, { flex: 0.8 }]} onPress={() => setShowPicker('endTime')}>
                                <Text style={s.dateTxt}>{endDate ? formatTime(endDate) : 'Giờ'}</Text>
                            </Pressable>
                        </View>
                        )}
                    </Field>
                </View>
            </View>
          </View>

          {/* 🎫 Ticket Tiers */}
          <View style={s.card}>
            <View style={s.secHeader}>
                <Text style={s.secTitle}>Phân loại vé</Text>
                <Pressable onPress={addTicket} style={s.addBtn}>
                    <Ionicons name="add" size={16} color="#10B981" />
                    <Text style={s.addBtnTxt}>Thêm loại vé</Text>
                </Pressable>
            </View>

            {tickets.map((t, i) => (
                <View key={i} style={s.ticketTier}>
                    <View style={s.row}>
                        <View style={{ flex: 1.5 }}>
                            <TextInput style={s.miniInput} value={t.type} onChangeText={(v) => updateTicket(i, 'type', v)} placeholder="VD: Vé VIP" placeholderTextColor="#475569" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <TextInput style={s.miniInput} value={t.price} onChangeText={(v) => updateTicket(i, 'price', v)} placeholder="Giá" placeholderTextColor="#475569" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 0.8 }}>
                            <TextInput style={s.miniInput} value={t.quantity} onChangeText={(v) => updateTicket(i, 'quantity', v)} placeholder="SL" placeholderTextColor="#475569" keyboardType="numeric" />
                        </View>
                        <Pressable onPress={() => removeTicket(i)} style={s.delBtn}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </Pressable>
                    </View>
                </View>
            ))}
          </View>

          <View style={s.row}>
            <View style={s.halfField}>
              <Field label="Layout" icon="grid-outline">
                <TextInput style={s.input} value={values.layout} onChangeText={(v) => set('layout', v)} placeholder="venue layout" placeholderTextColor="#475569" />
              </Field>
            </View>
            <View style={s.halfField}>
              <Field label="Genre" icon="musical-notes-outline">
                <TextInput style={s.input} value={values.genreId} onChangeText={(v) => set('genreId', v)} placeholder="concert, theater..." placeholderTextColor="#475569" />
              </Field>
            </View>
          </View>

          {/* 🚀 Submit */}
          <Pressable
            style={[s.submitBtn, submitting && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator size="small" color="#fff" /> : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={s.submitTxt}>Lưu thay đổi</Text>
              </>
            )}
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Native Date/Time Picker Modal ── */}
      {Platform.OS !== 'web' && showPicker && (
        <DateTimePicker
          value={(showPicker.includes('start') ? (startDate || new Date()) : (endDate || new Date()))}
          mode={showPicker.includes('Date') ? 'date' : 'time'}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => handleDateChange(showPicker, d)}
        />
      )}
    </View>
  );
}

function Field({ label, icon, required, children }: { label: string; icon: any; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <View style={s.labelRow}>
        <Ionicons name={icon} size={14} color="#64748B" />
        <Text style={s.label}>{label}{required ? <Text style={{ color: '#EF4444' }}> *</Text> : ''}</Text>
      </View>
      {children}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  backgroundColor: '#0F172A',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  padding: 12,
  color: '#F8FAFC',
  fontSize: 13,
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark',
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  centerRoot: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTxt: { color: '#64748B', fontWeight: '500' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },

  scroll: { padding: 20, paddingBottom: 40, gap: 12 },

  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', marginBottom: 4 },

  // Image picker
  imagePicker: { borderRadius: 16, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: 180, borderRadius: 16 },
  imagePlaceholder: { height: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B', gap: 6 },
  uploadIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(16,185,129,0.1)', justifyContent: 'center', alignItems: 'center' },
  uploadText: { fontSize: 14, fontWeight: '600', color: '#E2E8F0' },
  uploadSub: { fontSize: 11, fontWeight: '400', color: '#64748B' },
  uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.8)', justifyContent: 'center', alignItems: 'center' },
  overlayTxt: { fontSize: 12, fontWeight: '500', color: '#94A3B8', marginTop: 8 },

  // Form
  field: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#0F172A', borderRadius: 12, padding: 14, color: '#F8FAFC', fontSize: 14, fontWeight: '400', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  miniInput: { backgroundColor: '#0F172A', borderRadius: 10, padding: 10, color: '#F8FAFC', fontSize: 13, fontWeight: '400', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },

  // Tickets
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  secTitle: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addBtnTxt: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  ticketTier: { marginBottom: 10 },
  delBtn: { justifyContent: 'center', alignItems: 'center', paddingLeft: 4 },

  // Date
  dateRow: { flexDirection: 'row', gap: 8 },
  dateBtn: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  dateTxt: { fontSize: 13, fontWeight: '500', color: '#E2E8F0' },

  // Submit
  submitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12, borderRadius: 16, paddingVertical: 18, backgroundColor: '#6366F1' },
  submitTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});