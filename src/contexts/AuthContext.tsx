import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../lib/api";
import { secureStorage } from "../lib/secureStorage";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status?: string;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate token and load user on mount
    validateAndLoadUser();
  }, []);

  const validateAndLoadUser = async () => {
    const token = secureStorage.getToken();
    const savedUser = secureStorage.getUser();

    // If no token at all, not logged in
    if (!token) {
      setIsLoading(false);
      return;
    }

    // If we have a saved user, use it immediately (don't wait for network)
    if (savedUser) {
      setUser(savedUser);
    }

    // Try to validate with backend in background
    try {
      const { valid, user: validatedUser } = await authAPI.validateToken();
      if (valid && validatedUser) {
        setUser(validatedUser);
        secureStorage.setUser(validatedUser);
      }
      // If not valid but we have a saved user, keep them logged in
      // Only logout if explicitly called
    } catch (error) {
      // Network error or backend down - keep user logged in with cached data
      console.warn("Could not validate token with backend, using cached session");
    }

    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authAPI.register({ name, email, password });
    return response;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const response = await authAPI.verifyOtp({ email, otp });
    setUser(response.user);
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setUser(response.user);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
      secureStorage.setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
