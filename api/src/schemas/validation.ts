import { z } from "zod";

// =========================================================================
// UTILITY SCHEMAS
// =========================================================================

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID deve ser um número válido")
    .transform(Number)
    .refine((num) => num > 0, "ID deve ser positivo"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Email deve ter um formato válido" })
    .max(255),
  senha: z.string().min(6).max(100),
});

// =========================================================================
// 1. Secretaria
// =========================================================================

export const createSecretarioSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().max(255),
  senha: z.string().min(6).max(100),
  telefone: z.string().min(10).max(15).optional(),
});

export const updateSecretarioSchema = createSecretarioSchema.partial();

// =========================================================================
// 2. Professor
// =========================================================================

export const createProfessorSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().max(255),
  senha: z.string().min(6).max(100),
  cpf: z.string().length(11).regex(/^\d+$/, "CPF deve conter apenas números"),
  telefone: z.string().min(10).max(15).optional(),
});

export const updateProfessorSchema = createProfessorSchema.partial();

// =========================================================================
// 3. Aluno
// =========================================================================

export const createAlunoSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email().max(255),
  senha: z.string().min(6).max(100),
  cpf: z.string().length(11).regex(/^\d+$/, "CPF deve conter apenas números"),
  telefone: z.string().min(10).max(15).optional(),
  dataNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((date) => new Date(date + "T00:00:00.000Z"))
    .refine((date) => !isNaN(date.getTime()), "Data de nascimento inválida")
    .refine(
      (date) => date < new Date(),
      "Data de nascimento deve ser no passado"
    ),
  casaId: z.number().int().positive("ID da Casa deve ser positivo"),
  turmaId: z.number().int().positive("ID da Turma deve ser positivo"),
});

export const updateAlunoSchema = createAlunoSchema.partial();

// =========================================================================
// 4. Casa
// =========================================================================

export const createCasaSchema = z.object({
  nome: z.string().min(2).max(50),
  diretor: z.string().min(2).max(100).optional(),
  cor: z
    .string()
    .regex(
      /^#([0-9A-Fa-f]{3}){1,2}$/,
      "A cor deve ser um código hexadecimal válido"
    ),
});

export const updateCasaSchema = createCasaSchema.partial();

// =========================================================================
// 5. Turma
// =========================================================================

export const createTurmaSchema = z.object({
  nome: z.string().min(2).max(50),
  anoLetivo: z.number().int().min(2020),
  professorResponsavelId: z.number().int().positive().optional(),
});

export const updateTurmaSchema = createTurmaSchema.partial();

// =========================================================================
// 6. Disciplina
// =========================================================================

export const createDisciplinaSchema = z.object({
  nome: z.string().min(2).max(100),
  codigo: z.string().min(3).max(10),
  professorId: z.number().int().positive().optional(),
});

export const updateDisciplinaSchema = createDisciplinaSchema.partial();

// =========================================================================
// 7. Matrícula
// =========================================================================

export const createMatriculaSchema = z.object({
  alunoId: z.number().int().positive(),
  disciplinaId: z.number().int().positive(),
});

export const updateNotaSchema = z.object({
  nota: z.number().min(0).max(10),
  dataNota: z.string().datetime().optional(),
});

// =========================================================================
// 8. TurmaDisciplina
// =========================================================================

export const createTurmaDisciplinaSchema = z.object({
  turmaId: z.number().int().positive(),
  disciplinaId: z.number().int().positive(),
  professorId: z.number().int().positive(),
});

// =========================================================================
// TIPOS EXPORTADOS PARA SERVIÇOS
// =========================================================================

export type CreateProfessorData = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorData = z.infer<typeof updateProfessorSchema>;

export type CreateAlunoData = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoData = z.infer<typeof updateAlunoSchema>;
