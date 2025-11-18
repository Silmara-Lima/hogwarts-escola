import { api } from "../apiCore/apiCore";

// --- Tipos de Casa (Afiliação) ---
export interface Casa {
  id: number;
  nome: string; // Ex: "Grifinória", "Sonserina", etc.
  corPrincipal: string; // Ex: "#FF0000" para vermelho
  mascote: string; // Ex: "Leão"
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
// ------------------------------------------

const ENDPOINT = "/casas";

/**
 * Busca todas as casas cadastradas.
 * @returns Promise<Casa[]> Lista de casas.
 */
export const getCasas = async (): Promise<Casa[]> => {
  // GET http://localhost:3000/api/casas
  const response = await api.get<Casa[]>(ENDPOINT);
  return response.data;
};

/**
 * Cria uma nova casa.
 * @param casaData Dados para criação da casa.
 * @returns Promise<Casa> A casa criada, incluindo seu novo ID.
 */
export const createCasa = async (casaData: CreateCasaDTO): Promise<Casa> => {
  // POST http://localhost:3000/api/casas
  const response = await api.post<Casa>(ENDPOINT, casaData);
  return response.data;
};

/**
 * Atualiza uma casa existente.
 * @param id ID da casa a ser atualizada.
 * @param casaData Dados parciais para atualização.
 * @returns Promise<Casa> A casa atualizada.
 */
export const updateCasa = async (
  id: number,
  casaData: UpdateCasaDTO
): Promise<Casa> => {
  // PUT http://localhost:3000/api/casas/:id
  const response = await api.put<Casa>(`${ENDPOINT}/${id}`, casaData);
  return response.data;
};

/**
 * Deleta uma casa pelo ID.
 * @param id ID da casa a ser deletada.
 * @returns Promise<void>
 */
export const deleteCasa = async (id: number): Promise<void> => {
  // DELETE http://localhost:3000/api/casas/:id
  await api.delete(`${ENDPOINT}/${id}`);
};
