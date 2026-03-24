import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const EventCardMobile = ({ event, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.date}>{event.date}</Text>
        <Text style={styles.price}>${event.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: 160, marginRight: 15, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imagePlaceholder: { height: 100, backgroundColor: '#eee' },
  content: { padding: 12 },
  title: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  date: { color: '#666', fontSize: 12, marginBottom: 4 },
  price: { color: '#000', fontWeight: 'bold' }
});
