import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEventStore } from '@/store/event.store';
import { EventItem } from '@/features/event/types/event.type';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Tất cả', 'Nhạc sống', 'Sân khấu & Nghệ thuật', 'Hội thảo & Workshop', 'Thể thao'];

export default function EventsScreen() {
  const { events, fetchEvents, loading } = useEventStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const theme = useColorScheme() ?? 'dark';
  const palette = Colors[theme];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const results = useMemo(() => {
    let filtered = events;
    if (query) {
      const term = query.toLowerCase();
      filtered = filtered.filter((event) => event.name?.toLowerCase().includes(term));
    }
    if (category !== 'Tất cả') {
      filtered = filtered.filter((e) => {
         const name = e.name.toLowerCase();
         if (category === 'Nhạc sống') return name.includes('music') || name.includes('concert') || name.includes('show');
         if (category === 'Hội thảo & Workshop') return name.includes('workshop') || name.includes('conference');
         if (category === 'Sân khấu & Nghệ thuật') return name.includes('art') || name.includes('theatre') || name.includes('kịch');
         return true;
      });
    }
    return filtered;
  }, [events, query, category]);

  const renderGridCard = ({ item }: { item: EventItem }) => {
    const date = item.startTime ? new Date(item.startTime) : null;
    let dateStr = 'TBA';
    if (date) {
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      dateStr = `${d} Tháng ${m}, ${y}`;
    }

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/events/[id]', params: { id: item._id } })}
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.cardImgWrap}>
          {item.imageURL ? (
            <Image 
              source={{ uri: item.imageURL }} 
              style={styles.cardImg} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImg, { backgroundColor: palette.surface2, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="musical-notes-outline" size={32} color={palette.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.cardPrice, { color: palette.success }]}>
            Từ 120.000 đ
          </Text>
          <View style={styles.cardDateRow}>
            <Ionicons name="calendar-outline" size={12} color={palette.textMuted} />
            <Text style={[styles.cardDateText, { color: palette.textSecondary }]} numberOfLines={1}>
              {dateStr}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: (insets.top || 16) + 12 }]}>
        <View style={[styles.searchBar, { backgroundColor: palette.surface1 }]}>
          <Ionicons name="search" size={20} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
            placeholderTextColor={palette.textMuted}
            style={[styles.searchInput, { color: palette.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={palette.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isSelected ? palette.accent : palette.surface2 },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { 
                      color: isSelected ? '#fff' : palette.textSecondary, 
                      fontFamily: isSelected ? 'Poppins_600SemiBold' : 'Poppins_400Regular' 
                    },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderGridCard}
        keyboardShouldPersistTaps="handled"
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchEvents}
        refreshing={loading}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={palette.textMuted} />
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>
              {loading ? 'Đang tải...' : 'Không tìm thấy sự kiện nào.'}
            </Text>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    padding: 0, 
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  card: {
    flex: 1,
    maxWidth: '48%', 
  },
  cardImgWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    gap: 3,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    height: 36, 
  },
  cardPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    marginTop: 2,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardDateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
});
