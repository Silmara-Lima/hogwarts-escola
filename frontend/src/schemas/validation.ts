import { z } from "zod";
// Importar todos os schemas utilizados no projeto
import { createAlunoSchema, updateAlunoSchema } from "../schemas/AlunoSchema";
import {
  createProfessorSchema,
  updateProfessorSchema,
} from "../schemas/ProfessorSchema";
import { loginSchema } from "../schemas/LoginSchema";

// =========================================================
// FUNÇÃO GENÉRICA PARA TRATAMENTO DE ERROS ZOD
// =========================================================

const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    errors[key] = issue.message;
  }
  return errors;
};

// =========================================================
// VALIDAÇÕES PARA ALUNO
// =========================================================

export const validateCreateAluno = (data: unknown) => {
  try {
    const validatedData = createAlunoSchema.parse(data);
    return { success: true as const, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: formatZodErrors(error) };
    }
    throw error;
  }
};

export const validateUpdateAluno = (data: unknown) => {
  try {
    const validatedData = updateAlunoSchema.parse(data);
    return { success: true as const, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: formatZodErrors(error) };
    }
    throw error;
  }
};

// =========================================================
// VALIDAÇÕES PARA PROFESSOR
// =========================================================

export const validateCreateProfessor = (data: unknown) => {
  try {
    const validatedData = createProfessorSchema.parse(data);
    return { success: true as const, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: formatZodErrors(error) };
    }
    throw error;
  }
};

export const validateUpdateProfessor = (data: unknown) => {
  try {
    const validatedData = updateProfessorSchema.parse(data);
    return { success: true as const, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: formatZodErrors(error) };
    }
    throw error;
  }
};

// =========================================================
// VALIDAÇÃO DE LOGIN
// =========================================================

export const validateLogin = (data: unknown) => {
  try {
    const validatedData = loginSchema.parse(data);
    return { success: true as const, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, errors: formatZodErrors(error) };
    }
    throw error;
  }
};

// =========================================================
// VALIDAÇÃO DE CAMPO ÚNICO (ONBLUR)
// =========================================================

export const validateField = (
  schema: z.ZodObject<any>,
  fieldName: string,
  value: any
): string => {
  try {
    const fieldSchema = schema.shape[fieldName];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return "";
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || "Valor inválido";
    }
    return "";
  }
};
