// src/services/CasaService.ts

import { prisma } from "../database/prisma";
import { Casa } from "@prisma/client";

// --- Definição de Tipos ---

// Campos obrigatórios para criação de uma Casa
type CasaCreateData = Omit<Casa, "id" | "createdAt" | "updatedAt">;

// --- Funções CRUD e de Consulta ---

/**
 * Cria uma nova Casa.
 * @param data Dados da Casa (Ex: nome, cor).
 * @returns A Casa criada.
 */
export const create = async (data: CasaCreateData): Promise<Casa> => {
  return prisma.casa.create({
    data,
  });
};

/**
 * Retorna todas as Casas, incluindo a contagem de alunos.
 * @returns Lista de Casas.
 */
export const getAll = async (): Promise<Casa[]> => {
  return prisma.casa.findMany({
    // Inclui a contagem de alunos para exibir estatísticas
    include: {
      alunos: { select: { id: true, nome: true } },
      _count: { select: { alunos: true } },
    },
  });
};

/**
 * Retorna uma Casa pelo ID, incluindo todos os alunos que pertencem a ela.
 * @param id ID da Casa.
 * @returns A Casa ou null.
 */
export const getById = async (id: number): Promise<Casa | null> => {
  return prisma.casa.findUnique({
    where: { id },
    include: { alunos: true }, // Inclui todos os alunos da casa
  });
};

/**
 * Atualiza os dados de uma Casa.
 * @param id ID da Casa.
 * @param data Dados para atualização.
 * @returns A Casa atualizada.
 */
export const update = async (
  id: number,
  data: Partial<CasaCreateData>
): Promise<Casa> => {
  return prisma.casa.update({
    where: { id },
    data,
  });
};

/**
 * Remove uma Casa pelo ID.
 * Nota: Isso falhará se houver alunos vinculados a esta Casa.
 * @param id ID da Casa.
 * @returns A Casa removida.
 */
export const remove = async (id: number): Promise<Casa> => {
  return prisma.casa.delete({ where: { id } });
};
