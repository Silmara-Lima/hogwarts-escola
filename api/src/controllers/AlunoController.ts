// src/controllers/AlunoController.ts

import { Request, Response } from "express";
import * as alunoService from "../services/AlunoService";

/**
 * Retorna todos os alunos com suas relações (Casa, Turma, Disciplinas).
 */
export const getAllAlunos = async (req: Request, res: Response) => {
  try {
    const alunos = await alunoService.getAll();
    // Nota: As senhas já devem ser omitidas no Service ou usando o SELECT do Prisma.
    return res.json(alunos);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Retorna um aluno específico por ID.
 */
export const getAlunoById = async (req: Request, res: Response) => {
  try {
    const aluno = await alunoService.getById(Number(req.params.id));

    if (!aluno) {
      return res
        .status(404)
        .json({ message: "Aluno(a) de Hogwarts não encontrado(a)." });
    }

    // Omitir a senha no retorno (se ela não foi omitida no Service)
    const { senha, ...alunoResponse } = aluno;
    return res.json(alunoResponse);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza os dados de um aluno (excluindo dados sensíveis como senha/CPF, que exigiriam validação extra).
 */
export const updateAluno = async (req: Request, res: Response) => {
  try {
    const aluno = await alunoService.update(Number(req.params.id), req.body);

    // Retorna o aluno atualizado sem a senha
    const { senha, ...alunoResponse } = aluno;
    return res.json(alunoResponse);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Aluno(a) não encontrado(a)." });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: `Campo único já existe: ${error.meta.target}` });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Remove um aluno. (Geralmente uma operação restrita ao Secretariado).
 */
export const deleteAluno = async (req: Request, res: Response) => {
  try {
    await alunoService.remove(Number(req.params.id));
    return res.status(204).send(); // HTTP 204: No Content (Sucesso sem retorno)
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Aluno(a) não encontrado(a)." });
    }
    // P2003: Falha na restrição de chave estrangeira (se o aluno estiver matriculado, por exemplo)
    if (error.code === "P2003") {
      return res
        .status(409)
        .json({
          message:
            "Não é possível remover: O aluno possui matrículas ou vínculos ativos.",
        });
    }
    return res.status(500).json({ message: error.message });
  }
};
