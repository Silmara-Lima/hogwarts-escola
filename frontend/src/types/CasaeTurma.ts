// =========================================================================
// 1. Interfaces principais
// =========================================================================
export interface Casa {
  id: number;
  nome: string;
  diretor?: string;
  cor?: string;
}

export interface Curso {
  id: number;
  nome: string;
}

export interface Turma {
  id: number;
  serie: string;
  ano: number;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
  curso?: Curso;
}

// =========================================================================
// 2. DTOs
// =========================================================================
export type CreateCasaDTO = Omit<Casa, "id">;
export type UpdateCasaDTO = Partial<CreateCasaDTO>;

export type CreateTurmaDTO = Omit<Turma, "id" | "curso"> & {
  cursoId: number;
};

export type UpdateTurmaDTO = Partial<CreateTurmaDTO>;
