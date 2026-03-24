import api from '../../../services/api';
import { EventItem, EventPayload } from '../types/event.type';

export const getEventsApi = async () => {
  const res = await api.get<EventItem[]>('/events');
  return res.data;
};

export const getEventByIdApi = async (id: string) => {
  const res = await api.get<EventItem>(`/events/${id}`);
  return res.data;
};

export const createEventApi = async (payload: EventPayload) => {
  const res = await api.post<EventItem>('/events', payload);
  return res.data;
};

export const updateEventApi = async (id: string, payload: EventPayload) => {
  const res = await api.put<EventItem>(`/events/${id}`, payload);
  return res.data;
};

export const deleteEventApi = async (id: string) => {
  const res = await api.delete<void>(`/events/${id}`);
  return res.data;
};