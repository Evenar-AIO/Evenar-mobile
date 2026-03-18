import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface TicketType {
  blockId: string;
  blockTitle: string;
  price: number;
  quota: number;
}

interface TicketTypeConfigMobileProps {
  blocks: any[];
  onSave: (types: TicketType[]) => void;
}

export const TicketTypeConfigMobile = ({ blocks, onSave }: TicketTypeConfigMobileProps) => {
  const [types, setTypes] = useState<TicketType[]>(
    blocks.map(b => ({
      blockId: b.id,
      blockTitle: b.title,
      price: 0,
      quota: b.seats.length
    }))
  );

  const updatePrice = (id: string, price: string) => {
    setTypes(prev => prev.map(t => t.blockId === id ? { ...t, price: Number(price) } : t));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Define Prices</Text>
      <ScrollView>
        {types.map(item => (
          <View key={item.blockId} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.blockTitle}</Text>
              <Text style={styles.itemQuota}>{item.quota} seats</Text>
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={item.price.toString()}
                onChangeText={(val) => updatePrice(item.blockId, val)}
                placeholder="0"
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.submitBtn} onPress={() => onSave(types)}>
          <Text style={styles.submitBtnText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 18, fontWeight: '700' },
  itemQuota: { color: '#666', marginTop: 4 },
  priceInputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#0066cc', width: 100 },
  currency: { fontSize: 18, marginRight: 5, color: '#0066cc', fontWeight: 'bold' },
  priceInput: { flex: 1, fontSize: 18, paddingVertical: 8, textAlign: 'right' },
  submitBtn: { backgroundColor: '#000', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
