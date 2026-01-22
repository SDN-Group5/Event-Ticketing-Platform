import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth Store - Quản lý authentication state
 * Thay thế AppContext cho authentication
 */
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userId: string | null;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      token: null,
      userId: null,

      setAuth: (token: string, userId: string) => {
        localStorage.setItem("session_id", token);
        localStorage.setItem("user_id", userId);
        set({ isLoggedIn: true, token, userId });
      },

      clearAuth: () => {
        localStorage.removeItem("session_id");
        localStorage.removeItem("user_id");
        set({ isLoggedIn: false, token: null, userId: null });
      },

      checkAuth: () => {
        const token = localStorage.getItem("session_id");
        const userId = localStorage.getItem("user_id");
        const hasAuth = !!(token && userId);
        
        if (hasAuth && !get().isLoggedIn) {
          set({ isLoggedIn: true, token, userId });
        }
        
        return hasAuth;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

