import { create } from "zustand";

/**
 * Config Store - Quản lý cấu hình hệ thống
 * Chứa các config như API endpoints, etc.
 * 
 * Note: Stripe đã được thay thế bằng PayOS
 */
interface ConfigState {
  // Có thể thêm các config khác ở đây trong tương lai
}

export const useConfigStore = create<ConfigState>(() => ({}));

