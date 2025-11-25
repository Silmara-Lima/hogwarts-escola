// =========================================================================
// 1. Papéis de usuário
// =========================================================================
export type UserRole = "SECRETARIO" | "PROFESSOR" | "ALUNO";

// =========================================================================
// 2. Interfaces de usuários
// =========================================================================
export interface Secretario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface UserData {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  casa?: string; // Nome da Casa (para Aluno)
  disciplinaPrincipal?: string; // Nome da Disciplina (para Professor)
}

// =========================================================================
// 3. Resposta de login
// =========================================================================
export interface LoginResponse {
  token: string;
  user: UserData;
}
