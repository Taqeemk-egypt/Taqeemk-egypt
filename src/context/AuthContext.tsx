import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLifetimeActive: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; username: string; displayName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      api.removeToken();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      api.setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; username: string; displayName?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(payload);
      api.setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin' || user?.email.toLowerCase() === 'elemamyoussef34@gmail.com';
  const isLifetimeActive = isSuperAdmin || user?.paymentStatus === 'approved' || user?.paymentStatus === 'lifetime_unlimited';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isLifetimeActive,
        isSuperAdmin,
        login,
        register,
        logout,
        refreshUser,
        setProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
