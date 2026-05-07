"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id?: string;
  email: string;
  role: "admin";
};

type AuthState = {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;

  setAuth: (token: string, user?: User) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hasHydrated: false,

      setAuth: (token, user) => {
        set({
          token,
          user: user || { email: "", role: "admin" },
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
        });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      isAuthenticated: () => {
        return Boolean(get().token);
      },

      isAdmin: () => {
        return get().user?.role === "admin";
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);