import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '../../../shared/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  ensureUser: (name: string) => Promise<User>;
  selectUser: (userId: string) => Promise<User>;
  hasUser: () => boolean;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount - check if we have a cached user
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const userId = localStorage.getItem('circle_user_id');
      if (userId) {
        // Try to fetch the user to make sure they still exist
        const userData = await api.getUser(userId);
        setUser(userData);
      }
    } catch {
      // User doesn't exist anymore, clear cache
      localStorage.removeItem('circle_user_id');
    } finally {
      setIsLoading(false);
    }
  };

  const ensureUser = async (name: string): Promise<User> => {
    if (user) return user;
    const newUser = await api.createUser({ name });
    localStorage.setItem('circle_user_id', newUser.id);
    setUser(newUser);
    return newUser;
  };

  const selectUser = async (userId: string): Promise<User> => {
    const userData = await api.getUser(userId);
    localStorage.setItem('circle_user_id', userId);
    setUser(userData);
    return userData;
  };

  const hasUser = (): boolean => {
    return !!localStorage.getItem('circle_user_id');
  };

  const clearUser = () => {
    localStorage.removeItem('circle_user_id');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    ensureUser,
    selectUser,
    hasUser,
    clearUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}