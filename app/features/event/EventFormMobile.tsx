import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
}

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
}

export const EventFormMobile = ({ onSubmit }: EventFormProps) => {
  const [form, setForm] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  const handleChange = (name: keyof EventFormData, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.date || !form.location) {
      alert('Please fill in required fields');
      return;
    }
    onSubmit(form);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Event Title *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(val) => handleChange('title', val)}
        placeholder="Enter event title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.description}
        onChangeText={(val) => handleChange('description', val)}
        placeholder="Enter event description"
        multiline
      />

      <Text style={styles.label}>Date & Time (YYYY-MM-DD HH:mm) *</Text>
      <TextInput
        style={styles.input}
        value={form.date}
        onChangeText={(val) => handleChange('date', val)}
        placeholder="2026-03-15 19:00"
      />

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(val) => handleChange('location', val)}
        placeholder="City, Venue"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Next: Configure Seat Map</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#0066cc', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
