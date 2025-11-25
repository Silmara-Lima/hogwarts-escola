// =========================================================================
// 1. Hook de autenticação
// =========================================================================
import { useContext } from "react";
import { AuthContext } from "../hooks/LoginHooks";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
// =========================================================================
