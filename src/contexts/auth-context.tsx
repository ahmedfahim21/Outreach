"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';

interface User {
  id: number;
  companyName: string;
  purpose: string;
  contactEmail: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();

  const checkExistingUser = async (walletAddress: string): Promise<User | null> => {
    try {
      const response = await fetch(`/api/user?walletAddress=${walletAddress}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error checking user:", error);
      return null;
    }
  };

  const refreshUser = useCallback(async () => {
    if (!address || !isConnected) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userData = await checkExistingUser(address);
    setUser(userData);
    setIsLoading(false);
  }, [address, isConnected]);

  const signOut = () => {
    setUser(null);
  };

  useEffect(() => {
    if (isConnected && address) {
      refreshUser();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const isAuthenticated = Boolean(user && isConnected);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    refreshUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
