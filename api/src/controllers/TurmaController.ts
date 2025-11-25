// =========================================================================
// TurmaController
// =========================================================================

import { Request, Response } from "express";
import * as turmaService from "../services/TurmaService";
import { ZodError } from "zod";

// =========================================================================
// createTurma (POST /api/secretario/turmas)
// =========================================================================
export const createTurma = async (req: Request, res: Response) => {
  try {
    const turma = await turmaService.create(req.body);
    return res.status(201).json(turma);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: error.issues,
      });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Turma já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getAllTurmas (GET /api/secretario/turmas)
// =========================================================================
export const getAllTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await turmaService.getAll();
    return res.json(turmas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getTurmaById (GET /api/secretario/turmas/:id)
// =========================================================================
export const getTurmaById = async (req: Request, res: Response) => {
  try {
    const turma = await turmaService.getById(Number(req.params.id));
    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada." });
    }
    return res.json(turma);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// updateTurma (PATCH /api/secretario/turmas/:id)
// =========================================================================
export const updateTurma = async (req: Request, res: Response) => {
  try {
    const turma = await turmaService.update(Number(req.params.id), req.body);
    return res.json(turma);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Turma não encontrada." });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Turma já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// deleteTurma (DELETE /api/secretario/turmas/:id)
// =========================================================================
export const deleteTurma = async (req: Request, res: Response) => {
  try {
    await turmaService.remove(Number(req.params.id));
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Turma não encontrada." });
    }
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: A turma ainda possui alunos ou associações ativas.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};
