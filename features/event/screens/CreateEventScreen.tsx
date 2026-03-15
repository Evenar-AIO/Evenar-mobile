import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import EventForm from '../components/EventForm';
import { EventPayload } from '../types/event.type';
import { createEvent } from '../services/event.service';

const initialValues: EventPayload = {
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  physicalLocation: '',
  layout: '',
  imageURL: '',
  genreId: '',
  totalTicketCount: '',
};

export default function CreateEventScreen() {
  const [values, setValues] = useState<EventPayload>(initialValues);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof EventPayload, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!values.name || !values.startTime || !values.endTime) {
      Alert.alert('Missing data', 'Name, start time and end time are required.');
      return;
    }

    try {
      setLoading(true);

      await createEvent({
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

      Alert.alert('Success', 'Event created successfully.');
      setValues(initialValues);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.error || 'Create event failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <EventForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Create Event"
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});