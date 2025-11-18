/**
 * Interface para a Disciplina (Ex: Poções, Feitiços).
 */
export interface Disciplina {
  id: number;
  nome: string;
  // Carga horária em horas (por exemplo, 60 horas)
  cargaHoraria: number;
  // Indica se é obrigatória para o ano/turma
  eObrigatoria: boolean;
}

// Tipos para DTOs (Data Transfer Objects)
export type CreateDisciplinaDTO = Omit<Disciplina, "id">;
export type UpdateDisciplinaDTO = Partial<CreateDisciplinaDTO>;
