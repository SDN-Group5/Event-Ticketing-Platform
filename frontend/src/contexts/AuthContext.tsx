import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// User roles
export type UserRole = 'customer' | 'organizer' | 'admin';

// User interface
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

// Demo users for testing
const DEMO_USERS: Record<UserRole, User> = {
    customer: {
        id: 'user-1',
        name: 'Alex Rivers',
        email: 'alex@example.com',
        role: 'customer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzQLjgCEZYT3Z1IquCHXVgRti4HN_IpR_ZI0626Xzmeo3jOq-mu0Nuow6DAApb6_rdyvuJhEq2q4hznXrT-Tgc1j5VnI-51JhxVBWR7FEwUD2q9WALOhWYKjo9JrV0tgBCH6Zq71AptCBLtxXhXyAGE9j3a-oW2efRycH7sNIKmq7UxRZhJwGo84k07maxd5CQyvHkEqQ0H_VlIdBqwF37eOg2TYpFsykyVyw28QBrHxtqkqLy4UJob9hPCFGjat0mGBGT_keoitGd',
    },
    organizer: {
        id: 'org-1',
        name: 'Sonic Horizon Events',
        email: 'contact@sonichorizon.com',
        role: 'organizer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKf-tSRtUuDs4uX7ou7uLckx9BBfn5MjZTm9_qAm2qhNwN4JwjW4BI9HrmPwlSwFVT45AYftcNa3ZiICRGPv5trEIex4OPctttjv9QzGkvGuyuOroWg54bQqBEyPd3Ce7YYw9rjQotO3AtcEQDAkXy5hz32K8jcCBJp9sEfYHpH4ss-kCCIX0pIov3Cuxc8f5VwszIJPFlJG5Kuw-wTVZw6E9Ae2mFFhrePdzq-xyF-agAcmjVa_PQsleK9lANTYwP24nzVGxp85yP',
    },
    admin: {
        id: 'admin-1',
        name: 'System Admin',
        email: 'admin@ticketvibe.com',
        role: 'admin',
    },
};

// Auth context type
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
    switchRole: (role: UserRole) => void;
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
                setError(data?.message || 'Đăng nhập thất bại');
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

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const switchRole = useCallback((role: UserRole) => {
        setUser(DEMO_USERS[role]);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        switchRole,
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
