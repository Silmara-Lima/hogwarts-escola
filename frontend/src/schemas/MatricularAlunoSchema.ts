import { z } from "zod";

// --- Schema de Criação de Matrícula ---
export const createMatriculaSchema = z.object({
  // dataMatricula substitui dataHora
  dataMatricula: z.string().min(1, "A data da matrícula é obrigatória."),

  // observacoes substitui motivo (opcional)
  observacoes: z.string().optional(),

  // alunoId substitui pacienteId
  alunoId: z
    .number({ message: "O aluno é obrigatório." })
    .int()
    .positive("Selecione um aluno válido (ID positivo)."),

  // turmaId substitui medicoId
  turmaId: z
    .number({ message: "A turma é obrigatória." })
    .int()
    .positive("Selecione uma turma válida (ID positivo)."),
});

// --- Schema de Atualização de Matrícula ---
export const updateMatriculaSchema = createMatriculaSchema.extend({
  // Adiciona o ID da matrícula para operações de atualização
  id: z.number().int().positive(),
});

// Tipos derivados para uso no TypeScript
export type CreateMatriculaData = z.infer<typeof createMatriculaSchema>;
export type UpdateMatriculaData = z.infer<typeof updateMatriculaSchema>;
