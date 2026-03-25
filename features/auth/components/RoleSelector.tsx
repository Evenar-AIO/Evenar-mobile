import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import type { UserRole } from '@/features/auth/types/authTypes';

const ROLES: { label: string; value: UserRole; description: string; icon: string }[] = [
  { 
    label: 'Khách hàng', 
    value: 'customer', 
    description: 'Khám phá, mua vé và tham gia các sự kiện âm nhạc đỉnh cao.', 
    icon: 'person-outline' 
  },
  { 
    label: 'Ban tổ chức', 
    value: 'event_owner', 
    description: 'Tạo, quản lý và vận hành các sự kiện chuyên nghiệp.', 
    icon: 'calendar-outline' 
  },
];

interface RoleSelectorProps {
  selectedRole?: UserRole;
  onChangeRole: (role: UserRole) => void;
  error?: string | null;
}

export function RoleSelector({ selectedRole, onChangeRole, error }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {ROLES.map((role, index) => {
          const active = role.value === selectedRole;

          return (
            <Animated.View 
              key={role.value} 
              entering={FadeInRight.delay(index * 150).duration(600)}
            >
              <Pressable
                onPress={() => onChangeRole(role.value)}
                style={[
                  styles.card, 
                  active ? styles.cardActive : null,
                  error && !selectedRole ? styles.cardError : null
                ]}
              >
                <View style={[styles.iconBox, active ? styles.iconBoxActive : null]}>
                  <Ionicons 
                    name={role.icon as any} 
                    size={28} 
                    color={active ? '#FFF' : '#94A3B8'} 
                  />
                </View>
                
                <View style={styles.textContainer}>
                  <ThemedText style={[styles.roleTitle, active ? styles.roleTitleActive : null]}>
                    {role.label}
                  </ThemedText>
                  <ThemedText style={styles.roleDescription}>
                    {role.description}
                  </ThemedText>
                </View>

                <View style={[styles.radio, active ? styles.radioActive : null]}>
                  {active && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardActive: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  cardError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#7C3AED',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  roleTitleActive: {
    color: '#7C3AED',
  },
  roleDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    fontWeight: '500',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#7C3AED',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 14,
  },
});
