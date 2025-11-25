// =========================================================================
// indexRoutes.ts - Centralizador de todas as rotas da API
// =========================================================================

import { Router } from "express";

// Importações dos módulos de rotas
import authRoutes from "./authRoutes";
import optionRoutes from "./optionRoutes";
import professorRoutes from "./professorRoutes";
import secretarioRoutes from "./secretarioRoutes";
import turmaRoutes from "./turmaRoutes";
import disciplinaRoutes from "./disciplinaRoutes";
import matriculaRoutes from "./matriculaRoutes";
import casaRoutes from "./casaRoutes";

// Importações adicionais para rota de perfil do Aluno
import * as AlunoController from "../controllers/AlunoController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// =========================================================================
// ROTAS DA API
// =========================================================================

// 1. Rota de Autenticação (pública)
// Endpoint: /api/auth/...
router.use("/auth", authRoutes);

// 2. Rotas do módulo de Pessoas e Gestão
// Endpoint: /api/secretario/... (alunos, professores, dashboard)
router.use("/secretario", secretarioRoutes);

// Endpoint: /api/professores/... (CRUD de Professores)
router.use("/professores", professorRoutes);

// Rota específica para obter informações do Aluno logado
// Endpoint: /api/aluno/info
router.get(
  "/aluno/info",
  authenticate,
  authorize(["ALUNO"]),
  AlunoController.getAlunoInfo
);

// 3. Rotas do módulo acadêmico e institucional
router.use("/turmas", turmaRoutes); // /api/turmas/...
router.use("/disciplinas", disciplinaRoutes); // /api/disciplinas/...
router.use("/matriculas", matriculaRoutes); // /api/matriculas/...
router.use("/casas", casaRoutes); // /api/casas/...

// 4. Rotas de utilitário/metadados
// Endpoint: /api/options/...
router.use("/options", optionRoutes);

export default router;
