// =========================================================================
// MatriculaController
// =========================================================================

import { Request, Response } from "express";
import * as matriculaService from "../services/MatriculaService";
import { ZodError } from "zod";

// =========================================================================
// matricularAluno (POST /matriculas)
// =========================================================================
export const matricularAluno = async (req: Request, res: Response) => {
  try {
    const matricula = await matriculaService.matricularAluno(req.body);
    return res.status(201).json(matricula);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: error.issues,
      });
    }
    if (error.message.includes("já está matriculado")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.code === "P2003") {
      return res.status(404).json({
        message: "Falha: O Aluno ou a Disciplina especificada não existe.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getAllMatriculas (GET /matriculas)
// =========================================================================
export const getAllMatriculas = async (req: Request, res: Response) => {
  try {
    const matriculas = await matriculaService.getAllMatriculas();
    return res.json(matriculas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// getDisciplinasByAlunoId (GET /matriculas/aluno/:id)
// =========================================================================
export const getDisciplinasByAlunoId = async (req: Request, res: Response) => {
  try {
    const alunoId = Number(req.params.id);
    const matriculas = await matriculaService.getDisciplinasByAlunoId(alunoId);

    if (!matriculas || matriculas.length === 0) {
      return res
        .status(404)
        .json({ message: "Aluno não encontrado ou sem matrículas ativas." });
    }

    return res.json(matriculas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// =========================================================================
// desmatricularAluno (DELETE /matriculas/:alunoId/:disciplinaId)
// =========================================================================
export const desmatricularAluno = async (req: Request, res: Response) => {
  try {
    const alunoId = Number(req.params.alunoId);
    const disciplinaId = Number(req.params.disciplinaId);

    await matriculaService.desmatricularAluno(alunoId, disciplinaId);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Matrícula não encontrada." });
    }
    return res.status(500).json({ message: error.message });
  }
};
