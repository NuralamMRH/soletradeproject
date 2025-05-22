import React, { createContext, useContext, useState } from "react";
import { router } from "expo-router";

type AuthContextType = {
  isAuthenticated: boolean;
  user: any;
  login: (userData: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    router.replace("/(tabs)");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
