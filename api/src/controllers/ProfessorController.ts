// src/controllers/ProfessorController.ts

import { Request, Response } from "express";
import * as professorService from "../services/ProfessorService";

/**
 * Retorna todos os professores cadastrados no sistema.
 */
export const getAllProfessores = async (req: Request, res: Response) => {
  try {
    // O Service deve garantir que a senha seja omitida do retorno.
    const professores = await professorService.getAll();
    return res.json(professores);
  } catch (error: any) {
    // Erro geral de servidor/conexão
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna um professor específico por ID.
 */
export const getProfessorById = async (req: Request, res: Response) => {
  try {
    const professor = await professorService.getById(Number(req.params.id));

    if (!professor) {
      return res
        .status(404)
        .json({ message: "Professor(a) de Hogwarts não encontrado(a)." });
    }

    // Retorno: remove a senha antes de enviar (se ela não foi omitida no Service)
    const { senha, ...professorResponse } = professor;
    return res.json(professorResponse);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza os dados de um professor.
 */
export const updateProfessor = async (req: Request, res: Response) => {
  try {
    const professor = await professorService.update(
      Number(req.params.id),
      req.body
    );

    // Retorno: remove a senha antes de enviar (se ela não foi omitida no Service)
    const { senha, ...professorResponse } = professor;
    return res.json(professorResponse);
  } catch (error: any) {
    // P2025: Registro não encontrado para atualização
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Professor(a) não encontrado(a)." });
    }
    // P2002: Campo único já existe (e.g., email ou CPF)
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Campo único já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Remove um professor.
 */
export const deleteProfessor = async (req: Request, res: Response) => {
  try {
    await professorService.remove(Number(req.params.id));
    return res.status(204).send(); // HTTP 204: Sucesso, sem conteúdo
  } catch (error: any) {
    // P2025: Registro não encontrado para deleção
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ message: "Professor(a) não encontrado(a)." });
    }
    // P2003: Falha na restrição de chave estrangeira (professor ainda tem turmas/disciplinas)
    if (error.code === "P2003") {
      return res.status(409).json({
        message:
          "Não é possível remover: O professor ainda possui vínculos com turmas ou disciplinas.",
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------------------
// OPERAÇÃO ESPECÍFICA DE NEGÓCIO
// -------------------------------------------------------------

/**
 * Retorna todos os alunos que estão matriculados nas disciplinas lecionadas por este professor.
 * (Consulta complexa de associação: Professor -> TurmaDisciplina -> Matricula -> Aluno)
 */
export const getAlunosByProfessor = async (req: Request, res: Response) => {
  try {
    const professorId = Number(req.params.id);

    const alunos = (await professorService.getAlunos(professorId)) as unknown;

    // Se a lista de alunos for vazia, mas a operação foi bem-sucedida.
    if (!Array.isArray(alunos) || (alunos as unknown[]).length === 0) {
      return res.status(200).json([]);
    }

    return res.json(alunos);
  } catch (error: any) {
    // Aqui, você pode incluir um erro 404 específico se o service confirmar que o professorId não existe
    if (error.message.includes("Professor não encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
