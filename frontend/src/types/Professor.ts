import { type Disciplina } from "./Disciplina";

/**
 * Dados básicos de um Professor.
 */
export interface Professor {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;

  // Chave estrangeira
  disciplinaPrincipalId: number;

  // Dados para exibição (opcional)
  disciplinaPrincipal?: Disciplina;
}

export type CreateProfessorDTO = Omit<Professor, "id" | "disciplinaPrincipal">;
export type UpdateProfessorDTO = Partial<CreateProfessorDTO>;
