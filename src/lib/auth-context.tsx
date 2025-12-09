'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from './types';
import { useRouter } from 'next/navigation';

// Mock user data
const mockAdmin: User = { id: 'admin-123', email: 'admin@bloombites.com', role: 'admin', name: 'Admin User' };
const mockCustomer: User = { id: 'cust-456', email: 'customer@example.com', role: 'customer', name: 'John Doe' };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: 'admin' | 'customer') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    try {
      const storedUser = localStorage.getItem('bloombites-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('bloombites-user');
    }
    setLoading(false);
  }, []);

  const login = (role: 'admin' | 'customer') => {
    setLoading(true);
    const userToLogin = role === 'admin' ? mockAdmin : mockCustomer;
    setUser(userToLogin);
    localStorage.setItem('bloombites-user', JSON.stringify(userToLogin));
    setLoading(false);
    router.push(role === 'admin' ? '/admin' : '/');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bloombites-user');
    router.push('/login');
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
