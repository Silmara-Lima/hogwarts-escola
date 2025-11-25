import { z } from "zod";

// =========================================================
// SCHEMA DE LOGIN
// =========================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// =========================================================
// TIPAGEM
// =========================================================
export type LoginFormData = z.infer<typeof loginSchema>;
