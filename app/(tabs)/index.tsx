import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover Events</Text>
      
      <View style={styles.searchContainer}>
        <TextInput 
          placeholder="Search for events..." 
          style={styles.searchInput}
          onFocus={() => router.push('/features/home/SearchScreen')}
        />
      </View>

      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterBtn}><Text>Music</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><Text>Tech</Text></TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}><Text>Art</Text></TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={[{ id: '1', title: 'Summer Festival' }, { id: '2', title: 'Tech Meetup' }]}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/features/booking/EventDetailScreen?id=${item.id}`)}
          >
            <View style={styles.imagePlaceholder} />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  searchContainer: { marginBottom: 16 },
  searchInput: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 },
  filters: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  filterBtn: { backgroundColor: '#eee', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  card: { width: 250, marginRight: 16 },
  imagePlaceholder: { height: 150, backgroundColor: '#ddd', borderRadius: 12, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' }
});
