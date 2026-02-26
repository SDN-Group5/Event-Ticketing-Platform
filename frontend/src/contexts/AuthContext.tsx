import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// User roles
export type UserRole = 'customer' | 'organizer' | 'admin' | 'staff';

// User interface
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

// Vite phải đọc env qua import.meta.env (không dùng process.env)
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';
const AUTH_TOKEN_KEY = 'auth_token';

// Auth context type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
    login: (email: string, password: string) => Promise<User | null>;
    register: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
    logout: () => void;
    // Email verification
    verifyEmail: (email: string, code: string) => Promise<boolean>;
    resendVerification: (email: string) => Promise<boolean>;
    // Password reset
    forgotPassword: (email: string) => Promise<boolean>;
    verifyResetCode: (email: string, code: string) => Promise<boolean>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
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
    const [error, setError] = useState<string | null>(null);

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
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend có thể trả về nhiều format khác nhau (message string, mảng errors, object...)
                let message: string = 'Đăng nhập thất bại';

                if (typeof data?.message === 'string') {
                    message = data.message;
                } else if (Array.isArray(data?.errors)) {
                    // Ví dụ: [{ type, value, msg, path, location }]
                    message = data.errors.map((e: any) => e.msg ?? '').filter(Boolean).join(', ');
                } else if (data && typeof data === 'object') {
                    // Thử lấy msg nếu có
                    if (typeof data.msg === 'string') {
                        message = data.msg;
                    }
                }

                setError(message);
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
                role: userInfo.role,
                avatar: userInfo.avatar,
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
    const register = useCallback(async (payload: { firstName: string; lastName: string; email: string; password: string }): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data?.message || 'Đăng ký thất bại');
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
                setError(data?.message || 'Xác thực email thất bại');
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
                setError(data?.message || 'Gửi lại mã thất bại');
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
                setError(data?.message || 'Yêu cầu đặt lại mật khẩu thất bại');
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
                setError(data?.message || 'Mã xác thực không hợp lệ');
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
                setError(data?.message || 'Đặt lại mật khẩu thất bại');
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
    // LOGOUT
    // ============================================
    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
    }, []);

    // ============================================
    // LOAD CURRENT USER (on app start)
    // ============================================
    const loadCurrentUser = useCallback(async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) return;

        try {
            const validateRes = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!validateRes.ok) {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                return;
            }

            const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!userRes.ok) {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                return;
            }

            const userInfo = await userRes.json();
            const loadedUser: User = {
                id: userInfo._id || userInfo.id || '',
                name: `${userInfo.firstName ?? ''} ${userInfo.lastName ?? ''}`.trim() || userInfo.email,
                email: userInfo.email,
                role: userInfo.role,
                avatar: userInfo.avatar,
            };

            setUser(loadedUser);
        } catch (err) {
            console.error(err);
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }, []);

    useEffect(() => {
        loadCurrentUser();
    }, [loadCurrentUser]);

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        isLoading,
        error,
        clearError,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        verifyResetCode,
        resetPassword,
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
