import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import EventForm from '@/features/event/components/EventForm';
import { useEventStore } from '@/store/event.store';
import type { EventPayload } from '@/features/event/types/event.type';

export default function CreateEventScreen() {
  const { createEvent } = useEventStore();
  const router = useRouter();

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

  const handleChange = (field: keyof EventPayload, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await createEvent({
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

      Alert.alert('Success', 'Event created successfully');
      router.replace('/owner/event');
    } catch (error) {
      Alert.alert('Error', 'Create event failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Event</Text>

      <EventForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Create Event"
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
});