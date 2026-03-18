import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../config/api';
import { EventFormMobile, type EventFormData } from './EventFormMobile';
import { SeatMapEditorMobile } from './SeatMapEditorMobile';
import { TicketTypeConfigMobile } from './TicketTypeConfigMobile';

type Step = 'details' | 'seatmap' | 'pricing';

export default function CreateEventScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('details');
  const [eventData, setEventData] = useState<EventFormData | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);

  const handleDetailsSubmit = (data: EventFormData) => {
    setEventData(data);
    setStep('seatmap');
  };

  const handleSeatMapSave = (seatBlocks: any[]) => {
    setBlocks(seatBlocks);
    setStep('pricing');
  };

  const handleCreateEvent = async (ticketTypes: any[]) => {
    const payload = {
      ...eventData,
      userId: '507f1f77bcf86cd799439011', // Dummy ID for Owner
      blocks: blocks,
      ticketTypes: ticketTypes,
      totalSeats: blocks.reduce((sum, b) => sum + b.seats.length, 0)
    };

    try {
      const resp = await api.post('/events', payload);
      if (resp.data) {
        Alert.alert('Success', 'Event created successfully!', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to create event. Is the server running?');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Header */}
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <View style={[styles.dot, step === 'details' && styles.activeDot]} />
          <View style={[styles.dot, step === 'seatmap' && styles.activeDot]} />
          <View style={[styles.dot, step === 'pricing' && styles.activeDot]} />
        </View>
        <Text style={styles.headerLabel}>
          {step === 'details' && 'Step 1: Event Details'}
          {step === 'seatmap' && 'Step 2: Seat Map Design'}
          {step === 'pricing' && 'Step 3: Ticket Pricing'}
        </Text>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {step === 'details' && <EventFormMobile onSubmit={handleDetailsSubmit} />}
        {step === 'seatmap' && <SeatMapEditorMobile onSave={handleSeatMapSave} />}
        {step === 'pricing' && <TicketTypeConfigMobile blocks={blocks} onSave={handleCreateEvent} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fafafa' },
  progressRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  dot: { width: 40, height: 6, backgroundColor: '#ddd', borderRadius: 3 },
  activeDot: { backgroundColor: '#0066cc', width: 60 },
  headerLabel: { fontSize: 18, fontWeight: 'bold' }
});
