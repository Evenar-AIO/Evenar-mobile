import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { UserRole } from '@/features/auth/types/authTypes';

const ROLES: { label: string; value: UserRole; description: string }[] = [
  { label: 'Customer', value: 'customer', description: 'Mua và quản lý vé sự kiện.' },
  { label: 'Event Owner', value: 'event_owner', description: 'Tạo và quản lý sự kiện của bạn.' },
];

interface RoleSelectorProps {
  selectedRole?: UserRole;
  onChangeRole: (role: UserRole) => void;
  error?: string | null;
}

export function RoleSelector({ selectedRole, onChangeRole, error }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="bodySemiBold">Chọn vai trò</ThemedText>
      <View style={styles.list}>
        {ROLES.map((role) => {
          const active = role.value === selectedRole;

          return (
            <Pressable
              key={role.value}
              onPress={() => onChangeRole(role.value)}
              style={[styles.card, active ? styles.cardActive : null]}>
              <ThemedText style={styles.roleTitle}>{role.label}</ThemedText>
              <ThemedText style={styles.roleDescription}>{role.description}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  list: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: '#2A2E37',
    borderRadius: 12,
    padding: 14,
    gap: 4,
    backgroundColor: '#11131A',
  },
  cardActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#1B1833',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 14,
    color: '#9AA4B2',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
  },
});
