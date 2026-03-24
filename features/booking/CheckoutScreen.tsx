import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../hooks/useCart';
import { useBookingStore } from '../../store/bookingStore';
import { bookingService } from './bookingService';
import { useState } from 'react';

export default function CheckoutScreen() {
  const router = useRouter();
  const cart = useCart();
  const store = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'VNPAY' | 'PAYOS'>('VNPAY');

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Create booking
      const bRes = await bookingService.createBooking({
        eventId: cart.items[0]?.eventId, // Simplified for 1-day sprint multi-event cart needs more logic
        tickets: cart.items
      });
      
      store.confirmBooking(bRes);
      
      // 2. Clear cart
      cart.clear();
      
      // 3. Navigate to payment
      router.push(`/features/booking/PaymentScreen?orderId=${bRes.bookingId || bRes._id}&amount=${cart.totalPrice}&method=${method}`);
    } catch (e) {
      console.error(e);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <Text style={styles.summaryText}>{cart.items.length} items</Text>
        <Text style={styles.totalText}>Total: ${cart.totalPrice.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity 
          style={[styles.methodBtn, method === 'VNPAY' && styles.selectedMethod]} 
          onPress={() => setMethod('VNPAY')}
        >
          <Text style={[styles.methodText, method === 'VNPAY' && styles.selectedMethodText]}>VNPAY</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.methodBtn, method === 'PAYOS' && styles.selectedMethod]} 
          onPress={() => setMethod('PAYOS')}
        >
          <Text style={[styles.methodText, method === 'PAYOS' && styles.selectedMethodText]}>PAYOS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.placeBtn, loading && styles.disabled]} 
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.placeBtnText}>Place Order</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 30, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  summaryText: { fontSize: 16, marginBottom: 5 },
  totalText: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  methodBtn: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  selectedMethod: { borderColor: '#000', backgroundColor: '#000' },
  methodText: { fontSize: 16, textAlign: 'center' },
  selectedMethodText: { color: '#fff', fontWeight: 'bold' },
  placeBtn: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 'auto' },
  placeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disabled: { opacity: 0.7 }
});
