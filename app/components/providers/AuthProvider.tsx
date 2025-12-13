'use client';

import React, { ReactNode, createContext, useState, useCallback, useEffect } from 'react';
import { getLogger } from '@/lib/logger/logger';
import { User } from '@/core/user/user.entity';

// Helper functions for token management
const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const removeTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

const logger = getLogger('AuthProvider');

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider
 * Manages global authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Try to get current user from API
        const response = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUser(data.data);
            logger.info('User authenticated', {
              userId: data.data.id,
              username: data.data.username,
            });
          }
        } else if (response.status === 401) {
          // Token invalid, clear it
          removeTokens();
          logger.warn('Invalid token, cleared');
        }
      } catch (error) {
        logger.error('Failed to initialize auth', {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData: User, token: string) => {
    setUser(userData);
    logger.info('User logged in', {
      userId: userData.id,
      username: userData.username,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeTokens();
    logger.info('User logged out');
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
