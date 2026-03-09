import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const TicketTypeSelector = ({ type, price, quantity, onAdd, onRemove }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.price}>${price}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={onRemove}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{quantity}</Text>
        <TouchableOpacity style={styles.btn} onPress={onAdd}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 12 },
  info: { flex: 1 },
  type: { fontSize: 16, fontWeight: '600' },
  price: { color: '#666', marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  btn: { width: 32, height: 32, backgroundColor: '#fff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  btnText: { fontSize: 18, fontWeight: 'bold' },
  qty: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' }
});
