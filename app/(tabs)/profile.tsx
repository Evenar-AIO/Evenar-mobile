import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { AuthButton } from '@/features/auth/components/AuthButton';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import ProfileForm from '@/features/profile/components/ProfileForm';
import { useAuthStore } from '@/store/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateCustomerProfile, updateOwnerProfile } from '@/features/profile/services/profile.service';
import type { UserProfile } from '@/features/profile/types/profile.type';

export default function ProfileScreen() {
  const { state } = useAuthStore();
  const { logoutAction } = useAuthActions();
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [loading, setLoading] = useState(false);

  const user = state.user ?? {
    role: 'customer' as 'customer' | 'event_owner',
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    avatar: '',
    dateOfBirth: '2004-01-01',
    gender: 'Nam',
    address: 'Gia Lai',
    bio: '',
    organizationName: '',
  };

  const [values, setValues] = useState<UserProfile>({
    username: user.fullName ?? '',
    email: user.email ?? '',
    phoneNumber: user.phone ?? '',
    address: user.address ?? '',
    gender: user.gender ?? '',
    birthday: user.dateOfBirth ?? '',
    avatar: user.avatar ?? '',
    role: user.role,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (user.role === 'event_owner') {
        await updateOwnerProfile(values);
      } else {
        await updateCustomerProfile(values);
      }
    } finally {
      setLoading(false);
    }
  };

  const role = user.role;

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <ThemedText type="title">
          {role === 'event_owner' ? 'Hồ sơ nhà tổ chức' : 'Hồ sơ cá nhân'}
        </ThemedText>
        <ThemedText type="caption" tone="secondary">
          Manage your account details and preferences.
        </ThemedText>
      </View>

      <View style={[styles.formCard, { backgroundColor: palette.surface1, borderColor: palette.border }]}>
        <ProfileForm
          values={values}
          onChange={(field, value) => setValues((prev) => ({ ...prev, [field]: value }))}
          onSubmit={handleSubmit}
          loading={loading}
        />
        <View style={{ marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: palette.border }}>
          <AuthButton title="Đăng xuất" onPress={logoutAction} variant="secondary" />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  formCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
});
