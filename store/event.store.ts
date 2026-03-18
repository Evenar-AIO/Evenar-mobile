import { create } from 'zustand';
import {
    createEventApi,
    deleteEventApi,
    getEventsApi,
    updateEventApi,
} from '../features/event/api/event.api';
import { EventItem, EventPayload } from '../features/event/types/event.type';

type EventState = {
    events: EventItem[];
    loading: boolean;
    fetchEvents: () => Promise<void>;
    createEvent: (payload: EventPayload) => Promise<void>;
    updateEvent: (id: string, payload: EventPayload) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
};

export const useEventStore = create<EventState>((set, get) => ({
    events: [],
    loading: false,

    fetchEvents: async () => {
        try {
            set({ loading: true });
            const data = await getEventsApi();

            const events = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data)
                    ? data
                    : [];

            set({ events });
        } catch (error) {
            console.log('fetchEvents error:', error);
            set({ events: [] });
        } finally {
            set({ loading: false });
        }
    },

    createEvent: async (payload) => {
        try {
            set({ loading: true });
            await createEventApi(payload);
            await get().fetchEvents();
        } finally {
            set({ loading: false });
        }
    },

    updateEvent: async (id, payload) => {
        try {
            set({ loading: true });
            await updateEventApi(id, payload);
            await get().fetchEvents();
        } finally {
            set({ loading: false });
        }
    },

    deleteEvent: async (id) => {
        try {
            set({ loading: true });
            await deleteEventApi(id);
            await get().fetchEvents();
        } finally {
            set({ loading: false });
        }
    },
}));