// =========================================================================
// 1. Interfaces de usuário e autenticação
// =========================================================================
export interface User {
  id: number;
  email: string;
  nome: string;
  role: "SECRETARIO" | "PROFESSOR" | "ALUNO";
}

export interface AuthResponse {
  token: string;
  user: User;
}
