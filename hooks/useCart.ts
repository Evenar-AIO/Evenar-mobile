import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  eventId: string;
  typeId: string;
  quantity: number;
  price: number;
  name?: string;
}

interface CartStore {
  items: CartItem[];
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (eventId: string, typeId: string) => void;
  checkout: () => void;
  clear: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(i => i.eventId === item.eventId && i.typeId === item.typeId);
        
        let newItems = [...items];
        if (existingItemIndex >= 0) {
          newItems[existingItemIndex].quantity += item.quantity;
        } else {
          newItems.push(item);
        }
        
        const newTotal = newItems.reduce((sum, current) => sum + (current.price * current.quantity), 0);
        
        set({ items: newItems, totalPrice: newTotal });
      },
      removeItem: (eventId, typeId) => {
        const { items } = get();
        const existingItem = items.find(i => i.eventId === eventId && i.typeId === typeId);
        if (!existingItem) return;
        
        const newItems = items.filter(i => !(i.eventId === eventId && i.typeId === typeId));
        const newTotal = newItems.reduce((sum, current) => sum + (current.price * current.quantity), 0);
        
        set({ items: newItems, totalPrice: newTotal });
      },
      clear: () => set({ items: [], totalPrice: 0 }),
      checkout: () => {
        // Will be used by the UI to trigger checkout logic
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
