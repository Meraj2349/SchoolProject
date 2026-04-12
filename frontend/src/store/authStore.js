import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,

      setToken: (token) => {
        Cookies.set("token", token, { expires: 7 });
        set({ token, isAuthenticated: true });
      },

      clearAuth: () => {
        Cookies.remove("token");
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-store",
      // Only persist token; re-hydrate isAuthenticated from it
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
