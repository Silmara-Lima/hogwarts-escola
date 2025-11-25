// =========================================================
// 1. Auth Service
// =========================================================
import api from "./api";
import type { LoginFormData } from "../schemas/LoginSchema";
import type { AuthResponse } from "../types/Login";

// =========================================================
// 2. Função de Login
// =========================================================
export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    // POST /auth (prefixo /api já incluso no axios)
    const response = await api.post<AuthResponse>("/auth", data);
    return response.data;
  },
};
