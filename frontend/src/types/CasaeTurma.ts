/**
 * Interface para a Casa de Hogwarts (Grifinória, Sonserina, etc.).
 */
export interface Casa {
  id: number;
  nome: string;
  diretor: string;
  cor: string; // Ex: #7F0909
}

/**
 * Interface para a Turma (Ex: 1º Ano MATUTINO).
 */
export interface Turma {
  id: number;
  ano: number;
  turno: "MATUTINO" | "VESPERTINO" | "NOTURNO";
}

export type CreateCasaDTO = Omit<Casa, "id">;
export type UpdateCasaDTO = Partial<CreateCasaDTO>;

export type CreateTurmaDTO = Omit<Turma, "id">;
export type UpdateTurmaDTO = Partial<CreateTurmaDTO>;
