import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{orderId}</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>CONFIRMED</Text>
        
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>Oct 24, 2026</Text>
        
        <Text style={styles.label}>Total Paid</Text>
        <Text style={styles.value}>$50.00</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Download Ticket</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, styles.outlineBtn]} 
          onPress={() => router.push(`/features/booking/RefundRequestScreen?orderId=${orderId}`)}
        >
          <Text style={styles.outlineBtnText}>Request Refund</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 30 },
  label: { fontSize: 14, color: '#666', marginTop: 10 },
  value: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  actions: { gap: 15 },
  btn: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#000' },
  outlineBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
