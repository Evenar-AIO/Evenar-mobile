import api from '../../../services/api';
import { EventPayload } from '../types/event.type';

export const getEventsApi = async () => {
  const res = await api.get('/events');
  return res.data;
};

export const getEventByIdApi = async (id: string) => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};

export const createEventApi = async (payload: EventPayload) => {
  const res = await api.post('/events', payload);
  return res.data;
};

export const updateEventApi = async (id: string, payload: EventPayload) => {
  const res = await api.put(`/events/${id}`, payload);
  return res.data;
};

export const deleteEventApi = async (id: string) => {
  const res = await api.delete(`/events/${id}`);
  return res.data;
};