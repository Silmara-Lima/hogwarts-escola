import { prisma } from "../database/prisma";
import { Disciplina } from "@prisma/client";

// =========================================================================
// Tipos
// =========================================================================

type DisciplinaCreateData = Omit<Disciplina, "id" | "createdAt" | "updatedAt">;

// =========================================================================
// Funções CRUD
// =========================================================================

export const create = async (
  data: DisciplinaCreateData
): Promise<Disciplina> => {
  return prisma.disciplina.create({ data });
};

export const getAll = async (): Promise<Disciplina[]> => {
  return prisma.disciplina.findMany({
    include: {
      matriculas: { select: { aluno: { select: { id: true, nome: true } } } },
      turmasDisciplinas: {
        select: { professor: { select: { id: true, nome: true } } },
      },
      _count: { select: { matriculas: true } },
    },
  });
};

export const getById = async (id: number): Promise<Disciplina | null> => {
  return prisma.disciplina.findUnique({
    where: { id },
    include: {
      matriculas: { include: { aluno: true } },
      turmasDisciplinas: { include: { professor: true, turma: true } },
    },
  });
};

export const update = async (
  id: number,
  data: Partial<DisciplinaCreateData>
): Promise<Disciplina> => {
  return prisma.disciplina.update({ where: { id }, data });
};

export const remove = async (id: number): Promise<Disciplina> => {
  return prisma.disciplina.delete({ where: { id } });
};
