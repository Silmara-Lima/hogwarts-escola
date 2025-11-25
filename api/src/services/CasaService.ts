import { prisma } from "../database/prisma";
import { Casa } from "@prisma/client";

// =========================================================================
// Tipos
// =========================================================================

type CasaCreateData = Omit<Casa, "id" | "createdAt" | "updatedAt">;

// =========================================================================
// Funções CRUD e de Consulta
// =========================================================================

export const create = async (data: CasaCreateData): Promise<Casa> => {
  return prisma.casa.create({ data });
};

export const getAll = async (): Promise<Casa[]> => {
  return prisma.casa.findMany({
    include: {
      alunos: { select: { id: true, nome: true } },
      _count: { select: { alunos: true } },
    },
  });
};

export const getById = async (id: number): Promise<Casa | null> => {
  return prisma.casa.findUnique({
    where: { id },
    include: { alunos: true },
  });
};

export const update = async (
  id: number,
  data: Partial<CasaCreateData>
): Promise<Casa> => {
  return prisma.casa.update({ where: { id }, data });
};

export const remove = async (id: number): Promise<Casa> => {
  return prisma.casa.delete({ where: { id } });
};
