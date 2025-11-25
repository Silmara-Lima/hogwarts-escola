import api from "./api";
import type { Professor, ProfessorCreateData } from "../types/Professor";
import type { Aluno, CreateAlunoData } from "../types/Alunos";

// ======================================================
// TIPOS DE SECRETÁRIO/ADMINISTRATIVO
// ======================================================
export interface Secretario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  setor: string;
}

export interface CreateSecretarioDTO {
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  senha: string;
}

export interface UpdateSecretarioDTO {
  nome?: string;
  email?: string;
  cargo?: string;
  setor?: string;
  senha?: string;
}

export interface CasaStats {
  nome: string;
  alunos: number;
}

export interface DashboardStats {
  totalAlunos: number;
  totalProfessores: number;
  turmasAtivas: number;
  mediaNotas: number;
  casas: CasaStats[];
}

// ======================================================
// ENDPOINTS
// ======================================================
const ENDPOINT_CRUD = "/secretarios";
const ENDPOINT_ADM = "/secretario";

// ======================================================
// AÇÕES ADMINISTRATIVAS
// ======================================================
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>(`${ENDPOINT_ADM}/dashboard`);
  return response.data;
};

export const createAlunoBySecretario = async (
  data: CreateAlunoData
): Promise<Aluno> => {
  const response = await api.post<Aluno>(`${ENDPOINT_ADM}/alunos`, data);
  return response.data;
};

export const createProfessorBySecretario = async (
  data: ProfessorCreateData
): Promise<Professor> => {
  const response = await api.post<Professor>(
    `${ENDPOINT_ADM}/professores`,
    data
  );
  return response.data;
};

// ======================================================
// CRUD SECRETÁRIO
// ======================================================
export const getSecretarios = async (): Promise<Secretario[]> => {
  const response = await api.get<Secretario[]>(ENDPOINT_CRUD);
  return response.data;
};

export const createSecretario = async (
  secretarioData: CreateSecretarioDTO
): Promise<Secretario> => {
  const response = await api.post<Secretario>(ENDPOINT_ADM, secretarioData);
  return response.data;
};

export const updateSecretario = async (
  id: number,
  secretarioData: UpdateSecretarioDTO
): Promise<Secretario> => {
  const response = await api.put<Secretario>(
    `${ENDPOINT_CRUD}/${id}`,
    secretarioData
  );
  return response.data;
};

export const deleteSecretario = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT_CRUD}/${id}`);
};
