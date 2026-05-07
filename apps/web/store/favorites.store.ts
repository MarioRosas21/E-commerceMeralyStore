"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FavoriteItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

type FavoritesState = {
  items: FavoriteItem[];
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  totalFavorites: () => number;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      addFavorite: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);

          if (exists) return state;

          return {
            items: [...state.items, item],
          };
        }),

      removeFavorite: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      toggleFavorite: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);

          if (exists) {
            return {
              items: state.items.filter((i) => i.id !== item.id),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),

      isFavorite: (id) => {
        return get().items.some((item) => item.id === id);
      },

      totalFavorites: () => get().items.length,

      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: "favorites-storage",
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);