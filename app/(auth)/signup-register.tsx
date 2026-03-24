import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

export default function SignupRegisterScreen() {
  const params = useLocalSearchParams<{ role?: UserRole }>();
  const role = (params.role ?? 'customer') as UserRole;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [birthdayInput, setBirthdayInput] = useState('');
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const parseBirthdayInput = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    const localMatch = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed);

    let candidate: Date | null = null;
    if (isoMatch) {
      candidate = new Date(trimmed);
    } else if (localMatch) {
      const [day, month, year] = trimmed.split('/').map(Number);
      candidate = new Date(year, month - 1, day);
    }

    if (!candidate || Number.isNaN(candidate.getTime())) return null;
    if (candidate > new Date()) return null;
    return candidate;
  };

  const onRegister = async () => {
    const parsedBirthday = birthday ?? parseBirthdayInput(birthdayInput);
    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      gender: gender ? null : 'Vui lòng chọn giới tính',
      birthday: parsedBirthday ? null : 'Vui lòng chọn ngày sinh',
      address: address.trim() ? null : 'Địa chỉ là bắt buộc',
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
      const finalBirthday = parsedBirthday ?? birthday;
      await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        gender: gender ?? undefined,
        birthday: finalBirthday ? finalBirthday.toISOString().slice(0, 10) : undefined,
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Thông tin đăng ký
          </ThemedText>
          <ThemedText style={styles.subtitle}>Bước 2/3: Nhập thông tin tài khoản.</ThemedText>
        </View>

        <View style={styles.form}>
        <AuthFormField
          label="Họ tên"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nguyễn Văn A"
          error={errors.fullName}
        />
        <AuthFormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          error={errors.email}
        />
        <AuthFormField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu"
          error={errors.password}
        />
        <AuthFormField
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword}
        />

        <View style={styles.fieldGroup}>
          <ThemedText type="bodySemiBold">Giới tính</ThemedText>
          {errors.gender ? <ThemedText style={styles.errorText}>{errors.gender}</ThemedText> : null}
          <View style={styles.genderRow}>
            {([
              { label: 'Nam', value: 'male' },
              { label: 'Nữ', value: 'female' },
              { label: 'Khác', value: 'other' },
            ] as const).map((option) => {
              const active = gender === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setGender(option.value)}
                  style={[styles.genderChip, active ? styles.genderChipActive : null]}>
                  <ThemedText style={[styles.genderText, active ? styles.genderTextActive : null]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText type="bodySemiBold">Ngày sinh</ThemedText>
          {errors.birthday ? <ThemedText style={styles.errorText}>{errors.birthday}</ThemedText> : null}
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <AuthFormField
                label=""
                value={birthdayInput}
                onChangeText={(value) => {
                  setBirthdayInput(value);
                  const parsed = parseBirthdayInput(value);
                  if (parsed) {
                    setBirthday(parsed);
                  }
                }}
                placeholder="DD/MM/YYYY hoặc YYYY-MM-DD"
                error={null}
              />
            </View>
            <Pressable onPress={() => setShowBirthdayPicker(true)} style={styles.dateButton}>
              <ThemedText style={styles.dateText}>
                {birthday ? birthday.toLocaleDateString('vi-VN') : 'Chọn'}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {showBirthdayPicker ? (
          <View style={styles.pickerCard}>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={birthday ?? new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setBirthday(selectedDate);
                    setBirthdayInput(selectedDate.toLocaleDateString('vi-VN'));
                  }
                }}
                maximumDate={new Date()}
              />
            ) : (
              <DateTimePicker
                value={birthday ?? new Date(2000, 0, 1)}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowBirthdayPicker(false);
                  if (selectedDate) {
                    setBirthday(selectedDate);
                    setBirthdayInput(selectedDate.toLocaleDateString('vi-VN'));
                  }
                }}
                maximumDate={new Date()}
              />
            )}
            {Platform.OS === 'ios' ? (
              <Pressable onPress={() => setShowBirthdayPicker(false)} style={styles.pickerDone}>
                <ThemedText style={styles.pickerDoneText}>Xong</ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <AuthFormField
          label="Địa chỉ"
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ"
          error={errors.address}
          multiline
        />
        <AuthFormField
          label="Số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Nhập số điện thoại"
          error={errors.phoneNumber}
        />

        {globalError ? <ThemedText style={styles.errorText}>{globalError}</ThemedText> : null}

        <AuthButton title="Đăng ký" onPress={onRegister} loading={loading} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA4B2',
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A2E37',
    backgroundColor: '#11131A',
  },
  genderChipActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#1B1833',
  },
  genderText: {
    color: '#9AA4B2',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#E9E6FF',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  dateInputContainer: {
    flex: 1,
  },
  dateButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2E37',
    backgroundColor: '#11131A',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  dateText: {
    color: '#9AA4B2',
    fontSize: 15,
  },
  pickerCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2E37',
    backgroundColor: '#11131A',
    padding: 12,
  },
  pickerDone: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1B1833',
  },
  pickerDoneText: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
});
