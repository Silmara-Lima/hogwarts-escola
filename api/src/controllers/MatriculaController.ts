// src/controllers/MatriculaController.ts

import { Request, Response } from "express";
import * as matriculaService from "../services/MatriculaService";
import { ZodError } from "zod"; // Para validação de dados de entrada

// Assumindo que você criou um Zod Schema para MatriculaCreateData (alunoId, disciplinaId)

/**
 * Realiza a matrícula de um aluno em uma disciplina.
 * Esta operação deve ser restrita ao Secretário.
 */
export const matricularAluno = async (req: Request, res: Response) => {
  try {
    // [OPCIONAL] Validação Zod aqui:
    // const validatedData = MatriculaCreateSchema.parse(req.body);

    const matricula = await matriculaService.matricularAluno(req.body);
    return res.status(201).json(matricula);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError<any>;
      return res.status(400).json({
        message: "Erro de validação de dados.",
        errors: zodError.issues,
      });
    }
    // Trata a exceção lançada no Service se a matrícula já existir
    if (error.message.includes("já está matriculado")) {
      return res.status(409).json({ message: error.message });
    }
    // P2003: Falha de chave estrangeira (Aluno ou Disciplina não existe)
    if (error.code === "P2003") {
      return res.status(404).json({
        message: "Falha: O Aluno ou a Disciplina especificada não existe.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna todas as matrículas ativas no sistema (Relatório).
 * Restrita ao Secretário.
 */
export const getAllMatriculas = async (req: Request, res: Response) => {
  try {
    const matriculas = await matriculaService.getAllMatriculas();
    return res.json(matriculas);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna as disciplinas em que um aluno específico está matriculado.
 * Rota útil para o próprio Aluno logado (usando seu próprio ID).
 */
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

/**
 * Remove a matrícula de um aluno em uma disciplina (Desmatricular).
 * Restrita ao Secretário.
 */
export const desmatricularAluno = async (req: Request, res: Response) => {
  try {
    const alunoId = Number(req.params.alunoId);
    const disciplinaId = Number(req.params.disciplinaId);

    await matriculaService.desmatricularAluno(alunoId, disciplinaId);
    return res.status(204).send(); // Sucesso sem conteúdo
  } catch (error: any) {
    // P2025: Registro não encontrado para deleção (A matrícula não existe)
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Matrícula não encontrada." });
    }
    return res.status(500).json({ message: error.message });
  }
};
