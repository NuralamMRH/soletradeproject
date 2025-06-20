import React, { createContext, useContext, useState } from "react";
import { router } from "expo-router";

type AuthContextType = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: any;
  login: (userData: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => {
    setIsAuthenticated(true);
    setIsAdmin(userData.role === "admin");
    setUser(userData);
    router.replace("/(tabs)");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAdmin, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
