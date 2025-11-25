// =========================================================================
// ProfessorController
// =========================================================================

import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import * as professorService from "../services/ProfessorService";
import { ZodError } from "zod";

// =========================================================================
// TIPAGEM DE REQUISIÇÃO (Autenticada)
// =========================================================================
export interface UserTokenData {
  id: number;
  email?: string;
  role: string;
}
// =========================================================================
// createProfessor (POST /professores)
// =========================================================================
export const createProfessor = async (req: Request, res: Response) => {
  try {
    const novo = await professorService.createProfessor(req.body);
    return res.status(201).json(novo);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação. Verifique os campos enviados.",
        errors: error.issues,
      });
    }
    if (error.code === "P2002") {
      return res.status(409).json({
        message: `Campo único já existe: ${error.meta?.target}`,
      });
    }
    return res
      .status(500)
      .json({ message: error.message || "Erro interno ao criar professor." });
  }
};

// =========================================================================
// getAllProfessores (GET /professores)
// =========================================================================
export const getAllProfessores = async (_: Request, res: Response) => {
  try {
    const professores = await professorService.getProfessores();
    return res.json(professores);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Erro interno ao listar professores.",
    });
  }
};

// =========================================================================
// getProfessorById (GET /professores/:id)
// =========================================================================
export const getProfessorById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const prof = await professorService.getById(id);

    if (!prof) {
      return res
        .status(404)
        .json({ message: "Professor(a) não encontrado(a)." });
    }

    const { senha, ...rest } = prof;
    return res.json(rest);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Erro interno ao buscar professor." });
  }
};

// =========================================================================
// updateProfessor (PATCH /professores/:id)
// =========================================================================
export const updateProfessor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await professorService.updateProfessor(id, req.body);
    return res.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Professor(a) não encontrado(a)." });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Campo único já existe: ${error.meta?.target}` });
    }
    return res.status(500).json({
      message: error.message || "Erro interno ao atualizar professor.",
    });
  }
};

// =========================================================================
// deleteProfessor (DELETE /professores/:id)
// =========================================================================
export const deleteProfessor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await professorService.deleteProfessor(id);
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Professor(a) não encontrado(a)." });
    }
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: o professor possui vínculos. Configure o CASCADE DELETE no Prisma.",
      });
    }
    return res
      .status(500)
      .json({ message: error.message || "Erro interno ao deletar professor." });
  }
};

// =========================================================================
// vincularDisciplinasDoProfessor (POST /professores/:id/vinculos)
// =========================================================================
export const vincularDisciplinasDoProfessor = async (
  req: Request,
  res: Response
) => {
  try {
    const professorId = Number(req.params.id);
    const { vinculos } = req.body;

    if (!Array.isArray(vinculos)) {
      return res.status(400).json({
        message: "O corpo da requisição deve conter um array de 'vinculos'.",
      });
    }

    const hasInvalidVinculos = vinculos.some(
      (v: any) =>
        typeof v.disciplinaId !== "number" || typeof v.turmaId !== "number"
    );

    if (hasInvalidVinculos) {
      return res.status(400).json({
        message:
          "Cada objeto de vínculo deve ter 'disciplinaId' e 'turmaId' como números.",
      });
    }

    const updatedProfessor = await professorService.vincularDisciplinas(
      professorId,
      vinculos
    );

    return res.json(updatedProfessor);
  } catch (error: any) {
    if (
      error.code === "P2025" ||
      error.message.includes("Professor não encontrado")
    ) {
      return res.status(404).json({
        message: "Professor(a) não encontrado(a) para vincular disciplinas.",
      });
    }
    return res.status(500).json({
      message: error.message || "Erro interno ao vincular disciplinas.",
    });
  }
};

// =========================================================================
// getProfessorDetails (GET /professores/:id/details)
// =========================================================================
export const getProfessorDetails = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const details = await professorService.getProfessorDetails(id);

    if (!details) {
      return res.status(404).json({
        message: "Professor(a) não encontrado(a) ou sem dados detalhados.",
      });
    }

    return res.json(details);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Erro interno ao buscar detalhes do professor.",
    });
  }
};

// =========================================================================
// getAlunosByProfessor (GET /professores/:id/alunos)
// =========================================================================
export const getAlunosByProfessor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const alunos = await professorService.getProfessorAlunos(id);

    return res.status(200).json(alunos);
  } catch (error: any) {
    if (error.message.includes("Professor não encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message || "Erro interno ao buscar alunos do professor.",
    });
  }
};

// =========================================================================
// getMeDetails (GET /professor/me)
// =========================================================================
export const getMeDetails = async (req: Request, res: Response) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return res.status(401).json({
      message:
        "Token inválido ou sem email de usuário (Autenticação Requerida).",
    });
  }

  try {
    const details = await professorService.getMeDetails(userEmail);
    return res.json(details);
  } catch (error: any) {
    if (error.message.includes("não encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({
      message: error.message || "Erro interno ao buscar detalhes do professor.",
    });
  }
};
