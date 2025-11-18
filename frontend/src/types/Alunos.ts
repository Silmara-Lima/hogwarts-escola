import type { Casa, Turma } from "./CasaeTurma";

/**
 * Dados básicos de um Aluno.
 */
export interface Aluno {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: Date;

  // Chaves estrangeiras
  casaId: number;
  turmaId: number;

  // Dados para exibição (opcional, incluídos via "include" no backend)
  casa?: Casa;
  turma?: Turma;
}

// Tipos para DTOs (Data Transfer Objects)
export type CreateAlunoDTO = Omit<Aluno, "id" | "casa" | "turma">;
export type UpdateAlunoDTO = Partial<CreateAlunoDTO>;
