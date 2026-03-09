import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../hooks/useCart';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const cart = useCart();

  const handleAddToCart = () => {
    cart.addItem({ eventId: id as string, typeId: 'standard', quantity: 1, price: 50, name: 'Standard Ticket' });
    router.push('/features/booking/CartScreen');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imagePlaceholder} />
        <View style={styles.content}>
          <Text style={styles.title}>Event Details {id}</Text>
          <Text style={styles.description}>
            Join us for an amazing experience. This event will feature incredible performances, 
            food, and a chance to meet like-minded people.
          </Text>
          
          <View style={styles.ticketSection}>
            <Text style={styles.sectionTitle}>Select Tickets</Text>
            <View style={styles.ticketType}>
              <View>
                <Text style={styles.typeName}>Standard Pass</Text>
                <Text style={styles.typePrice}>$50.00</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart - $50.00</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imagePlaceholder: { height: 250, backgroundColor: '#ccc' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, color: '#555', lineHeight: 24, marginBottom: 20 },
  ticketSection: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  ticketType: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 },
  typeName: { fontSize: 16, fontWeight: '500' },
  typePrice: { fontSize: 16, color: '#0066cc', marginTop: 4 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
