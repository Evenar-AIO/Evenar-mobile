import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { UserProfile } from '../types/profile.type'; 

type Props = {
  values: UserProfile;
  onChange: (field: keyof UserProfile, value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export default function ProfileForm({
  values,
  onChange,
  onSubmit,
  loading = false,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={values.username || ''}
        onChangeText={(v) => onChange('username', v)}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={values.email || ''}
        onChangeText={(v) => onChange('email', v)}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={values.phoneNumber || ''}
        onChangeText={(v) => onChange('phoneNumber', v)}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={values.address || ''}
        onChangeText={(v) => onChange('address', v)}
      />

      <Text style={styles.label}>Gender</Text>
      <TextInput
        style={styles.input}
        value={values.gender || ''}
        onChangeText={(v) => onChange('gender', v)}
      />

      <Text style={styles.label}>Birthday</Text>
      <TextInput
        style={styles.input}
        value={values.birthday || ''}
        onChangeText={(v) => onChange('birthday', v)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Avatar URL</Text>
      <TextInput
        style={styles.input}
        value={values.avatar || ''}
        onChangeText={(v) => onChange('avatar', v)}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  button: {
    marginTop: 22,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});