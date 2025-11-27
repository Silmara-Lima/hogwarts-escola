import api from "./api";

// =========================================================
// 1. Tipos e DTOs de Disciplina
// =========================================================
export interface Disciplina {
  id: number;
  nome: string;
  cargaHoraria?: number; // Horas por semana
}

export interface CreateDisciplinaDTO {
  nome: string;
  cargaHoraria?: number;
}

export interface UpdateDisciplinaDTO {
  nome?: string;
  cargaHoraria?: number;
}

// =========================================================
// 2. Endpoint base
// =========================================================
const ENDPOINT = "/disciplinas";

// =========================================================
// 3. Funções CRUD
// =========================================================

export const getDisciplinas = async (): Promise<Disciplina[]> => {
  const response = await api.get<Disciplina[]>(ENDPOINT);
  return response.data;
};

export const createDisciplina = async (
  disciplinaData: CreateDisciplinaDTO
): Promise<Disciplina> => {
  const response = await api.post<Disciplina>(ENDPOINT, disciplinaData);
  return response.data;
};

export const updateDisciplina = async (
  id: number,
  disciplinaData: UpdateDisciplinaDTO
): Promise<Disciplina> => {
  const response = await api.put<Disciplina>(
    `${ENDPOINT}/${id}`,
    disciplinaData
  );
  return response.data;
};

export const deleteDisciplina = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};
