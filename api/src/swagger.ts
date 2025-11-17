import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do Sistema Acadêmico de Hogwarts",
      version: "1.0.0",
      description:
        "API para gerenciar alunos, professores, turmas, disciplinas e a estrutura de Casas de Hogwarts.",
    },
    // Adicione a seção de segurança para o JWT (Bearer Token)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Insira o token JWT (Bearer Token) obtido no endpoint /login",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3333/api/v1", // Ajuste para sua base URL se necessário
        description: "Servidor de Desenvolvimento",
      },
    ],
  },
  // O caminho abaixo instrui o Swagger a buscar a documentação (JSDoc) em todos os arquivos de rota.
  apis: ["./src/routes/*.ts", "./src/routes/*/*.ts"],
};

const specs = swaggerJsdoc(options);

/**
 * Configura o middleware do Swagger UI para a aplicação Express.
 * @param app Instância da aplicação Express.
 */
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
