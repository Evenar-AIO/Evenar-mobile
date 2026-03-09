import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { bookingService } from './bookingService';

export default function RefundRequestScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return alert('Please provide a reason');
    setLoading(true);
    try {
      await bookingService.requestRefund({ orderId, reason });
      alert('Refund requested successfully');
      router.back();
    } catch (e) {
      alert('Failed to request refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Refund</Text>
      <Text style={styles.subtitle}>Order #{orderId}</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Reason for Refund</Text>
        <TextInput 
          style={styles.input} 
          multiline 
          placeholder="Please explain why you are requesting a refund..."
          value={reason}
          onChangeText={setReason}
        />
        
        <TouchableOpacity 
          style={[styles.btn, loading && styles.disabled]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, marginTop: 5 },
  form: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, height: 150, textAlignVertical: 'top', marginBottom: 30 },
  btn: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disabled: { opacity: 0.5 }
});
