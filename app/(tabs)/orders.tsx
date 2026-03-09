import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function OrderHistoryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Orders</Text>
      <FlatList
        data={[]}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/features/booking/OrderDetailScreen?orderId=${item.id}`)}>
            <Text>Order {item.id}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
