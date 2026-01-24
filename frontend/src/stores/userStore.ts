import { create } from "zustand";
import { UserType } from "../../../shared/types";

/**
 * User Store - Quản lý thông tin user hiện tại
 */
interface UserState {
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  clearCurrentUser: () => void;
  getUserRole: () => string | null;
  // Event Ticketing Platform roles
  isCustomer: () => boolean;
  isOrganizer: () => boolean;
  isStaff: () => boolean;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,

  setCurrentUser: (user: UserType | null) => {
    set({ currentUser: user });
  },

  clearCurrentUser: () => {
    set({ currentUser: null });
  },

  getUserRole: () => {
    return get().currentUser?.role || null;
  },

  isCustomer: () => {
    return get().currentUser?.role === "customer";
  },

  isOrganizer: () => {
    return get().currentUser?.role === "organizer";
  },

  isStaff: () => {
    return get().currentUser?.role === "staff";
  },

  isAdmin: () => {
    return get().currentUser?.role === "admin";
  },
}));

