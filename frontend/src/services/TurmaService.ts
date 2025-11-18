import { api } from "../apiCore/apiCore";
// É bom que estes tipos referenciem os outros serviços, mas para simplificar, usaremos apenas IDs.

// --- Tipos de Turma (Classe) ---
export interface Turma {
  id: number;
  nomeTurma: string; // Ex: "7º Ano A" ou "Turma de Cálculo I"
  anoLetivo: number;
  disciplinaId: number; // ID da Disciplina que está sendo ensinada nesta turma
  professorResponsavelId: number; // ID do Professor que ministra a disciplina
  // Note: A lista de alunos matriculados seria carregada em outro endpoint (ex: GET /turmas/:id/alunos)
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
// ------------------------------------------

const ENDPOINT = "/turmas";

/**
 * Busca todas as turmas cadastradas.
 * @returns Promise<Turma[]> Lista de turmas.
 */
export const getTurmas = async (): Promise<Turma[]> => {
  // GET http://localhost:3000/api/turmas
  const response = await api.get<Turma[]>(ENDPOINT);
  return response.data;
};

/**
 * Cria uma nova turma.
 * @param turmaData Dados para criação da turma.
 * @returns Promise<Turma> A turma criada, incluindo seu novo ID.
 */
export const createTurma = async (
  turmaData: CreateTurmaDTO
): Promise<Turma> => {
  // POST http://localhost:3000/api/turmas
  const response = await api.post<Turma>(ENDPOINT, turmaData);
  return response.data;
};

/**
 * Atualiza uma turma existente.
 * @param id ID da turma a ser atualizada.
 * @param turmaData Dados parciais para atualização.
 * @returns Promise<Turma> A turma atualizada.
 */
export const updateTurma = async (
  id: number,
  turmaData: UpdateTurmaDTO
): Promise<Turma> => {
  // PUT http://localhost:3000/api/turmas/:id
  const response = await api.put<Turma>(`${ENDPOINT}/${id}`, turmaData);
  return response.data;
};

/**
 * Deleta uma turma pelo ID.
 * @param id ID da turma a ser deletada.
 * @returns Promise<void>
 */
export const deleteTurma = async (id: number): Promise<void> => {
  // DELETE http://localhost:3000/api/turmas/:id
  await api.delete(`${ENDPOINT}/${id}`);
};
