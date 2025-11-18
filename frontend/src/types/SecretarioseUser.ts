/** Papéis de usuário no sistema de gerenciamento. */
export type UserRole = "SECRETARIO" | "PROFESSOR" | "ALUNO";

/**
 * Dados básicos de um Secretário.
 */
export interface Secretario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

/**
 * Dados do usuário logado, incluindo o papel e detalhes específicos.
 */
export interface UserData {
  id: number;
  nome: string;
  email: string;
  role: UserRole;

  // Dados específicos para o Dashboard (opcional)
  casa?: string; // Nome da Casa (para Aluno)
  disciplinaPrincipal?: string; // Nome da Disciplina (para Professor)
}

/**
 * Retorno da API após login bem-sucedido.
 */
export interface LoginResponse {
  token: string;
  user: UserData;
}
