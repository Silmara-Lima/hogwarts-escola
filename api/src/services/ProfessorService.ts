// src/services/ProfessorService.ts

import { prisma } from "../database/prisma";
import { Professor } from "@prisma/client";

// --- Definição de Tipos ---

// Omitindo campos de controle e campos que não devem ser alterados diretamente.
type ProfessorUpdateData = Partial<
  Omit<Professor, "id" | "createdAt" | "updatedAt" | "cpf" | "email">
>;

// --- Funções CRUD e de Consulta ---

/**
 * Retorna todos os professores cadastrados.
 * @returns Lista de professores.
 */
export const getAll = async (): Promise<Professor[]> => {
  return prisma.professor.findMany({
    // Não incluir dados sensíveis como 'senha' em uma busca geral
    select: {
      id: true,
      nome: true,
      email: true,
      turmasDisciplinas: {
        include: {
          disciplina: true,
          turma: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Retorna um professor específico pelo ID, incluindo as Turmas e Disciplinas que ele ministra.
 * @param id ID do professor.
 * @returns O professor ou null.
 */
export const getById = async (id: number): Promise<Professor | null> => {
  return prisma.professor.findUnique({
    where: { id },
    include: {
      // Inclui a tabela intermediária que conecta Professor a Disciplina e Turma
      turmasDisciplinas: {
        include: {
          disciplina: true, // Detalhes da Disciplina (Ex: Poções)
          turma: true, // Detalhes da Turma (Ex: 5º Ano - Manhã)
        },
      },
    },
  });
};

/**
 * Retorna a lista de alunos de um professor, baseada nas turmas e disciplinas que ele ministra.
 * Esta é uma consulta complexa.
 * @param professorId ID do professor.
 * @returns Lista de Alunos.
 */
export const getAlunosByProfessor = async (professorId: number) => {
  // 1. Encontrar todas as TurmaDisciplina que o professor ministra
  const turmasDisciplinas = await prisma.turmaDisciplina.findMany({
    where: { professorId },
    select: {
      turmaId: true,
      disciplinaId: true,
    },
  });

  if (turmasDisciplinas.length === 0) {
    return [];
  }

  // 2. Extrair os IDs de Turma e Disciplina únicos
  const turmaIds = turmasDisciplinas.map((td) => td.turmaId);
  const disciplinaIds = turmasDisciplinas.map((td) => td.disciplinaId);

  // 3. Buscar alunos matriculados nessas turmas e disciplinas
  const alunos = await prisma.aluno.findMany({
    where: {
      turmaId: { in: turmaIds }, // Aluno pertence a uma das turmas do professor
    },
    include: {
      casa: true,
      matriculas: {
        where: { disciplinaId: { in: disciplinaIds } }, // Aluno matriculado em alguma disciplina ministrada pelo professor
        include: { disciplina: true },
      },
    },
  });

  // Filtra alunos para garantir que eles estão realmente matriculados na disciplina
  // que o professor ministra naquela turma (dependendo da regra de negócio exata).
  // Para simplificar, retornamos a lista de alunos que pertencem à turma dele
  // e têm alguma matrícula nas disciplinas dele.
  return alunos.filter((aluno) => aluno.matriculas.length > 0);
};

/**
 * Atualiza os dados de um professor (Ex: nome).
 * @param id ID do professor.
 * @param data Dados para atualização.
 * @returns O professor atualizado.
 */
export const update = async (
  id: number,
  data: ProfessorUpdateData
): Promise<Professor> => {
  return prisma.professor.update({
    where: { id },
    data,
  });
};

/**
 * Remove um professor pelo ID.
 * Nota: Isso pode falhar se houver TurmaDisciplina ou outras relações vinculadas.
 * @param id ID do professor.
 * @returns O professor removido.
 */
export const remove = async (id: number): Promise<Professor> => {
  return prisma.professor.delete({ where: { id } });
};

export function getAlunos(professorId: number) {
  throw new Error("Function not implemented.");
}
