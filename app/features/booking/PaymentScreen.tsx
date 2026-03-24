import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePayment } from '../../hooks/usePayment';
import { useEffect } from 'react';

export default function PaymentScreen() {
  const { orderId, amount, method } = useLocalSearchParams();
  const router = useRouter();
  const { initiatePayment, status } = usePayment();

  useEffect(() => {
    if (orderId && amount && method) {
      initiatePayment(orderId as string, Number(amount), method as 'VNPAY' | 'PAYOS')
        .catch(() => { /* handle error */ });
    }
  }, [orderId, amount, method]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Payment</Text>

      <View style={styles.content}>
        {status === 'PROCESSING' && (
          <>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.statusText}>Connecting to {method}...</Text>
          </>
        )}
        
        {status === 'SUCCESS' && (
          <>
            <View style={styles.successIcon} />
            <Text style={styles.statusText}>Payment Successful!</Text>
            <TouchableOpacity 
              style={styles.btn} 
              onPress={() => router.push(`/(tabs)/orders`)}
            >
              <Text style={styles.btnText}>View Order</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'FAILED' && (
          <>
            <Text style={[styles.statusText, { color: 'red' }]}>Payment Failed. Please try again.</Text>
            <TouchableOpacity 
              style={styles.btn} 
              onPress={() => router.back()}
            >
              <Text style={styles.btnText}>Go Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusText: { fontSize: 18, marginTop: 20, textAlign: 'center' },
  successIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'green', marginBottom: 20 },
  btn: { backgroundColor: '#000', padding: 15, borderRadius: 8, marginTop: 30, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
