import { prisma } from "../database/prisma";
import { Aluno, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// =========================================================================
// TIPOS
// =========================================================================

// Entrada para criação (omite campos gerados e a dataNascimento, que é tratada como string/Date)
export type AlunoCreateData = Omit<
  Aluno,
  "id" | "createdAt" | "updatedAt" | "dataNascimento"
> & {
  dataNascimento: string | Date; // Permitindo a string DD/MM/AAAA ou YYYY-MM-DD
};

// Entrada para atualização (todos os campos opcionais)
export type AlunoUpdateData = Partial<AlunoCreateData>;

// Payload de seleção de campos para retorno (inclui relações)
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
  } else {
    // Turma é obrigatória, se o campo for removido do Omit, deve-se verificar
    throw new Error("O campo turmaId é obrigatório.");
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

  if (!data.senha) throw new Error("A senha é obrigatória.");
  const hashedPassword = await bcrypt.hash(data.senha, 10);

  let dataNascimentoIso: Date | undefined;
  if (data.dataNascimento) {
    const dataNascimentoStr = data.dataNascimento as string;

    if (dataNascimentoStr.includes("/")) {
      const [day, month, year] = dataNascimentoStr.split("/").map(Number);
      // CORREÇÃO CRÍTICA APLICADA: Criação do objeto Date
      dataNascimentoIso = new Date(year, month - 1, day);
      if (isNaN(dataNascimentoIso.getTime()))
        throw new Error("Data de nascimento inválida");
    } else if (dataNascimentoStr.includes("-")) {
      const d = new Date(data.dataNascimento);
      if (isNaN(d.getTime())) throw new Error("Data de nascimento inválida");
      dataNascimentoIso = d;
    } else {
      throw new Error("Data de nascimento inválida");
    }
  } else {
    throw new Error("Data de nascimento é obrigatória.");
  }

  const { casaId, turmaId, ...rest } = data;

  // 🟢 AJUSTE DE TIPAGEM: Usamos Prisma.AlunoCreateInput
  const createData: Prisma.AlunoCreateInput = {
    ...rest,
    // 💡 Usa o non-null assertion `!` pois verificamos que o campo é obrigatório
    senha: hashedPassword,
    dataNascimento: dataNascimentoIso!,
    // Garante que o ID não vá direto para o Prisma (causando o 500), mas sim a relação
    turma: { connect: { id: turmaId! } },
  }; // Conexão opcional para Casa

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
  const updateData: Prisma.AlunoUpdateInput = { ...rest }; // Atualização de Turma

  if (turmaId && turmaId !== alunoAtual.turmaId) {
    updateData.turma = { connect: { id: turmaId } };
  } // Atualização/Desconexão de Casa

  if (casaId !== undefined && casaId !== alunoAtual.casaId) {
    updateData.casa =
      casaId === null ? { disconnect: true } : { connect: { id: casaId } };
  }

  if (dataNascimento) {
    let novaData: Date;

    const dataNascimentoStr = dataNascimento as string;

    if (dataNascimentoStr.includes("/")) {
      const [day, month, year] = dataNascimentoStr.split("/").map(Number);
      if (!day || !month || !year)
        throw new Error("Data de nascimento inválida");
      novaData = new Date(year, month - 1, day);
    } else if (dataNascimentoStr.includes("-")) {
      novaData = new Date(dataNascimentoStr);
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
