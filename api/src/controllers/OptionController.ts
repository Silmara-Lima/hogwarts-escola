// =========================================================================
// OptionController
// =========================================================================

import { Request, Response } from "express";
import { prisma } from "../database/prisma";

// =========================================================================
// getOptions (GET /options)
// =========================================================================
export const getOptions = async (req: Request, res: Response) => {
  try {
    const turmas = await prisma.turma.findMany({
      select: { id: true, serie: true, turno: true },
    });

    const disciplinas = await prisma.disciplina.findMany({
      select: { id: true, nome: true },
    });

    const casas = await prisma.casa.findMany({
      select: { id: true, nome: true },
    });

    return res.json({ turmas, disciplinas, casas });
  } catch (error) {
    console.error("Erro ao buscar opções:", error);
    return res.status(500).json({ message: "Falha ao carregar opções." });
  }
};
