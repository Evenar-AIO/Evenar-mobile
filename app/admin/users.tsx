import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { adminService } from '@/features/admin/services/admin.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminUsersScreen() {
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getUsers({ page: 1, limit: 20 });
        setUsers(data?.data ?? data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleLockToggle = async (user: any) => {
    if (user?.isLocked) {
      await adminService.unlockUser(user._id);
    } else {
      await adminService.lockUser(user._id);
    }
  };

  const handleDelete = async (user: any) => {
    await adminService.deleteUser(user._id);
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Users</ThemedText>
        <ThemedText type="caption" tone="secondary">
          Manage roles and access.
        </ThemedText>
      </View>

      {users.length === 0 ? (
        <ThemedText type="caption" tone="secondary">
          No users found.
        </ThemedText>
      ) : (
        users.map((user) => (
          <View
            key={user._id}
            style={[styles.card, { backgroundColor: palette.surface1, borderColor: palette.border }]}
          >
            <View style={styles.rowBetween}>
              <ThemedText type="subtitle">{user.name ?? user.email}</ThemedText>
              <ThemedText type="caption" tone="secondary">
                {user.role ?? 'user'}
              </ThemedText>
            </View>
            <View style={styles.rowBetween}>
              <ThemedText type="caption" tone="secondary">
                {user.isLocked ? 'Locked' : 'Active'}
              </ThemedText>
              <View style={styles.actionRow}>
                <Pressable onPress={() => handleLockToggle(user)}>
                  <ThemedText type="caption" tone="accent">
                    {user.isLocked ? 'Unlock' : 'Lock'}
                  </ThemedText>
                </Pressable>
                <Pressable onPress={() => handleDelete(user)}>
                  <ThemedText type="caption" tone="accent">
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        ))
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.xs,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
}
);
