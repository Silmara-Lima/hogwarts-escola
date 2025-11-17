import { z } from "zod";

// --- Utility Schemas ---

// Schema para validação de IDs em parâmetros de URL
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID deve ser um número válido")
    .transform(Number)
    .refine((num) => num > 0, "ID deve ser positivo"),
});

// Schema genérico para login
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Email deve ter um formato válido" })
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
});

// --- 1. Secretaria Schemas ---

export const createSecretarioSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .email({ message: "Email deve ter um formato válido" })
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 caracteres")
    .max(15, "Telefone deve ter no máximo 15 caracteres")
    .optional(),
});

export const updateSecretarioSchema = createSecretarioSchema.partial();

// --- 2. Professor Schemas (Adaptado de Médico) ---

export const createProfessorSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .email({ message: "Email deve ter um formato válido" })
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  cpf: z
    .string()
    .length(11, "CPF deve ter exatamente 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 caracteres")
    .max(15, "Telefone deve ter no máximo 15 caracteres")
    .optional(),
});

export const updateProfessorSchema = createProfessorSchema.partial();

// --- 3. Aluno Schemas (Adaptado de Paciente) ---

export const createAlunoSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .email({ message: "Email deve ter um formato válido" })
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  cpf: z
    .string()
    .length(11, "CPF deve ter exatamente 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 caracteres")
    .max(15, "Telefone deve ter no máximo 15 caracteres")
    .optional(),
  dataNascimento: z
    .string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Data de nascimento deve ser uma data válida")
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      return parsedDate < today;
    }, "Data de nascimento deve ser no passado"),

  // Relações essenciais para o Aluno
  casaId: z
    .number()
    .int("ID da Casa deve ser um número inteiro")
    .positive("ID da Casa deve ser positivo"),
  turmaId: z
    .number()
    .int("ID da Turma deve ser um número inteiro")
    .positive("ID da Turma deve ser positivo"),
});

export const updateAlunoSchema = createAlunoSchema.partial();

// --- 4. Casa Schemas ---

export const createCasaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  diretor: z
    .string()
    .min(2, "Nome do Diretor deve ter pelo menos 2 caracteres")
    .max(100, "Nome do Diretor deve ter no máximo 100 caracteres")
    .optional(),
  cor: z
    .string()
    .regex(
      /^#([0-9A-Fa-f]{3}){1,2}$/,
      "A cor deve ser um código hexadecimal válido (ex: #FF0000)"
    )
    .max(7, "O código de cor deve ter no máximo 7 caracteres"),
});

export const updateCasaSchema = createCasaSchema.partial();

// --- 5. Turma Schemas ---

export const createTurmaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  anoLetivo: z
    .number()
    .int("Ano letivo deve ser um número inteiro")
    .min(2020, "O ano letivo deve ser a partir de 2020"),
  // Professor é opcional, caso a turma ainda não tenha um responsável
  professorResponsavelId: z
    .number()
    .int("ID do Professor deve ser um número inteiro")
    .positive("ID do Professor deve ser positivo")
    .optional(),
});

export const updateTurmaSchema = createTurmaSchema.partial();

// --- 6. Disciplina Schemas ---

export const createDisciplinaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  codigo: z
    .string()
    .min(3, "Código deve ter pelo menos 3 caracteres")
    .max(10, "Código deve ter no máximo 10 caracteres"),
  // Professor é opcional, caso a disciplina ainda não tenha sido alocada
  professorId: z
    .number()
    .int("ID do Professor deve ser um número inteiro")
    .positive("ID do Professor deve ser positivo")
    .optional(),
});

export const updateDisciplinaSchema = createDisciplinaSchema.partial();

// --- 7. Matrícula Schemas (Adaptado de Consulta) ---

// Schema para matricular um aluno em uma disciplina
export const createMatriculaSchema = z.object({
  alunoId: z
    .number()
    .int("ID do Aluno deve ser um número inteiro")
    .positive("ID do Aluno deve ser positivo"),
  disciplinaId: z
    .number()
    .int("ID da Disciplina deve ser um número inteiro")
    .positive("ID da Disciplina deve ser positivo"),
});

// Schema para atualização de nota (usado por Professor)
export const updateNotaSchema = z.object({
  nota: z.number().min(0, "A nota mínima é 0").max(10, "A nota máxima é 10"),
  // A data da nota é opcional, mas garante rastreabilidade
  dataNota: z.string().datetime().optional(),
});

// --- Tipos TypeScript Derivados ---
export type IdParam = z.infer<typeof idParamSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type CreateSecretarioData = z.infer<typeof createSecretarioSchema>;
export type UpdateSecretarioData = z.infer<typeof updateSecretarioSchema>;

export type CreateProfessorData = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorData = z.infer<typeof updateProfessorSchema>;

export type CreateAlunoData = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoData = z.infer<typeof updateAlunoSchema>;

export type CreateCasaData = z.infer<typeof createCasaSchema>;
export type UpdateCasaData = z.infer<typeof updateCasaSchema>;

export type CreateTurmaData = z.infer<typeof createTurmaSchema>;
export type UpdateTurmaData = z.infer<typeof updateTurmaSchema>;

export type CreateDisciplinaData = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaData = z.infer<typeof updateDisciplinaSchema>;

export type CreateMatriculaData = z.infer<typeof createMatriculaSchema>;
export type UpdateNotaData = z.infer<typeof updateNotaSchema>;
