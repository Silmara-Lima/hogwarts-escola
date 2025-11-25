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
// CAMPOS COMUNS DE PROFESSOR
// =========================================================
const professorFields = {
  nome: z.string().min(3, "O nome do Professor é obrigatório"),
  email: emailValidation,
  cpf: z
    .string()
    .regex(cpfRegex, "CPF inválido")
    .min(11, "O CPF é obrigatório"),
  telefone: z.string().optional(),
};

// =========================================================
// SCHEMA DE CRIAÇÃO (Senha obrigatória)
// =========================================================
export const createProfessorSchema = z.object({
  ...professorFields,
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// =========================================================
// SCHEMA DE EDIÇÃO (Todos os campos opcionais)
// =========================================================
export const updateProfessorSchema = z.object({
  nome: professorFields.nome.optional(),
  email: professorFields.email.optional(),
  cpf: professorFields.cpf.optional(),
  telefone: professorFields.telefone,
  senha: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres")
    .optional(),
});

// =========================================================
// TIPAGENS (opcional)
// =========================================================
export type CreateProfessorData = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorData = z.infer<typeof updateProfessorSchema>;
