// =========================================================================
// 1. Auth Context e Provider
// =========================================================================

import React, { createContext, useState, useEffect, useContext } from "react";
import type { User } from "../types/Login";
import type { LoginFormData } from "../schemas/LoginSchema";
import { authService } from "../services/LoginService";
import api from "../services/api";

// =========================================================================
// Tipagem do Contexto de Autenticação
// =========================================================================
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginFormData) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

// =========================================================================
// Criação do Contexto
// =========================================================================
export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

// =========================================================================
// Provider
// =========================================================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("@App:user");
    const storedToken = localStorage.getItem("@App:token");

    if (storedUser && storedToken) {
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // =========================================================================
  // Função de Login
  // =========================================================================
  async function signIn(credentials: LoginFormData) {
    const response = await authService.login(credentials);
    const { token, user } = response;

    localStorage.setItem("@App:token", token);
    localStorage.setItem("@App:user", JSON.stringify(user));

    api.defaults.headers.Authorization = `Bearer ${token}`;

    setUser(user);
  }

  // =========================================================================
  // Função de Logout
  // =========================================================================
  function signOut() {
    localStorage.removeItem("@App:token");
    localStorage.removeItem("@App:user");
    delete api.defaults.headers.Authorization;
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================================================================
// Hook para usar AuthContext
// =========================================================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
