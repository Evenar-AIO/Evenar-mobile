import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import EventForm from '@/features/event/components/EventForm';
import { useEventStore } from '@/store/event.store';
import type { EventPayload } from '@/features/event/types/event.type';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, fetchEvents, updateEvent } = useEventStore();

  const [values, setValues] = useState<EventPayload>({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    physicalLocation: '',
    layout: '',
    imageURL: '',
    genreId: '',
    totalTicketCount: '',
  });

  useEffect(() => {
    if (!events || events.length === 0) {
      fetchEvents();
    }
  }, [events, fetchEvents]);

  const event = useMemo(
    () => events.find((item) => String(item._id) === String(id)),
    [events, id]
  );

  useEffect(() => {
    if (event) {
      setValues({
        name: event.name || '',
        description: event.description || '',
        physicalLocation: event.physicalLocation || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        imageURL: event.imageURL || '',
        layout: event.layout || '',
        genreId: event.genreId || '',
        totalTicketCount: String(event.totalTicketCount || ''),
      });
    }
  }, [event]);

  const handleChange = (field: keyof EventPayload, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!id) return;

    try {
      await updateEvent(String(id), {
        name: values.name,
        description: values.description,
        startTime: values.startTime,
        endTime: values.endTime,
        physicalLocation: values.physicalLocation,
        layout: values.layout,
        imageURL: values.imageURL,
        genreId: values.genreId,
        totalTicketCount: String(values.totalTicketCount || '0'),
      });

      Alert.alert('Success', 'Event updated successfully');
      router.replace('/owner/event');
    } catch {
      Alert.alert('Notice', 'Backend hiện có thể chưa hỗ trợ PUT /events/:id.');
    }
  };

  if (!event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Event</Text>
      <EventForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Update Event"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
});