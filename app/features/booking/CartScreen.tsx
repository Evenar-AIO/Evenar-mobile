import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../hooks/useCart';

export default function CartScreen() {
  const cart = useCart();
  const router = useRouter();

  if (cart.items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Explore Events</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={cart.items}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.itemPrice}>${item.price * item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => cart.removeItem(item.eventId, item.typeId)}>
              <Text style={styles.removeBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => `${item.eventId}-${item.typeId}`}
      />
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>${cart.totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutBtn} 
          onPress={() => router.push('/features/booking/CheckoutScreen')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 20 },
  backBtn: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, paddingHorizontal: 20 },
  backBtnText: { color: '#000', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  removeBtn: { color: 'red', fontSize: 14 },
  summaryContainer: { marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  checkoutBtn: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
