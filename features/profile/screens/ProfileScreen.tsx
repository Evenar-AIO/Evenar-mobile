import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import ProfileForm from '../components/ProfileForm';
import { UserProfile } from '../types/profile.type'; 
import {
  getMyProfile,
  updateCustomerProfile,
  updateOwnerProfile,
} from '../services/profile.service';

export default function ProfileScreen() {
  const [values, setValues] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setValues({
          ...data,
          birthday: data?.birthday
            ? new Date(data.birthday).toISOString().split('T')[0]
            : '',
        });
      } catch (error: any) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || 'Cannot load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (values.role === 'event_owner') {
        await updateOwnerProfile(values);
      } else {
        await updateCustomerProfile(values);
      }

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert(
        'Notice',
        error?.response?.data?.message ||
          'Backend zip chưa có API update profile nên hiện mới load được /auth/me.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ProfileForm
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      loading={saving}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});