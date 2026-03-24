import { create } from 'zustand';

interface BookingState {
  cart: { items: any[], totalPrice: number };
  currentBooking: { eventId: string | null, tickets: any[], status: string };
  orders: { items: any[], loading: boolean };
  addToCart: (item: any) => void;
  confirmBooking: (booking: any) => void;
  fetchOrders: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  cart: { items: [], totalPrice: 0 },
  currentBooking: { eventId: null, tickets: [], status: 'IDLE' },
  orders: { items: [], loading: false },
  addToCart: (item) => set((state) => ({
    cart: { 
      items: [...state.cart.items, item], 
      totalPrice: state.cart.totalPrice + (item.price * item.quantity) 
    }
  })),
  confirmBooking: (booking) => set(() => ({ currentBooking: booking })),
  fetchOrders: () => set((state) => ({ ...state, orders: { ...state.orders, loading: true } }))
}));
