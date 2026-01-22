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
  isOwner: () => boolean;
  isManager: () => boolean;
  isReceptionist: () => boolean;
  isCustomer: () => boolean;
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

  isOwner: () => {
    return get().currentUser?.role === "hotel_owner";
  },

  isManager: () => {
    return get().currentUser?.role === "manager";
  },

  isReceptionist: () => {
    return get().currentUser?.role === "receptionist";
  },

  isCustomer: () => {
    const role = get().currentUser?.role;
    return !role || role === "user";
  },
}));

