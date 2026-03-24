import { api } from '../../config/api';

export const bookingService = {
  searchEvents: async (params: any) => {
    const response = await api.get('/events/search', { params });
    return response.data;
  },
  createBooking: async (bookingData: any) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  processPayment: async (paymentData: any) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  getOrders: async (params: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  requestRefund: async (refundData: any) => {
    const response = await api.post('/refunds/request', refundData);
    return response.data;
  }
};
