import { prisma } from "../database/prisma";
import { Aluno, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// =========================================================================
// TIPOS
// =========================================================================

export type AlunoCreateData = Omit<Aluno, "id" | "createdAt" | "updatedAt">;
export type AlunoUpdateData = Partial<AlunoCreateData>;

export const alunoSelectPayload = Prisma.validator<Prisma.AlunoSelect>()({
  id: true,
  nome: true,
  email: true,
  cpf: true,
  telefone: true,
  dataNascimento: true,
  matricula: true,
  turno: true,
  turma: { select: { id: true, serie: true, turno: true } },
  casa: { select: { id: true, nome: true } },
  createdAt: true,
  updatedAt: true,
});

export type AlunoResponseData = Prisma.AlunoGetPayload<{
  select: typeof alunoSelectPayload;
}>;

// =========================================================================
// CREATE
// =========================================================================

export const create = async (
  data: AlunoCreateData
): Promise<AlunoResponseData> => {
  if (data.turmaId) {
    const turmaExists = await prisma.turma.findUnique({
      where: { id: data.turmaId },
    });
    if (!turmaExists) {
      throw new Error(`Turma com id ${data.turmaId} não existe.`);
    }
  }

  if (data.casaId !== null && data.casaId !== undefined) {
    const casaExists = await prisma.casa.findUnique({
      where: { id: data.casaId },
    });
    if (!casaExists) throw new Error(`Casa com id ${data.casaId} não existe.`);
  }

  const existing = await prisma.aluno.findFirst({
    where: { OR: [{ email: data.email }, { cpf: data.cpf }] },
  });
  if (existing) throw new Error("E-mail ou CPF já cadastrado no sistema.");

  const hashedPassword = await bcrypt.hash(data.senha, 10);

  let dataNascimentoIso: Date | undefined;
  if (data.dataNascimento) {
    if (data.dataNascimento.includes("/")) {
      const [day, month, year] = data.dataNascimento.split("/").map(Number);
      if (!day || !month || !year)
        throw new Error("Data de nascimento inválida");
      dataNascimentoIso = new Date(year, month - 1, day);
    } else if (data.dataNascimento.includes("-")) {
      const d = new Date(data.dataNascimento);
      if (isNaN(d.getTime())) throw new Error("Data de nascimento inválida");
      dataNascimentoIso = d;
    } else {
      throw new Error("Data de nascimento inválida");
    }
  }

  const { casaId, turmaId, ...rest } = data;
  const createData: any = {
    ...rest,
    senha: hashedPassword,
    dataNascimento: dataNascimentoIso,
    turma: { connect: { id: turmaId } },
  };

  if (casaId) createData.casa = { connect: { id: casaId } };

  return prisma.aluno.create({
    data: createData,
    select: alunoSelectPayload,
  });
};

// =========================================================================
// GET ALL
// =========================================================================

export const getAll = async (): Promise<AlunoResponseData[]> => {
  return prisma.aluno.findMany({ select: alunoSelectPayload });
};

// =========================================================================
// GET BY ID
// =========================================================================

export const getById = async (
  id: number
): Promise<AlunoResponseData | null> => {
  return prisma.aluno.findUnique({
    where: { id },
    select: alunoSelectPayload,
  });
};

// =========================================================================
// UPDATE
// =========================================================================

export const update = async (
  id: number,
  data: AlunoUpdateData
): Promise<AlunoResponseData> => {
  const alunoAtual = await prisma.aluno.findUnique({ where: { id } });
  if (!alunoAtual) throw new Error(`Aluno com id ${id} não encontrado.`);

  const { casaId, turmaId, dataNascimento, ...rest } = data;
  const updateData: any = { ...rest };

  if (turmaId && turmaId !== alunoAtual.turmaId) {
    updateData.turma = { connect: { id: turmaId } };
  }

  if (casaId !== undefined && casaId !== alunoAtual.casaId) {
    updateData.casa =
      casaId === null ? { disconnect: true } : { connect: { id: casaId } };
  }

  if (dataNascimento) {
    let novaData: Date;
    if (dataNascimento.includes("/")) {
      const [day, month, year] = dataNascimento.split("/").map(Number);
      if (!day || !month || !year)
        throw new Error("Data de nascimento inválida");
      novaData = new Date(year, month - 1, day);
    } else if (dataNascimento.includes("-")) {
      novaData = new Date(dataNascimento);
      if (isNaN(novaData.getTime()))
        throw new Error("Data de nascimento inválida");
    } else {
      throw new Error("Data de nascimento inválida");
    }

    if (
      alunoAtual.dataNascimento?.toISOString().split("T")[0] !==
      novaData.toISOString().split("T")[0]
    ) {
      updateData.dataNascimento = novaData;
    }
  }

  if (data.senha) updateData.senha = await bcrypt.hash(data.senha, 10);

  return prisma.aluno.update({
    where: { id },
    data: updateData,
    select: alunoSelectPayload,
  });
};

// =========================================================================
// DELETE
// =========================================================================

export const remove = async (id: number): Promise<AlunoResponseData> => {
  await prisma.matricula.deleteMany({ where: { alunoId: id } });
  return prisma.aluno.delete({ where: { id }, select: alunoSelectPayload });
};
