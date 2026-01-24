import axiosInstance from "./lib/api-client";
import { RegisterFormData, SignInFormData } from "./schemas/auth.schemas";
import { UserType } from "../../shared/types";
import { queryClient } from "./main";

// ============================================
// USER MANAGEMENT APIs
// ============================================

/**
 * Get current authenticated user information
 */
export const fetchCurrentUser = async (): Promise<UserType> => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data;
};

/**
 * Update current user's profile
 */
export const updateProfile = async (data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    city?: string;
    country?: string;
  };
}): Promise<{ message: string; user: UserType }> => {
  const response = await axiosInstance.patch("/api/users/me", data);
  return response.data;
};

/**
 * Upload avatar image to Cloudinary
 */
export const uploadAvatar = async (file: File): Promise<{ message: string; avatar: string; user: UserType }> => {
  const formData = new FormData();
  formData.append("avatar", file);
  
  // ✅ QUAN TRỌNG: Không set Content-Type khi dùng FormData
  // Axios interceptor đã tự động xóa Content-Type cho FormData
  const response = await axiosInstance.patch("/api/users/me/avatar", formData);
  return response.data;
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (params?: {
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.append("role", params.role);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  const limit = params?.limit || 1000;
  queryParams.append("limit", limit.toString());
  if (params?.search) queryParams.append("search", params.search);

  const response = await axiosInstance.get(
    `/api/users?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get user by ID (Admin only)
 */
export const getUserById = async (userId: string) => {
  const response = await axiosInstance.get(`/api/users/${userId}`);
  return response.data;
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (
  userId: string,
  userData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role: "customer" | "organizer" | "staff" | "admin";
    phone: string;
    isActive: boolean;
  }>
) => {
  const response = await axiosInstance.patch(`/api/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user - Soft delete (Admin only)
 */
export const deleteUser = async (userId: string) => {
  const response = await axiosInstance.delete(`/api/users/${userId}`);
  return response.data;
};

/**
 * Update user password (Admin only)
 */
export const updateUserPassword = async (
  userId: string,
  newPassword: string
) => {
  const response = await axiosInstance.patch(
    `/api/users/${userId}/password`,
    { newPassword }
  );
  return response.data;
};

/**
 * Activate user (Admin only)
 */
export const activateUser = async (userId: string) => {
  const response = await axiosInstance.patch(`/api/users/${userId}/activate`);
  return response.data;
};

// ============================================
// AUTHENTICATION APIs
// ============================================

/**
 * Register a new user account
 */
export const register = async (formData: RegisterFormData) => {
  const response = await axiosInstance.post("/api/auth/register", formData);
  return response.data;
};

/**
 * Verify email with OTP code
 */
export const verifyEmail = async (payload: { email: string; code: string }) => {
  const response = await axiosInstance.post("/api/auth/verify-email", payload);
  return response.data;
};

/**
 * Resend verification email
 */
export const resendVerification = async (payload: { email: string }) => {
  const response = await axiosInstance.post(
    "/api/auth/resend-verification",
    payload
  );
  return response.data;
};

/**
 * Request password reset (sends OTP to email)
 */
export const forgotPassword = async (payload: { email: string }) => {
  const response = await axiosInstance.post("/api/auth/forgot-password", payload);
  return response.data;
};

/**
 * Verify password reset code
 */
export const verifyResetCode = async (payload: { email: string; code: string }) => {
  const response = await axiosInstance.post("/api/auth/verify-reset-code", payload);
  return response.data;
};

/**
 * Reset password with verified code
 */
export const resetPassword = async (payload: {
  email: string;
  code: string;
  newPassword: string;
}) => {
  const response = await axiosInstance.post("/api/auth/reset-password", payload);
  return response.data;
};

/**
 * Sign in user
 */
export const signIn = async (formData: SignInFormData) => {
  const response = await axiosInstance.post("/api/auth/login", formData);

  // Store JWT token from response body in localStorage
  const token = response.data?.token;
  if (token) {
    localStorage.setItem("session_id", token);
  }

  // Store user info for incognito mode fallback
  if (response.data?.userId) {
    localStorage.setItem("user_id", response.data.userId);
  }

  // Force validate token after successful login to update React Query cache
  try {
    await validateToken();

    // Invalidate and refetch the validateToken query to update the UI
    queryClient.invalidateQueries({ queryKey: ["validateToken"] });

    // Force a refetch to ensure the UI updates
    await queryClient.refetchQueries({ queryKey: ["validateToken"] });
  } catch (error) {
    // Token validation failed, but continue if we have a stored token (incognito mode)
    if (!localStorage.getItem("session_id")) {
      throw error;
    }
  }

  return response.data;
};

/**
 * Validate JWT token
 */
export const validateToken = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Not logged in, throw error so React Query knows it failed
      throw new Error("Token invalid");
    }
    // For any other error (network, etc.), also throw
    throw new Error("Token validation failed");
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  const response = await axiosInstance.post("/api/auth/logout");

  // Clear localStorage (JWT tokens)
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");

  return response.data;
};

/**
 * Development utility to clear all browser storage
 */
export const clearAllStorage = () => {
  // Clear localStorage
  localStorage.clear();
  // Clear sessionStorage
  sessionStorage.clear();
  // Clear cookies (by setting them to expire in the past)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};
