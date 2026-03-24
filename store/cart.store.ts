import { create } from 'zustand';

import { cartService } from '@/features/customer/services/cart.service';

type CartItem = {
  eventId: string;
  ticketInfoId: string;
  name?: string;
  price?: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  promoCode?: string;
  fetchCart: () => Promise<void>;
  addItem: (eventId: string, ticketInfoId: string, quantity: number) => Promise<void>;
  updateItem: (ticketInfoId: string, quantity: number) => Promise<void>;
  removeItem: (ticketInfoId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,
  promoCode: undefined,
  fetchCart: async () => {
    set({ loading: true });
    try {
      const data: any = await cartService.getCart();
      set({ items: data?.items ?? data?.data ?? data ?? [] });
    } catch (err: any) {
      // If 401 (Unauthorized), just clear the cart locally
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
  addItem: async (eventId, ticketInfoId, quantity) => {
    set({ loading: true });
    try {
      await cartService.addToCart({ eventId, ticketInfoId, quantity });
      // Fetch latest cart state immediately
      const data: any = await cartService.getCart();
      set({ items: data?.items ?? data?.data ?? data ?? [] });
    } finally {
      set({ loading: false });
    }
  },
  updateItem: async (ticketInfoId, quantity) => {
    set({ loading: true });
    try {
      const data: any = await cartService.updateItem(ticketInfoId, quantity);
      set({ items: data?.items ?? data?.data ?? data ?? [] });
    } catch (err: any) {
      console.error('Update cart item error:', err);
    } finally {
      set({ loading: false });
    }
  },
  removeItem: async (ticketInfoId) => {
    set({ loading: true });
    try {
      const data: any = await cartService.removeItem(ticketInfoId);
      set({ items: data?.items ?? data?.data ?? data ?? [] });
    } catch (err: any) {
      console.error('Remove cart item error:', err);
    } finally {
      set({ loading: false });
    }
  },
  clearCart: async () => {
    set({ loading: true });
    try {
      await cartService.clearCart();
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
