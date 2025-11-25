import { z } from "zod";

// =========================================================
// SCHEMA DE CRIAÇÃO DE MATRÍCULA
// =========================================================
export const createMatriculaSchema = z.object({
  dataMatricula: z.string().min(1, "A data da matrícula é obrigatória."),
  observacoes: z.string().optional(),
  alunoId: z
    .number({ message: "O aluno é obrigatório." })
    .int()
    .positive("Selecione um aluno válido (ID positivo)."),
  turmaId: z
    .number({ message: "A turma é obrigatória." })
    .int()
    .positive("Selecione uma turma válida (ID positivo)."),
});

// =========================================================
// SCHEMA DE ATUALIZAÇÃO DE MATRÍCULA
// =========================================================
export const updateMatriculaSchema = createMatriculaSchema.extend({
  id: z.number().int().positive(),
});

// =========================================================
// TIPAGENS
// =========================================================
export type CreateMatriculaData = z.infer<typeof createMatriculaSchema>;
export type UpdateMatriculaData = z.infer<typeof updateMatriculaSchema>;
