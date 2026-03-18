import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { EventItem } from '../types/event.type'; 

type Props = {
  item: EventItem;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function EventCard({ item, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      {!!item.imageURL && (
        <Image source={{ uri: item.imageURL }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>{item.physicalLocation || 'No location'}</Text>
        <Text style={styles.text}>
          {item.startTime ? new Date(item.startTime).toLocaleString() : 'No time'}
        </Text>
        <Text style={styles.status}>Status: {item.status || 'unknown'}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    color: '#7a3cff',
    marginTop: 4,
    marginBottom: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});