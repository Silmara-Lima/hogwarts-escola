// src/index.ts

import express from "express";
import cors from "cors";
import "dotenv/config"; // Garante que as variáveis de ambiente sejam carregadas
import routes from "./routes/index";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger"; // export default deve ser o Document do Swagger

// Garante que o Prisma Client seja inicializado (embora ele seja lazy loaded)
import "./database/prisma";

const app = express();

// --- Middleware ---

// Configuração CORS - permite requisições do frontend
app.use(
  cors({
    // Ajuste a URL do frontend conforme necessário, ou use '*' em dev
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Permite que o Express leia JSON no corpo das requisições
app.use(express.json());
// --- Rotas e Documentação ---

// Configura a documentação Swagger (servindo Swagger UI em /api-docs)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Adiciona todas as rotas da aplicação
app.use("/api", routes); // Opcional: Prefixar as rotas com '/api' para organização. Se não quiser, use app.use(routes);
app.use("/api", routes); // Opcional: Prefixar as rotas com '/api' para organização. Se não quiser, use app.use(routes);

// --- Inicialização do Servidor ---

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✨ Server de Hogwarts rodando em http://localhost:${PORT}`);
  // Adiciona link direto para a documentação (se o Swagger estiver configurado)
  console.log(`📄 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
