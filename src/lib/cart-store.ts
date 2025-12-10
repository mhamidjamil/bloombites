'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Bouquet, CustomBouquet } from './types';
import { v4 as uuidv4 } from 'uuid';

type CartState = {
  items: CartItem[];
  addItem: (product: Bouquet | CustomBouquet, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (product, quantity) => {
        const cartItem: CartItem = {
          id: uuidv4(),
          product,
          quantity,
        };
        set((state) => {
          const newItems = [...state.items, cartItem];
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalItems = state.items.reduce(
            (acc, item) => acc + item.quantity,
            0
          );
          state.totalPrice = state.items.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0
          );
        }
      },
    }
  )
);

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

export default useCartStore;
