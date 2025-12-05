'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiCall } from '@/lib/hooks/useFetch';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (username: string, email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string, name: string) => {
      const response = await apiCall('/api/auth/register', 'POST', {
        username,
        email,
        password,
        name,
      }) as any;

      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiCall('/api/auth/login', 'POST', { email, password }) as any;

    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!token) throw new Error('Not authenticated');

      const response = await apiCall('/api/auth/profile', 'PUT', data, token) as User;
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
