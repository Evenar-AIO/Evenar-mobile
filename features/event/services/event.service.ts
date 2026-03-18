import api from '../../../services/api';

export const getEvents = async () => {
  const res = await api.get('/events');
  return res.data;
};

export const getEventById = async (id: string) => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};
export const deleteEvent = async (id: string) => {
  const res = await api.delete(`/events/${id}`);
  return res.data;
}
export const updateEvent = async (id: string, payload: {
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  physicalLocation?: string;
  layout?: string;
  imageURL?: string;
  genreId?: string;
  totalTicketCount?: number;
}) => {
  const res = await api.put(`/events/${id}`, payload);
  return res.data;
};


export const createEvent = async (payload: {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  physicalLocation?: string;
  layout?: string;
  imageURL?: string;
  genreId?: string;
  totalTicketCount?: number;
}) => {
  const res = await api.post('/events', payload);
  return res.data;
};