// ======================================================
// Professor Service
// ======================================================
import api from "./api";
import type {
  PublicProfessor,
  ProfessorCreateData,
  ProfessorUpdateData,
  ProfessorDetalhe,
  AlunoDetalheProfessor,
  DisciplinaTurmaVinculo,
} from "../types/Professor";

const BASE_URL = "/professores";

// ======================================================
// LISTAR TODOS
// ======================================================
export async function getProfessores(): Promise<PublicProfessor[]> {
  const res = await api.get(BASE_URL);
  return res.data;
}

// ======================================================
// CREATE
// ======================================================
export async function createProfessor(
  data: ProfessorCreateData
): Promise<PublicProfessor> {
  const res = await api.post(BASE_URL, data);
  return res.data;
}

// ======================================================
// GET BY ID
// ======================================================
export async function getProfessorById(id: number): Promise<PublicProfessor> {
  const res = await api.get(`${BASE_URL}/${id}`);
  return res.data;
}

// ======================================================
// UPDATE
// ======================================================
export async function updateProfessor(
  id: number,
  data: ProfessorUpdateData
): Promise<PublicProfessor> {
  const res = await api.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

// ======================================================
// DELETE
// ======================================================
export async function deleteProfessor(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}

// ======================================================
// DETALHES COMPLETOS
// ======================================================
export async function getProfessorDetails(
  id: number
): Promise<ProfessorDetalhe> {
  const res = await api.get(`${BASE_URL}/${id}/details`);
  return res.data;
}

// ======================================================
// ALUNOS LECIONADOS
// ======================================================
export async function getProfessorAlunos(
  id: number
): Promise<AlunoDetalheProfessor[]> {
  const res = await api.get(`${BASE_URL}/${id}/alunos`);
  return res.data;
}

// ======================================================
// VINCULAR DISCIPLINAS + TURMAS
// ======================================================
export async function vincularDisciplinas(
  professorId: number,
  vinculos: DisciplinaTurmaVinculo[]
): Promise<ProfessorDetalhe> {
  const res = await api.patch(`${BASE_URL}/${professorId}/disciplinas`, {
    vinculos,
  });
  return res.data;
}

// ======================================================
// GET DO PROFESSOR LOGADO
// ======================================================
export async function getMeDetails(): Promise<ProfessorDetalhe> {
  const res = await api.get(`${BASE_URL}/me/details`);
  return res.data;
}
