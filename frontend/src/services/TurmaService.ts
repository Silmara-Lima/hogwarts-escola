import api from "./api";

// ======================================================
// TIPOS
// ======================================================

export interface Turma {
  id: number;
  nomeTurma: string;
  anoLetivo: number;
  disciplinaId: number;
  professorResponsavelId: number;
}

export interface CreateTurmaDTO {
  nomeTurma: string;
  anoLetivo: number;
  disciplinaId: number;
  professorResponsavelId: number;
}

export interface UpdateTurmaDTO {
  nomeTurma?: string;
  anoLetivo?: number;
  disciplinaId?: number;
  professorResponsavelId?: number;
}

// ======================================================
// ENDPOINT BASE
// ======================================================

const ENDPOINT = "/turmas";

// ======================================================
// LISTAR
// ======================================================

export const getTurmas = async (): Promise<Turma[]> => {
  const response = await api.get<Turma[]>(ENDPOINT);
  return response.data;
};

// ======================================================
// CRIAR
// ======================================================

export const createTurma = async (
  turmaData: CreateTurmaDTO
): Promise<Turma> => {
  const response = await api.post<Turma>(ENDPOINT, turmaData);
  return response.data;
};

// ======================================================
// ATUALIZAR
// ======================================================

export const updateTurma = async (
  id: number,
  turmaData: UpdateTurmaDTO
): Promise<Turma> => {
  const response = await api.put<Turma>(`${ENDPOINT}/${id}`, turmaData);
  return response.data;
};

// ======================================================
// DELETAR
// ======================================================

export const deleteTurma = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};
