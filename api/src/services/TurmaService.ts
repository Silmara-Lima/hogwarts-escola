import { prisma } from "../database/prisma";
import { Turma } from "@prisma/client";

// =========================================================================
// TIPOS
// =========================================================================

type TurmaCreateData = Omit<Turma, "id" | "createdAt" | "updatedAt">;

// =========================================================================
// FUNÇÕES CRUD E DE CONSULTA
// =========================================================================

export const create = async (data: TurmaCreateData): Promise<Turma> => {
  return prisma.turma.create({
    data,
  });
};

export const getAll = async (): Promise<Turma[]> => {
  return prisma.turma.findMany({
    include: {
      alunos: { select: { id: true, nome: true } },
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

export const getById = async (id: number): Promise<Turma | null> => {
  return prisma.turma.findUnique({
    where: { id },
    include: {
      alunos: true,
      disciplinas: {
        include: { professor: true, disciplina: true },
      },
    },
  });
};

export const update = async (
  id: number,
  data: Partial<TurmaCreateData>
): Promise<Turma> => {
  return prisma.turma.update({
    where: { id },
    data,
  });
};

export const remove = async (id: number): Promise<Turma> => {
  return prisma.turma.delete({ where: { id } });
};
