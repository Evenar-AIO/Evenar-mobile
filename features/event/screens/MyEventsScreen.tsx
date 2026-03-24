import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import EventCard from '../components/EventCard';
import { EventItem } from '../types/event.type';
import { deleteEvent, getEvents } from '../services/event.service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MyEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Cannot load events');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleDelete = async (id?: string) => {
    if (!id) return;

    Alert.alert('Confirm', 'Do you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(id);
            fetchEvents();
          } catch (error: any) {
            Alert.alert(
              'Notice',
              error?.response?.data?.error ||
                'Backend zip chưa có DELETE /events/:id nên chức năng xóa chưa chạy thật.'
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Owner Center</ThemedText>
          <ThemedText type="caption" tone="secondary">
            Manage events, revenue, and requests.
          </ThemedText>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.accentAlt },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/dashboard')}
        >
          <ThemedText type="bodySemiBold" tone="inverse">
            Dashboard
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.ctaRow}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/analytics')}
        >
          <ThemedText type="caption">Analytics</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/buyers')}
        >
          <ThemedText type="caption">Buyers</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: palette.border, backgroundColor: palette.surface1 },
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push('/owner/requests')}
        >
          <ThemedText type="caption">Requests</ThemedText>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.createBtn,
          { backgroundColor: palette.accentAlt },
          pressed && { opacity: 0.9 },
        ]}
        onPress={() => router.push('/owner/event/create')}
      >
        <ThemedText type="bodySemiBold" tone="inverse">
          + Create New Event
        </ThemedText>
      </Pressable>

      <FlatList
        data={events}
        keyExtractor={(item) => String(item._id)}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            onEdit={() => router.push(`/owner/event/edit/${item._id}`)}
            onDelete={() => handleDelete(item._id)}
          />
        )}
        ListEmptyComponent={
          <ThemedText type="caption" tone="secondary" style={styles.empty}>
            No events found
          </ThemedText>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  list: {
    paddingBottom: Spacing['3xl'],
  },
  createBtn: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
