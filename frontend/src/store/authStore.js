"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      role: null,        // 'super_admin' | 'branch_admin'
      branchId: null,    // null for super_admin, number for branch_admin

      setAuth: (token, role, branchId) => {
        Cookies.set("token", token, { expires: 7 });
        set({
          token,
          isAuthenticated: true,
          role: role || null,
          branchId: branchId ?? null,
        });
      },

      // Legacy helper kept for backward compatibility
      setToken: (token) => {
        Cookies.set("token", token, { expires: 7 });
        set({ token, isAuthenticated: true });
      },

      clearAuth: () => {
        Cookies.remove("token");
        set({ token: null, isAuthenticated: false, role: null, branchId: null });
      },
    }),
    {
      name: "auth-store",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cookieToken = Cookies.get("token");
          state.token = cookieToken || null;
          state.isAuthenticated = !!cookieToken;
        }
      },
    },
  ),
);
