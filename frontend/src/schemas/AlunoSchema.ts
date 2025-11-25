import { z } from "zod";

// =========================================================
// EXPRESSÕES REGULARES
// =========================================================
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/;
const nomeRegex = /^[a-zA-Z\u00C0-\u00FF\s]+$/;
const telefoneRegex = /^\d{11}$/;
const matriculaRegex = /^\d+$/;

// =========================================================
// ENUMS
// =========================================================
export const TurnoEnum = z.enum(["MATUTINO", "VESPERTINO", "NOTURNO"]);
export type Turno = z.infer<typeof TurnoEnum>;

// =========================================================
// VALIDADORES BASE
// =========================================================
const emailValidation = z
  .string()
  .email("Formato de e-mail inválido")
  .min(5, "O e-mail é obrigatório");

const alunoFieldsBase = {
  nome: z
    .string()
    .min(3, "O nome é obrigatório")
    .regex(nomeRegex, "O nome deve conter apenas letras e espaços"),
  email: emailValidation,
  cpf: z
    .string()
    .regex(cpfRegex, "CPF inválido")
    .min(11, "O CPF é obrigatório"),
  telefone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || telefoneRegex.test(val),
      "O Telefone deve ter 11 dígitos (DDD + 9º dígito)"
    ),
  dataNascimento: z
    .string()
    .min(10, "Data de Nascimento é obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
};

// =========================================================
// SCHEMA DE CRIAÇÃO
// =========================================================
export const createAlunoSchema = z.object({
  ...alunoFieldsBase,
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  matricula: z
    .string()
    .min(1, "A matrícula é obrigatória")
    .regex(matriculaRegex, "A matrícula deve conter apenas números"),
  turno: TurnoEnum,
  casaId: z.number().int().optional().nullable(),
  turmaId: z
    .number()
    .int()
    .refine((val) => val >= 1, { message: "Selecione uma Turma válida" }),
  curso: z.string().optional(),
});

export type CreateAlunoData = z.infer<typeof createAlunoSchema>;

// =========================================================
// SCHEMA DE ATUALIZAÇÃO
// =========================================================
export const updateAlunoSchema = z.object({
  nome: alunoFieldsBase.nome.optional(),
  email: alunoFieldsBase.email.optional(),
  cpf: alunoFieldsBase.cpf.optional(),
  telefone: alunoFieldsBase.telefone,
  dataNascimento: alunoFieldsBase.dataNascimento.optional(),
  curso: z.string().optional(),
  casaId: z.number().int().optional().nullable(),
  turmaId: z.number().int().optional(),
  senha: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres")
    .optional(),
  matricula: z
    .string()
    .min(1, "A matrícula é obrigatória")
    .regex(matriculaRegex, "A matrícula deve conter apenas números")
    .optional(),
  turno: TurnoEnum.optional(),
});

export type UpdateAlunoData = z.infer<typeof updateAlunoSchema>;
