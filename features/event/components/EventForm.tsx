import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { EventPayload } from '../types/event.type';

type Props = {
  values: EventPayload;
  onChange: (field: keyof EventPayload, value: string) => void;
  onSubmit: () => void;
  submitText?: string;
  loading?: boolean;
};

export default function EventForm({
  values,
  onChange,
  onSubmit,
  submitText = 'Save Event',
  loading = false,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Event Name</Text>
      <TextInput
        style={styles.input}
        value={values.name}
        onChangeText={(v) => onChange('name', v)}
        placeholder="Enter event name"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={values.description}
        onChangeText={(v) => onChange('description', v)}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Start Time</Text>
      <TextInput
        style={styles.input}
        value={values.startTime}
        onChangeText={(v) => onChange('startTime', v)}
        placeholder="2026-07-20T18:00:00Z"
      />

      <Text style={styles.label}>End Time</Text>
      <TextInput
        style={styles.input}
        value={values.endTime}
        onChangeText={(v) => onChange('endTime', v)}
        placeholder="2026-07-20T23:00:00Z"
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={values.physicalLocation}
        onChangeText={(v) => onChange('physicalLocation', v)}
        placeholder="Enter location"
      />

      <Text style={styles.label}>Layout</Text>
      <TextInput
        style={styles.input}
        value={values.layout}
        onChangeText={(v) => onChange('layout', v)}
        placeholder="concert-hall"
      />

      <Text style={styles.label}>Image URL</Text>
      <TextInput
        style={styles.input}
        value={values.imageURL}
        onChangeText={(v) => onChange('imageURL', v)}
        placeholder="https://..."
      />

      <Text style={styles.label}>Genre ID</Text>
      <TextInput
        style={styles.input}
        value={values.genreId}
        onChangeText={(v) => onChange('genreId', v)}
        placeholder="genre id"
      />

      <Text style={styles.label}>Total Ticket Count</Text>
      <TextInput
        style={styles.input}
        value={values.totalTicketCount}
        onChangeText={(v) => onChange('totalTicketCount', v)}
        placeholder="100"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : submitText}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});