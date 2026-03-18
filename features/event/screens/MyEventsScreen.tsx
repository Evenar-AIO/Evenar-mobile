import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import EventCard from '../components/EventCard';
import { EventItem } from '../types/event.type';
import { deleteEvent, getEvents } from '../services/event.service';

export default function MyEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => router.push('/owner/event/create')}
      >
        <Text style={styles.createBtnText}>+ Create New Event</Text>
      </TouchableOpacity>

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
        ListEmptyComponent={<Text style={styles.empty}>No events found</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  list: {
    padding: 16,
  },
  createBtn: {
    margin: 16,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});