import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import EventForm from '../components/EventForm';
import { EventPayload } from '../types/event.type';
import { getEventById, updateEvent } from '../services/event.service';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const event = await getEventById(id);

        setValues({
          name: event.name || '',
          description: event.description || '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          physicalLocation: event.physicalLocation || '',
          layout: event.layout || '',
          imageURL: event.imageURL || '',
          genreId: event.genreId || '',
          totalTicketCount: String(event.totalTicketCount || ''),
        });
      } catch (error: any) {
        Alert.alert('Error', error?.response?.data?.error || 'Cannot load event');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      await updateEvent(String(id), {
        name: values.name,
        description: values.description,
        startTime: values.startTime,
        endTime: values.endTime,
        physicalLocation: values.physicalLocation,
        layout: values.layout,
        imageURL: values.imageURL,
        genreId: values.genreId,
        totalTicketCount: Number(values.totalTicketCount || 0),
      });

      Alert.alert('Success', 'Event updated successfully');
    } catch (error: any) {
      Alert.alert(
        'Notice',
        error?.response?.data?.error ||
          'Backend zip chưa có PUT /events/:id nên chức năng update chưa chạy thật.'
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
    <EventForm
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitText="Update Event"
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