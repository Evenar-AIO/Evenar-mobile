import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Image,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useEventStore } from '@/store/event.store'; 
import { EventItem } from '@/features/event/types/event.type'; 

export default function EventsScreen() {
    const { events, loading, fetchEvents, deleteEvent } = useEventStore();

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRefresh = async () => {
        await fetchEvents();
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEvent(id);
            await fetchEvents();
        } catch (error) {
            console.log(error);
        }
    };

    const renderItem = ({ item }: { item: EventItem }) => (
        <View style={styles.card}>
            {!!item.imageURL && (
                <Image source={{ uri: item.imageURL }} style={styles.image} />
            )}

            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.text}>{item.description}</Text>
            <Text style={styles.meta}>📍 {item.physicalLocation}</Text>
            <Text style={styles.meta}>
                🕒 {new Date(item.startTime).toLocaleString()} -{' '}
                {new Date(item.endTime).toLocaleString()}
            </Text>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() =>
                        router.push({
                            pathname: '/owner/event/edit/[id]',
                            params: { id: item._id },
                        })
                    }
                >
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => handleDelete(item._id)}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && events.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.header}>Events</Text>

                <TouchableOpacity
                    style={styles.createBtn}
                    onPress={() => router.push('/owner/event/create' as const)}
                >
                    <Text style={styles.createBtnText}>+ Create</Text>
                </TouchableOpacity>
            </View>

            <FlatList<EventItem>
                data={events}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>No events found</Text>
                    </View>
                }
                contentContainerStyle={events.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
    },
    createBtn: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    createBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    text: {
        color: '#444',
        marginBottom: 8,
    },
    meta: {
        color: '#666',
        marginBottom: 4,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#f59e0b',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});