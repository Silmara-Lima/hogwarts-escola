// =========================================================================
// AuthController
// =========================================================================

import { Request, Response } from "express";
import * as authService from "../services/AuthService";
import { z, ZodError } from "zod";

// Zod Schema para validar login
const LoginSchema = z.object({
  email: z.string().email("Email inválido.").min(1, "Email é obrigatório."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

// =========================================================================
// loginController (POST /login)
// =========================================================================
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await authService.login(email, password);
    return res.json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Erro de validação.",
        errors: error.issues,
      });
    }

    if (error.message.includes("Credenciais inválidas")) {
      return res.status(401).json({ message: "Email ou senha incorretos." });
    }

    return res.status(500).json({ message: error.message });
  }
};
