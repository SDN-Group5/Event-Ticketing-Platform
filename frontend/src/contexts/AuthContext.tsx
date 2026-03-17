import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { UserRole } from '../../../shared/type';

// Constants
const API_BASE_URL =
    (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'auth_token';

// User interface dùng cho session phía frontend
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string | null;
}

// Helper để trích xuất thông báo lỗi an toàn (tránh render array/object gây crash React)
const extractErrorMessage = (message: any, defaultMsg: string): string => {
    if (!message) return defaultMsg;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
        return message.map(m => m.msg || m.message || (typeof m === 'string' ? m : JSON.stringify(m))).join(', ');
    }
    if (typeof message === 'object') {
        return message.msg || message.message || JSON.stringify(message);
    }
    return String(message);
};


// Auth context type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<User | null>;
    loginWithGoogle: (credential: string) => Promise<User | null>;
    register: (payload: { firstName: string; lastName: string; email: string; password: string; role?: string }) => Promise<boolean>;
    verifyEmail: (email: string, code: string) => Promise<boolean>;
    resendVerification: (email: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
    children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // INITIALIZE SESSION
    // ============================================
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                setIsInitializing(false);
                return;
            }

            try {
                // Gọi endpoint validate-token qua API Gateway
                const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    const userId = data.userId || data.id || data._id || '';
                    const role = data.role as UserRole | undefined;

                    if (!userId || !role) {
                        throw new Error('Invalid validate-token response');
                    }

                    // Khởi tạo user tối thiểu để giữ session sau F5
                    setUser((prev) => ({
                        id: userId,
                        name: prev?.name || 'Người dùng',
                        email: prev?.email || '',
                        role,
                        avatar: prev?.avatar ?? null,
                    }));
                } else {
                    // Token invalid or expired
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                }
            } catch (err) {
                console.error("Failed to restore session:", err);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeAuth();
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ============================================
    // LOGIN
    // ============================================
    const login = useCallback(async (email: string, password: string): Promise<User | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                // Cho phép trình duyệt nhận & gửi cookie (jwt) với request này
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Đăng nhập thất bại'));
                return null;
            }

            const token = data?.token;
            const userInfo = data?.user;

            if (!token || !userInfo) {
                setError('Phản hồi không hợp lệ từ server');
                return null;
            }

            localStorage.setItem(AUTH_TOKEN_KEY, token);

            const loggedInUser: User = {
                id: userInfo.id || userInfo._id || '',
                name: `${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim() || userInfo.email,
                email: userInfo.email,
                role: userInfo.role as UserRole,
                avatar: userInfo.avatar ?? null,
            };

            setUser(loggedInUser);
            return loggedInUser;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // REGISTER
    // ============================================
    const register = useCallback(async (payload: { firstName: string; lastName: string; email: string; password: string; role?: string }): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Đăng ký thất bại'));
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // VERIFY EMAIL (OTP)
    // ============================================
    const verifyEmail = useCallback(async (email: string, code: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Xác thực email thất bại'));
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // RESEND VERIFICATION CODE
    // ============================================
    const resendVerification = useCallback(async (email: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Gửi lại mã thất bại'));
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // FORGOT PASSWORD (Request reset code)
    // ============================================
    const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Yêu cầu đặt lại mật khẩu thất bại'));
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // VERIFY RESET CODE
    // ============================================
    const verifyResetCode = useCallback(async (email: string, code: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Mã xác thực không hợp lệ'));
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // RESET PASSWORD
    // ============================================
    const resetPassword = useCallback(async (email: string, code: string, newPassword: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Đặt lại mật khẩu thất bại'));
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ============================================
    // LOGIN WITH GOOGLE
    // ============================================
    const loginWithGoogle = useCallback(async (credential: string): Promise<User | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                setError(extractErrorMessage(data?.message, 'Đăng nhập Google thất bại'));
                return null;
            }

            const token = data?.token;
            const userInfo = data?.user;

            if (!token || !userInfo) {
                setError('Phản hồi không hợp lệ từ server');
                return null;
            }

            localStorage.setItem(AUTH_TOKEN_KEY, token);

            const loggedInUser: User = {
                id: userInfo.id || userInfo._id || '',
                name: `${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim() || userInfo.email,
                email: userInfo.email,
                role: userInfo.role as UserRole,
                avatar: userInfo.avatar ?? null,
            };

            setUser(loggedInUser);
            return loggedInUser;
        } catch (err) {
            console.error(err);
            setError('Không thể kết nối server');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setUser(null);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        isInitializing,
        isLoading,
        error,
        login,
        loginWithGoogle,
        register,
        verifyEmail,
        resendVerification,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};