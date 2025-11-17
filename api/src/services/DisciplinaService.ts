// src/services/DisciplinaService.ts

import { prisma } from "../database/prisma";
import { Disciplina } from "@prisma/client";

// --- Definição de Tipos ---

// Campos obrigatórios para criação de uma Disciplina
type DisciplinaCreateData = Omit<Disciplina, "id" | "createdAt" | "updatedAt">;

// --- Funções CRUD ---

/**
 * Cria uma nova Disciplina.
 * @param data Dados da Disciplina (Ex: nome).
 * @returns A Disciplina criada.
 */
export const create = async (
  data: DisciplinaCreateData
): Promise<Disciplina> => {
  return prisma.disciplina.create({
    data,
  });
};

/**
 * Retorna todas as Disciplinas, incluindo a contagem de matrículas ativas.
 * @returns Lista de Disciplinas.
 */
export const getAll = async (): Promise<Disciplina[]> => {
  return prisma.disciplina.findMany({
    // Inclui a contagem de matrículas (alunos matriculados)
    include: {
      matriculas: {
        select: { aluno: { select: { id: true, nome: true } } },
      },
      // Inclui a contagem de professores alocados à matéria em TurmasDisciplinas
      turmasDisciplinas: {
        select: { professor: { select: { id: true, nome: true } } },
      },
      _count: { select: { matriculas: true } },
    },
  });
};

/**
 * Retorna uma Disciplina pelo ID.
 * @param id ID da Disciplina.
 * @returns A Disciplina ou null.
 */
export const getById = async (id: number): Promise<Disciplina | null> => {
  return prisma.disciplina.findUnique({
    where: { id },
    include: {
      matriculas: { include: { aluno: true } }, // Alunos matriculados
      turmasDisciplinas: { include: { professor: true, turma: true } }, // Professores e Turmas
    },
  });
};

/**
 * Atualiza os dados de uma Disciplina.
 * @param id ID da Disciplina.
 * @param data Dados para atualização.
 * @returns A Disciplina atualizada.
 */
export const update = async (
  id: number,
  data: Partial<DisciplinaCreateData>
): Promise<Disciplina> => {
  return prisma.disciplina.update({
    where: { id },
    data,
  });
};

/**
 * Remove uma Disciplina pelo ID.
 * Nota: Isso falhará se houver matrículas ou alocações de professores ativas.
 * @param id ID da Disciplina.
 * @returns A Disciplina removida.
 */
export const remove = async (id: number): Promise<Disciplina> => {
  return prisma.disciplina.delete({ where: { id } });
};
