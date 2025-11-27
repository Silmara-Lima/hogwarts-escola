// =========================================================================
// 1. Interfaces principais
// =========================================================================
export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria?: number;
  eObrigatoria?: boolean;
}

export interface DisciplinaMinistrada {
  id: number;
  nomeDisciplina: string;
  idTurma: number;
}

// =========================================================================
// 2. DTOs
// =========================================================================
export type CreateDisciplinaDTO = Omit<Disciplina, "id">;
export type UpdateDisciplinaDTO = Partial<CreateDisciplinaDTO>;
