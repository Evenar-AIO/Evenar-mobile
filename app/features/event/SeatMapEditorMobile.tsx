import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';

const { width } = Dimensions.get('window');

interface BlockData {
  id: string;
  title: string;
  color: string;
  seats: any[];
  rowCount: number;
  colCount: number;
}

interface SeatMapEditorMobileProps {
  onSave: (blocks: BlockData[]) => void;
}

export const SeatMapEditorMobile = ({ onSave }: SeatMapEditorMobileProps) => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [rowCount, setRowCount] = useState('8');
  const [colCount, setColCount] = useState('10');

  const generateSeats = (rows: number, cols: number) => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seats.push({
          id: `seat_${r}_${c}_${Date.now()}`,
          title: `${String.fromCharCode(65 + r)}${c + 1}`,
          x: c * 30,
          y: r * 30,
          salable: true,
          custom_data: { row: r, seat: c }
        });
      }
    }
    return seats;
  };

  const addSection = () => {
    if (!newSectionTitle) return;
    const r = parseInt(rowCount) || 5;
    const c = parseInt(colCount) || 5;
    
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    const newBlock: BlockData = {
      id: `block_${Date.now()}`,
      title: newSectionTitle,
      color: colors[blocks.length % colors.length],
      seats: generateSeats(r, c),
      rowCount: r,
      colCount: c
    };
    setBlocks([...blocks, newBlock]);
    setNewSectionTitle('');
    setRowCount('8');
    setColCount('10');
    setModalVisible(false);
  };

  const deleteSection = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Venue Designer</Text>
        <Text style={styles.subtitle}>Define seating sections and capacity</Text>
      </View>

      <FlatList
        data={blocks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.sectionItem, { shadowColor: item.color }]}>
            <View style={[styles.colorStrip, { backgroundColor: item.color }]} />
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statTag}>
                    <Text style={styles.statText}>{item.seats.length} Total Seats</Text>
                </View>
                <View style={styles.statTag}>
                    <Text style={styles.statText}>{item.rowCount}x{item.colCount} Grid</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteSection(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                    <Text style={{ fontSize: 40 }}>🏟️</Text>
                </View>
                <Text style={styles.emptyTitle}>No Sections Yet</Text>
                <Text style={styles.emptyText}>Tap the button below to start building your venue layout.</Text>
            </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Create New Section</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.saveBtn, blocks.length === 0 && styles.saveBtnDisabled]} 
            onPress={() => onSave(blocks)}
            disabled={blocks.length === 0}
        >
            <Text style={styles.saveBtnText}>Save & Configure Pricing</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBg}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>New Section</Text>
            
            <Text style={styles.inputLabel}>Section Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newSectionTitle}
              onChangeText={setNewSectionTitle}
              placeholder="e.g. VIP, Floor, Balcony A"
              placeholderTextColor="#94a3b8"
              autoFocus
            />

            <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Rows</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={rowCount}
                        onChangeText={setRowCount}
                        keyboardType="numeric"
                        placeholder="8"
                    />
                </View>
                <View style={{ width: 20 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Columns</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={colCount}
                        onChangeText={setColCount}
                        keyboardType="numeric"
                        placeholder="10"
                    />
                </View>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addSection} style={styles.modalConfirm}>
                <Text style={styles.modalConfirmText}>Create Section</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 40, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  listContent: { padding: 20 },
  sectionItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 16, 
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  colorStrip: { width: 6, height: '100%' },
  sectionInfo: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  statsRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  statTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  deleteBtn: { padding: 20 },
  deleteText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  addBtn: { 
    padding: 20, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: '#cbd5e1', 
    borderRadius: 16, 
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff'
  },
  addBtnText: { color: '#6366f1', fontSize: 16, fontWeight: '700' },
  emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#334155' },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 8, lineHeight: 20 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#10b981', padding: 18, borderRadius: 14, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#94a3b8' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 40 },
  modalHeader: { fontSize: 24, fontWeight: '800', marginBottom: 24, color: '#0f172a' },
  inputLabel: { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 8 },
  modalInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  rowInputs: { flexDirection: 'row' },
  modalBtns: { flexDirection: 'row', marginTop: 10 },
  modalCancel: { flex: 1, padding: 16, alignItems: 'center' },
  modalCancelText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  modalConfirm: { flex: 2, backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
