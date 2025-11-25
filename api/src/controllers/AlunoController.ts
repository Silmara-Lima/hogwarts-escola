import { Request, Response } from "express";
import * as alunoService from "../services/AlunoService";
import { Prisma } from "@prisma/client";
import {
  AlunoCreateData,
  AlunoUpdateData,
  AlunoResponseData,
} from "../services/AlunoService";

// =========================================================================
// 1. getAllAlunos (GET /)
// =========================================================================
export const getAllAlunos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const alunos: AlunoResponseData[] = await alunoService.getAll();
    return res.status(200).json(alunos);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return res
      .status(500)
      .json({ message: "Falha ao buscar a lista de alunos." });
  }
};

// =========================================================================
// 2. createAluno (POST /)
// =========================================================================
export const createAluno = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const data = req.body as AlunoCreateData;
  console.log("REQ BODY =>", JSON.stringify(req.body, null, 2));

  try {
    const novoAluno = await alunoService.create(data);
    return res.status(201).json(novoAluno);
  } catch (error: any) {
    console.error("Erro ao criar aluno:", error);

    if (error.message.includes("E-mail ou CPF já cadastrado")) {
      return res.status(409).json({ message: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2000" || error.code === "P2002") {
        return res.status(400).json({
          message:
            "Dados inválidos: Verifique se todos os campos obrigatórios foram preenchidos ou se há duplicidade (CPF/Email).",
        });
      }
    }

    return res
      .status(500)
      .json({ message: "Erro interno ao registrar aluno." });
  }
};

// =========================================================================
// 3. getAlunoById (GET /:id)
// =========================================================================
export const getAlunoById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID do aluno inválido." });
  }

  try {
    const aluno = await alunoService.getById(id);
    if (!aluno) {
      return res.status(404).json({ message: "Aluno não encontrado." });
    }
    return res.status(200).json(aluno);
  } catch (error) {
    console.error("Erro ao buscar aluno por ID:", error);
    return res.status(500).json({ message: "Erro interno ao buscar aluno." });
  }
};

// =========================================================================
// 4. updateAluno (PATCH /:id)
// =========================================================================
export const updateAluno = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id, 10);
  const data = req.body as AlunoUpdateData;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID do aluno inválido." });
  }

  try {
    const alunoAtualizado = await alunoService.update(id, data);
    return res.status(200).json(alunoAtualizado);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res
        .status(404)
        .json({ message: "Aluno a ser atualizado não encontrado." });
    }

    console.error("Erro ao atualizar aluno:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao atualizar aluno." });
  }
};

// =========================================================================
// 5. deleteAluno (DELETE /:id)
// =========================================================================
export const deleteAluno = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID do aluno inválido." });
  }

  try {
    await alunoService.remove(id);
    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res
        .status(404)
        .json({ message: "Aluno a ser removido não encontrado." });
    }

    console.error("Erro ao remover aluno:", error);
    return res.status(500).json({ message: "Erro interno ao remover aluno." });
  }
};

// =========================================================================
// 6. getAlunoInfo (GET /info)
// =========================================================================
export const getAlunoInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    const aluno = await alunoService.getById(userId);
    if (!aluno) {
      return res
        .status(404)
        .json({ message: "Perfil de aluno não encontrado." });
    }
    return res.status(200).json(aluno);
  } catch (error) {
    console.error("Erro ao buscar informações do aluno:", error);
    return res.status(500).json({ message: "Erro interno ao buscar perfil." });
  }
};
