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

    const login = useCallback((role: UserRole) => {
        setUser(DEMO_USERS[role]);
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
