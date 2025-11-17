// src/controllers/AuthController.ts

import { Request, Response } from "express";
import * as authService from "../services/AuthService";
import { z, ZodError } from "zod";

// Zod Schema para garantir que o input de login é válido
const LoginSchema = z.object({
  email: z.string().email("Email inválido.").min(1, "Email é obrigatório."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

/**
 * Rota de login.
 * Verifica as credenciais e retorna o JWT e os dados do usuário.
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    // Validação da entrada (email e password)
    const { email, password } = LoginSchema.parse(req.body);

    const result = await authService.login(email, password);

    // Sucesso: Retorna o token e o usuário (sem a senha)
    return res.json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      // Erro de validação de input
      const zodError = error as ZodError<any>;
      return res.status(400).json({
        message: "Erro de validação.",
        errors: zodError.issues,
      });
    }

    if (error.message.includes("Credenciais inválidas")) {
      // Erro de autenticação
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    // Outros erros (ex: JWT_SECRET não configurado)
    return res.status(500).json({ message: error.message });
  }
};
