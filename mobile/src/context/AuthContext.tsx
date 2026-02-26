import React, { createContext, useContext, useMemo, useState } from 'react';

export type UserRole = 'guest' | 'user' | 'staff';

type AuthState = {
  role: UserRole;
};

type AuthContextValue = {
  auth: AuthState;
  signOut: () => void;
  signInAsUser: () => void;
  signInAsStaff: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('guest');

  const value = useMemo<AuthContextValue>(
    () => ({
      auth: { role },
      signOut: () => setRole('guest'),
      signInAsUser: () => setRole('user'),
      signInAsStaff: () => setRole('staff'),
    }),
    [role],
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
