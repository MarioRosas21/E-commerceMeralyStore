"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  isCartOpen: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;

  getItemQuantity: (id: string) => number;
  total: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      openCart: () => set({ isCartOpen: true }),

      closeCart: () => set({ isCartOpen: false }),

      toggleCart: () =>
        set((state) => ({
          isCartOpen: !state.isCartOpen,
        })),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            if (existing.quantity >= existing.stock) {
              return {
                isCartOpen: true,
                items: state.items,
              };
            }

            return {
              isCartOpen: true,
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          if (item.stock <= 0) {
            return {
              isCartOpen: true,
              items: state.items,
            };
          }

          return {
            isCartOpen: true,
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  quantity: Math.min(Math.max(1, quantity), i.stock),
                }
              : i
          ),
        })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.quantity < i.stock
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, i.quantity - 1) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getItemQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        return item?.quantity || 0;
      },

      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",

      partialize: (state) => ({
        items: state.items,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);