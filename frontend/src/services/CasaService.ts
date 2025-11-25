import api from "./api";

// =========================================================
// 1. Tipos e DTOs de Casa
// =========================================================
export interface Casa {
  id: number;
  nome: string;
  corPrincipal: string;
  mascote: string;
}

export interface CreateCasaDTO {
  nome: string;
  corPrincipal: string;
  mascote: string;
}

export interface UpdateCasaDTO {
  nome?: string;
  corPrincipal?: string;
  mascote?: string;
}

// =========================================================
// 2. Endpoint base
// =========================================================
const ENDPOINT = "/casas";

// =========================================================
// 3. Funções CRUD
// =========================================================

export const getCasas = async (): Promise<Casa[]> => {
  const response = await api.get<Casa[]>(ENDPOINT);
  return response.data;
};

export const createCasa = async (casaData: CreateCasaDTO): Promise<Casa> => {
  const response = await api.post<Casa>(ENDPOINT, casaData);
  return response.data;
};

export const updateCasa = async (
  id: number,
  casaData: UpdateCasaDTO
): Promise<Casa> => {
  const response = await api.put<Casa>(`${ENDPOINT}/${id}`, casaData);
  return response.data;
};

export const deleteCasa = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};
