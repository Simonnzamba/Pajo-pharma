
import { create } from 'zustand';
import { Medication } from '@prisma/client';

interface CartItem extends Medication {
  quantityInCart: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Medication, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item, quantity) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantityInCart: i.quantityInCart + quantity } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantityInCart: quantity }] };
    }),
  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
  updateItemQuantity: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantityInCart: quantity } : i
      ),
    })),
  clearCart: () => set({ items: [] }),
}));
