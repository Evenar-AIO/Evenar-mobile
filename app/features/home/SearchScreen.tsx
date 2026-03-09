import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { bookingService } from '../../booking/bookingService';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const data = await bookingService.searchEvents({ q: text });
        setResults(data.events || []);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Type to search..." 
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        autoFocus
      />
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            onPress={() => router.push(`/features/booking/EventDetailScreen?id=${item._id}`)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item._id || index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: { backgroundColor: '#f0f0f0', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 16 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: 'bold' },
  date: { color: '#666', marginTop: 4 }
});
