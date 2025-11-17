// src/services/TurmaService.ts

import { prisma } from "../database/prisma";
import { Turma } from "@prisma/client";

// --- Definição de Tipos ---

// Campos obrigatórios para criação de uma Turma
type TurmaCreateData = Omit<Turma, "id" | "createdAt" | "updatedAt">;

// --- Funções CRUD e de Consulta ---

/**
 * Cria uma nova Turma.
 * @param data Dados da Turma (Ex: nome, ano, turno).
 * @returns A Turma criada.
 */
export const create = async (data: TurmaCreateData): Promise<Turma> => {
  return prisma.turma.create({
    data,
  });
};

/**
 * Retorna todas as Turmas, incluindo o Professor e Disciplinas ministradas e a contagem de alunos.
 * @returns Lista de Turmas.
 */
export const getAll = async (): Promise<Turma[]> => {
  return prisma.turma.findMany({
    include: {
      alunos: { select: { id: true, nome: true } },
      // CORRIGIDO: Usando 'disciplinas' (nome gerado pela relação TurmaDisciplina)
      disciplinas: {
        include: {
          professor: { select: { id: true, nome: true } },
          disciplina: { select: { id: true, nome: true } },
        },
      },
      _count: { select: { alunos: true } },
    },
  });
};

/**
 * Retorna uma Turma pelo ID, incluindo todos os alunos e professores/disciplinas.
 * @param id ID da Turma.
 * @returns A Turma ou null.
 */
export const getById = async (id: number): Promise<Turma | null> => {
  return prisma.turma.findUnique({
    where: { id },
    include: {
      alunos: true,
      // CORRIGIDO: Usando 'disciplinas' (nome gerado pela relação TurmaDisciplina)
      disciplinas: {
        include: { professor: true, disciplina: true },
      },
    },
  });
};

/**
 * Atualiza os dados de uma Turma.
 * @param id ID da Turma.
 * @param data Dados para atualização.
 * @returns A Turma atualizada.
 */
export const update = async (
  id: number,
  data: Partial<TurmaCreateData>
): Promise<Turma> => {
  return prisma.turma.update({
    where: { id },
    data,
  });
};

/**
 * Remove uma Turma pelo ID.
 * Nota: Isso falhará se houver alunos ou professores/disciplinas vinculados.
 * @param id ID da Turma.
 * @returns A Turma removida.
 */
export const remove = async (id: number): Promise<Turma> => {
  return prisma.turma.delete({ where: { id } });
};
