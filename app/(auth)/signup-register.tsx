import {
  Modal,
  FlatList,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';

import { AuthButton } from '@/features/auth/components/AuthButton';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import type { UserRole } from '@/features/auth/types/authTypes';
import { mapApiError } from '@/features/auth/utils/errorMapper';
import {
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@/features/auth/utils/validators';
import { authService } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_H } = Dimensions.get('window');

/* ---------- Date Selection Constants ---------- */
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const YEARS = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function SignupRegisterScreen() {
  const params = useLocalSearchParams<{ role?: UserRole }>();
  const role = (params.role ?? 'customer') as UserRole;
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  
  // Custom Date selection states
  const [selDay, setSelDay] = useState<string | null>(null);
  const [selMonth, setSelMonth] = useState<string | null>(null);
  const [selYear, setSelYear] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'day' | 'month' | 'year' | null>(null);

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const onRegister = async () => {
    // Construct birthday from selections
    let birthday: Date | null = null;
    if (selDay && selMonth && selYear) {
      birthday = new Date(parseInt(selYear), parseInt(selMonth) - 1, parseInt(selDay));
    }

    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      gender: gender ? null : 'Vui lòng chọn giới tính',
      birthday: birthday ? null : 'Vui lòng chọn đầy đủ ngày tháng năm sinh',
      address: null,
      phoneNumber: /^0\d{9,10}$/.test(phoneNumber.trim())
        ? null
        : 'Số điện thoại không hợp lệ',
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setLoading(true);
    setGlobalError(null);

    try {
      await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        gender: gender ?? undefined,
        birthday: birthday ? birthday.toISOString().slice(0, 10) : undefined,
        address: address.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setPassword('');
      setConfirmPassword('');

      router.push({
        pathname: '/signup-verify-otp',
        params: { email: email.trim(), role },
      });
    } catch (error) {
      setGlobalError(mapApiError(error, 'Đăng ký thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  const renderPickerModal = () => {
    if (!activePicker) return null;

    let data: string[] = [];
    let title = '';
    let currentVal = '';
    let setter: (v: string) => void = () => {};

    if (activePicker === 'day') {
      data = DAYS;
      title = 'Chọn Ngày';
      currentVal = selDay || '';
      setter = setSelDay;
    } else if (activePicker === 'month') {
      data = MONTHS;
      title = 'Chọn Tháng';
      currentVal = selMonth || '';
      setter = setSelMonth;
    } else {
      data = YEARS;
      title = 'Chọn Năm';
      currentVal = selYear || '';
      setter = setSelYear;
    }

    return (
      <Modal visible transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{title}</ThemedText>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const active = item === currentVal;
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
                    {active && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
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
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Header with Illustration */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>Tạo tài khoản</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Tham gia cộng đồng Combos ngay</ThemedText>
          </View>
          <View style={styles.illustrationContainer}>
            <Ionicons name="person-add-outline" size={54} color="rgba(255, 255, 255, 0.9)" />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#7C3AED" />
              <ThemedText style={styles.sectionLabel}>Thông tin cá nhân</ThemedText>
            </View>
            
            <View style={styles.card}>
              <AuthFormField
                label="Họ và tên"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ tên của bạn"
                error={errors.fullName}
              />
              
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Giới tính</ThemedText>
                <View style={styles.genderRow}>
                  {([
                    { label: 'Nam', value: 'male', icon: 'male' },
                    { label: 'Nữ', value: 'female', icon: 'female' },
                    { label: 'Khác', value: 'other', icon: 'ellipsis-horizontal' },
                  ] as const).map((option) => {
                    const active = gender === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setGender(option.value)}
                        style={[styles.genderChip, active ? styles.genderChipActive : null]}>
                        <Ionicons 
                          name={option.icon as any} 
                          size={16} 
                          color={active ? '#7C3AED' : '#64748B'} 
                          style={{ marginRight: 6 }} 
                        />
                        <ThemedText style={[styles.genderText, active ? styles.genderTextActive : null]}>
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.gender && <ThemedText style={styles.inlineError}>{errors.gender}</ThemedText>}
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={styles.fieldLabel}>Ngày sinh</ThemedText>
                <View style={styles.dateSelectorRow}>
                  <TouchableOpacity 
                    onPress={() => setActivePicker('day')} 
                    style={[styles.dateBox, selDay ? styles.dateBoxFilled : null]}
                  >
                    <ThemedText style={styles.dateBoxLabel}>Ngày</ThemedText>
                    <ThemedText style={styles.dateBoxValue}>{selDay || '--'}</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setActivePicker('month')} 
                    style={[styles.dateBox, selMonth ? styles.dateBoxFilled : null]}
                  >
                    <ThemedText style={styles.dateBoxLabel}>Tháng</ThemedText>
                    <ThemedText style={styles.dateBoxValue}>{selMonth || '--'}</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setActivePicker('year')} 
                    style={[styles.dateBox, selYear ? styles.dateBoxFilled : null]}
                  >
                    <ThemedText style={styles.dateBoxLabel}>Năm</ThemedText>
                    <ThemedText style={styles.dateBoxValue}>{selYear || '----'}</ThemedText>
                  </TouchableOpacity>
                </View>
                {errors.birthday && <ThemedText style={styles.inlineError}>{errors.birthday}</ThemedText>}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color="#7C3AED" />
              <ThemedText style={styles.sectionLabel}>Tài khoản & Bảo mật</ThemedText>
            </View>

            <View style={styles.card}>
              <AuthFormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="ten@vi_du.com"
                error={errors.email}
              />

              <AuthFormField
                label="Số điện thoại"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="09xx xxx xxx"
                error={errors.phoneNumber}
              />
              
              <AuthFormField
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Nhập ít nhất 8 ký tự"
                error={errors.password}
              />

              {errors.password && (
                <View style={styles.securityBox}>
                  <View style={styles.securityHeader}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
                    <ThemedText style={styles.securityTitle}>Yêu cầu bảo mật</ThemedText>
                  </View>
                  <View style={styles.securityGrid}>
                    {[
                      'Ít nhất 8 ký tự',
                      '1 chữ thường & 1 số',
                      '1 ký tự đặc biệt',
                      '1 chữ in hoa'
                    ].map((item, index) => (
                      <View key={index} style={styles.securityItem}>
                        <View style={styles.bullet} />
                        <ThemedText style={styles.securityItemText}>{item}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <AuthFormField
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Nhập lại mật khẩu"
                error={errors.confirmPassword}
              />
            </View>
          </View>

          {globalError ? <ThemedText style={styles.globalErrorText}>{globalError}</ThemedText> : null}

          <View style={styles.actionContainer}>
            <AuthButton title="Đăng ký tài khoản" onPress={onRegister} loading={loading} />
            
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Đã có tài khoản? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <ThemedText style={styles.footerLink}>Đăng nhập</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>Hoặc đăng ký bằng</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={() => {}}>
            <Ionicons name="logo-google" size={20} color="#F8FAFC" />
            <ThemedText style={styles.googleButtonText}>Tiếp tục với Google</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.legalText}>
            Bằng việc đăng ký, bạn đồng ý với {'\n'}
            <ThemedText style={styles.legalLink}>Điều khoản sử dụng</ThemedText> & <ThemedText style={styles.legalLink}>Chính sách bảo mật</ThemedText>
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderPickerModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  illustrationContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipActive: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  genderText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
  genderTextActive: {
    color: '#7C3AED',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBox: {
    flex: 1,
    height: 70,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateBoxFilled: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  dateBoxLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateBoxValue: {
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: SCREEN_H * 0.5,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  listContent: {
    paddingVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  listItemActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: -12,
  },
  listItemText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '500',
  },
  listItemTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  securityBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7C3AED',
  },
  securityItemText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  inlineError: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 4,
  },
  globalErrorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 14,
  },
  actionContainer: {
    gap: 16,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  footerLink: {
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 15,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  googleButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  googleButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  legalText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  legalLink: {
    color: '#7C3AED',
    fontWeight: '600',
  },
});
