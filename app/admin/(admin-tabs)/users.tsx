import { ActivityIndicator, Pressable, StyleSheet, View, FlatList, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Animated, { FadeInLeft } from 'react-native-reanimated';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ADMIN_COLORS = {
  bg: '#020617',
  surface: '#0F172A',
  surfaceLight: '#1E293B',
  accent: '#22C55E',
  danger: '#ef4444',
  text: '#F8FAFC',
  textDim: '#94A3B8',
};

export default function AdminUsersScreen() {
  const theme = useColorScheme() ?? 'dark';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data: any = await adminService.getUsers({ page: 1, limit: 100 });
      setUsers(data?.data ?? data ?? []);
    } catch (err) {
       console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUsers(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers(true);
  };

  const handleLockToggle = async (user: any) => {
    try {
       // Navigate to information detail as requested
       router.push(`/admin/users/${user._id}`);
    } catch (err) {
       console.error(err);
    }
  };

  const renderUser = ({ item: user, index }: { item: any, index: number }) => (
    <Animated.View
      entering={FadeInLeft.delay(index * 50)}
      style={[styles.card, { backgroundColor: ADMIN_COLORS.surface, padding: 0 }]}
    >
      <Pressable 
        onPress={() => router.push(`/admin/users/${user._id}`)}
        style={({ pressed }) => [styles.cardHeader, { opacity: pressed ? 0.8 : 1, padding: 16 }]}
      >
        <View style={[styles.avatarPlaceholder, { backgroundColor: user.isLocked ? '#475569' : '#3b82f6' }]}>
           <ThemedText style={styles.avatarText}>{(user.username ?? 'U')[0].toUpperCase()}</ThemedText>
        </View>
        <View style={styles.userInfo}>
           <ThemedText style={styles.username}>{user.username ?? user.email}</ThemedText>
           <ThemedText style={styles.email}>{user.email}</ThemedText>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#ef444420' : '#3b82f620' }]}>
           <ThemedText style={[styles.roleText, { color: user.role === 'admin' ? '#ef4444' : '#3b82f6' }]}>
             {(user.role ?? 'user').toUpperCase()}
           </ThemedText>
        </View>
      </Pressable>

      <View style={[styles.cardFooter, { paddingHorizontal: 16, paddingBottom: 16 }]}>
        <View style={styles.statusBox}>
           <View style={[styles.statusDot, { backgroundColor: user.isLocked ? ADMIN_COLORS.danger : ADMIN_COLORS.accent }]} />
           <ThemedText style={styles.statusText}>{user.isLocked ? 'Bị khóa' : 'Hoạt động'}</ThemedText>
        </View>
        <View style={styles.actionGroup}>
           <Pressable onPress={() => handleLockToggle(user)} style={styles.iconBtn}>
              <Ionicons name={user.isLocked ? "lock-open-outline" : "lock-closed-outline"} size={18} color={ADMIN_COLORS.textDim} />
           </Pressable>
           <Pressable onPress={() => router.push(`/admin/users/${user._id}`)} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={18} color={ADMIN_COLORS.textDim} />
           </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: ADMIN_COLORS.bg }]}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ADMIN_COLORS.accent} />
        }
        ListHeaderComponent={() => (
           <View style={styles.listHeader}>
             <ThemedText style={styles.totalText}>{users.length} Người dùng</ThemedText>
             <Pressable style={styles.filterBtn}>
                <Ionicons name="filter" size={16} color={ADMIN_COLORS.accent} />
                <ThemedText style={styles.filterText}>Lọc</ThemedText>
             </Pressable>
           </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: 12,
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 14,
    color: ADMIN_COLORS.textDim,
    fontWeight: '600',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ADMIN_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  filterText: {
    fontSize: 12,
    color: ADMIN_COLORS.accent,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: ADMIN_COLORS.text,
  },
  email: {
    fontSize: 12,
    color: ADMIN_COLORS.textDim,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: ADMIN_COLORS.textDim,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: ADMIN_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
