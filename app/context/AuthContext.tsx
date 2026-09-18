import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { secureStorage } from '../utils/secureStorage';
import type { User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  isCitizen: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isCitizen: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const storedUser = await secureStorage.getUser();
      const token = await secureStorage.getToken();

      if (storedUser && token) {
        setUser(storedUser);
      } else if (storedUser && !token) {
        console.warn('Auth hydration: user exists but token missing, clearing auth');
        await secureStorage.removeUser();
        await secureStorage.removeToken();
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (userData: User) => {
    const userWithoutToken = { ...userData };
    delete (userWithoutToken as any).token;

    const token = (userData as any)?.token;
    if (token && typeof token === 'string' && token.length > 0) {
      await secureStorage.setToken(token);
    } else {
      console.warn('[AUTH] login() called without a valid token — auth will not persist');
    }
    await secureStorage.setUser({ ...userWithoutToken, token: token || '' } as any);
    setUser(userData);
  };

  const logout = async () => {
    setUser(null);
    await secureStorage.removeUser();
    await secureStorage.removeToken();
  };

  const refreshUser = async () => {
    try {
      const storedUser = await secureStorage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isCitizen: true, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
