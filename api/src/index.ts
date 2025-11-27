// =========================================================================
//  Inicialização e Imports
// =========================================================================

import express from "express";
import cors from "cors";
import "dotenv/config";
import routes from "./routes/index";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger";

import "./database/prisma";

const app = express();

// =========================================================================
// 1. Middleware
// =========================================================================

app.use(
  cors({
    origin: ["http://localhost:5173", "https://seu-front.onrender.com"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(express.json());

// =========================================================================
// 2. Rotas e Documentação
// =========================================================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "Online e Mágico! 🧙‍♂️",
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", routes);

// =========================================================================
// 3. Inicialização do Servidor
// =========================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✨ Server de Hogwarts rodando em http://localhost:${PORT}`);
  console.log(`📄 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
