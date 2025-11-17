import { Router } from "express";

// Importa os roteadores de módulo
import authRoutes from "./auth.routes";
import secretarioRoutes from "./secretario.routes";
import professorRoutes from "./professor.routes";
import turmaRoutes from "./turma.routes";
import disciplinaRoutes from "./disciplina.routes";
import matriculaRoutes from "./matricula.routes";
import casaRoutes from "./casa.routes";

const router = Router();

// Rota de Autenticação (acesso público)
router.use("/", authRoutes);

// Rotas de Gestão de Usuário e Secretário
router.use("/secretario", secretarioRoutes); // Rotas de criação (POST /secretario/alunos)

// Rotas do Módulo Acadêmico
router.use("/turmas", turmaRoutes);
router.use("/disciplinas", disciplinaRoutes);
router.use("/matriculas", matriculaRoutes);
router.use("/casas", casaRoutes);

// Rotas do Módulo de Pessoas e Perfil
router.use("/professores", professorRoutes);
// **NOTA:** As rotas CRUD de Aluno e Secretário (exceto criação) deveriam ir aqui (ex: /alunos/1, /secretarios/1)

export default router;
