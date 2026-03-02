import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../services/authApiService';
import type { UserRole } from '../../../shared/type';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export type UserRoleMobile = 'guest' | 'customer' | 'organizer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleMobile;
  avatar?: string | null;
}

type AuthState = {
  role: UserRoleMobile;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextValue = {
  auth: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Legacy methods for compatibility
  signOut: () => Promise<void>;
  signInAsUser: () => void;
  signInAsStaff: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userDataStr = await AsyncStorage.getItem(USER_DATA_KEY);

      if (token && userDataStr) {
        try {
          // Validate token with backend
          const validation = await AuthAPI.validateToken(token);
          const userData = JSON.parse(userDataStr);
          
          // Update user data if validation succeeds
          setUser({
            id: validation.userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: (validation.role as UserRoleMobile) || 'customer',
            avatar: userData.avatar,
          });
        } catch (err) {
          // Token invalid, clear storage
          await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthAPI.login({ email, password });

      // Save token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role as UserRoleMobile,
      };

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      setUser(userData);

      return true;
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; requiresVerification?: boolean; email?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthAPI.register({ firstName, lastName, email, password });

      return {
        success: true,
        requiresVerification: response.requiresEmailVerification,
        email: response.email,
      };
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthAPI.verifyEmail({ email, code });
      return true;
    } catch (err: any) {
      setError(err.message || 'Xác thực email thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthAPI.resendVerification(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'Gửi lại mã thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthAPI.forgotPassword({ email });
      return true;
    } catch (err: any) {
      setError(err.message || 'Yêu cầu đặt lại mật khẩu thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyResetCode = useCallback(async (email: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthAPI.verifyResetCode({ email, code });
      return true;
    } catch (err: any) {
      setError(err.message || 'Mã xác thực không hợp lệ');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthAPI.resetPassword({ email, code, newPassword });
      return true;
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear storage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      setUser(null);
      
      // Call logout API (optional, token already removed)
      try {
        await AuthAPI.logout();
      } catch (err) {
        // Ignore logout API errors
      }
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Legacy methods for compatibility
  const signOut = logout;
  const signInAsUser = useCallback(() => {
    // This is a mock method, kept for compatibility
    // Real login should use the login() method
    console.warn('signInAsUser is deprecated. Use login() instead.');
  }, []);
  const signInAsStaff = useCallback(() => {
    // This is a mock method, kept for compatibility
    console.warn('signInAsStaff is deprecated. Use login() instead.');
  }, []);

  const authState: AuthState = useMemo(() => ({
    role: user?.role || 'guest',
    user,
    isAuthenticated: user !== null,
    isLoading,
  }), [user, isLoading]);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth: authState,
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      login,
      register,
      verifyEmail,
      resendVerification,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      logout,
      clearError,
      signOut,
      signInAsUser,
      signInAsStaff,
    }),
    [authState, user, isLoading, error, login, register, verifyEmail, resendVerification, forgotPassword, verifyResetCode, resetPassword, logout, clearError, signOut, signInAsUser, signInAsStaff]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
