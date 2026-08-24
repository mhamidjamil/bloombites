'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Bouquet, CustomBouquet } from './types';
import { v4 as uuidv4 } from 'uuid';

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (product: Bouquet | CustomBouquet, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      totalItems: 0,
      totalPrice: 0,

      addItem: (product, quantity) => {
        set((state) => {
          if (product.id !== 'custom-bouquet') {
            const existingIndex = state.items.findIndex(
              (item) => item.product.id === product.id
            );
            if (existingIndex >= 0) {
              const newItems = [...state.items];
              newItems[existingIndex] = {
                ...newItems[existingIndex],
                quantity: newItems[existingIndex].quantity + quantity,
              };
              return { items: newItems, ...calculateTotals(newItems) };
            }
          }
          const cartItem: CartItem = { id: uuidv4(), product, quantity };
          const newItems = [...state.items, cartItem];
          return { items: newItems, ...calculateTotals(newItems) };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.id !== itemId);
            return {
              items: newItems,
              ...calculateTotals(newItems),
            };
          }
          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('cart-store rehydration failed', {
            operation: 'cart-store.rehydrate',
            error,
          });
        }
        const totals = state
          ? calculateTotals(state.items)
          : { totalItems: 0, totalPrice: 0 };
        // Rehydration runs synchronously during store creation, before the
        // useCartStore const exists; defer one microtask to avoid the TDZ.
        queueMicrotask(() => {
          useCartStore.setState({ ...totals, hasHydrated: true });
        });
      },
    }
  )
);

export default useCartStore;
