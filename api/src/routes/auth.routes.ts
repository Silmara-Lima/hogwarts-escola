import { Router } from "express";
import { loginController } from "../controllers/AuthController";

const router = Router();

// Rota pública para login de qualquer tipo de usuário (Secretário, Professor, Aluno)
router.post("/login", loginController);

export default router;
