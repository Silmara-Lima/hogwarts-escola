// =========================================================================
// DisciplinaController
// =========================================================================

import { Request, Response } from "express";
import * as disciplinaService from "../services/DisciplinaService";
import { ZodError } from "zod";

// =========================================================================
// createDisciplina (POST /disciplinas)
// =========================================================================
export const createDisciplina = async (req: Request, res: Response) => {
  try {
    const disciplina = await disciplinaService.create(req.body);
    return res.status(201).json(disciplina);
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
        .json({ message: `Disciplina já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getAllDisciplinas (GET /disciplinas)
// =========================================================================
export const getAllDisciplinas = async (req: Request, res: Response) => {
  try {
    const disciplinas = await disciplinaService.getAll();
    return res.json(disciplinas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getDisciplinaById (GET /disciplinas/:id)
// =========================================================================
export const getDisciplinaById = async (req: Request, res: Response) => {
  try {
    const disciplina = await disciplinaService.getById(Number(req.params.id));
    if (!disciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }
    return res.json(disciplina);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// updateDisciplina (PATCH /disciplinas/:id)
// =========================================================================
export const updateDisciplina = async (req: Request, res: Response) => {
  try {
    const disciplina = await disciplinaService.update(
      Number(req.params.id),
      req.body
    );
    return res.json(disciplina);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `Nome da Disciplina já existe: ${error.meta.target}`,
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// deleteDisciplina (DELETE /disciplinas/:id)
// =========================================================================
export const deleteDisciplina = async (req: Request, res: Response) => {
  try {
    await disciplinaService.remove(Number(req.params.id));
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: A disciplina ainda possui alunos matriculados ou professores alocados.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};
