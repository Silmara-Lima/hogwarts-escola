import { z } from "zod";

// =========================================================
// EXPRESSÕES REGULARES E VALIDAÇÕES COMUNS
// =========================================================
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/;
const emailValidation = z
  .string()
  .email("Formato de e-mail inválido")
  .min(5, "O e-mail é obrigatório");

// =========================================================
// CAMPOS COMUNS DE SECRETÁRIO
// =========================================================
const secretarioFields = {
  nome: z.string().min(3, "O nome do Secretário é obrigatório"),
  email: emailValidation,
  cpf: z
    .string()
    .regex(cpfRegex, "CPF inválido")
    .min(11, "O CPF é obrigatório")
    .optional(),
  telefone: z.string().optional(),
};

// =========================================================
// SCHEMA DE CRIAÇÃO (Senha obrigatória)
// =========================================================
export const createSecretarioSchema = z.object({
  ...secretarioFields,
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// =========================================================
// SCHEMA DE EDIÇÃO (Todos os campos opcionais)
// =========================================================
export const updateSecretarioSchema = z.object({
  nome: secretarioFields.nome.optional(),
  email: secretarioFields.email.optional(),
  cpf: secretarioFields.cpf.optional(),
  telefone: secretarioFields.telefone,
  senha: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres")
    .optional(),
});

// =========================================================
// TIPAGENS (opcional)
// =========================================================
export type CreateSecretarioData = z.infer<typeof createSecretarioSchema>;
export type UpdateSecretarioData = z.infer<typeof updateSecretarioSchema>;
