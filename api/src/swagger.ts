import { OpenAPIV3 } from "openapi-types";

const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Hogwarts API - Gerenciamento Acadêmico",
    version: "1.0.0",
    description:
      "API para gerenciar Alunos, Professores, Casas, Disciplinas e Matrículas, incluindo a função de Secretário.",
  },
  servers: [
    { url: "http://localhost:3000/api", description: "Servidor Local" },
    { url: "https://api.hogwarts.com", description: "Servidor de Produção" },
  ],
  tags: [
    { name: "Auth", description: "Autenticação e Login" },
    { name: "Alunos", description: "Operações de Alunos" },
    { name: "Professores", description: "Operações de Professores" },
    {
      name: "Secretários",
      description: "Operações de Secretários (Administração)",
    }, // NOVO
    { name: "Casas", description: "Operações de Casas" },
    { name: "Disciplinas", description: "Operações de Disciplinas" },
    { name: "Matrículas", description: "Operações de Matrículas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Casa: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          mascote: { type: "string" },
          fundador: { type: "string" },
          alunos: {
            type: "array",
            items: { $ref: "#/components/schemas/Aluno" },
          },
        },
      },
      Aluno: {
        type: "object",
        properties: {
          id: { type: "integer" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          cpf: { type: "string" },
          funcao: { type: "string", example: "aluno" },
          casaId: { type: "integer", nullable: true },
          casa: { $ref: "#/components/schemas/Casa" },
          matriculas: {
            type: "array",
            items: { $ref: "#/components/schemas/Matricula" },
          },
        },
      },
      Professor: {
        type: "object",
        properties: {
          id: { type: "integer" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          cpf: { type: "string" },
          funcao: { type: "string", example: "professor" },
          disciplinasLecionadas: {
            type: "array",
            items: { $ref: "#/components/schemas/Disciplina" },
          },
        },
      },
      // NOVO SCHEMA: Secretario
      Secretario: {
        type: "object",
        properties: {
          id: { type: "integer" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          cpf: { type: "string" },
          funcao: { type: "string", example: "secretario" },
        },
      },
      Disciplina: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          professorId: { type: "integer" },
          professor: { $ref: "#/components/schemas/Professor" },
          matriculas: {
            type: "array",
            items: { $ref: "#/components/schemas/Matricula" },
          },
        },
      },
      Matricula: {
        type: "object",
        properties: {
          id: { type: "integer" },
          alunoId: { type: "integer" },
          disciplinaId: { type: "integer" },
          grade: { type: "number", nullable: true },
          aluno: { $ref: "#/components/schemas/Aluno" },
          disciplina: { $ref: "#/components/schemas/Disciplina" },
        },
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string" },
          senha: { type: "string" },
        },
        required: ["email", "senha"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          // O campo 'user' aqui pode ser Aluno, Professor ou Secretário
          user: { $ref: "#/components/schemas/Aluno" },
        },
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login de Usuário (Aluno, Professor ou Secretário)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login bem-sucedido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          401: { description: "Credenciais Inválidas" },
        },
      },
    },
    // Rotas de Alunos
    "/alunos": {
      get: {
        tags: ["Alunos"],
        summary: "Listar todos os Alunos",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de Alunos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Aluno" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Alunos"],
        summary: "Criar novo Aluno",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Aluno" },
            },
          },
        },
        responses: {
          201: {
            description: "Aluno criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Aluno" },
              },
            },
          },
        },
      },
    },
    "/alunos/{id}": {
      get: {
        tags: ["Alunos"],
        summary: "Buscar Aluno por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Aluno" },
              },
            },
          },
          404: { description: "Não encontrado" },
        },
      },
      put: {
        tags: ["Alunos"],
        summary: "Atualizar Aluno",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Aluno" },
            },
          },
        },
        responses: {
          200: { description: "Atualizado" },
          404: { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["Alunos"],
        summary: "Remover Aluno",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 204: { description: "Deletado" } },
      },
    },
    // Rotas de Professores
    "/professores": {
      get: {
        tags: ["Professores"],
        summary: "Listar todos os Professores",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de Professores",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Professor" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Professores"],
        summary: "Criar novo Professor",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Professor" },
            },
          },
        },
        responses: {
          201: {
            description: "Professor criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Professor" },
              },
            },
          },
        },
      },
    },
    "/professores/{id}": {
      get: {
        tags: ["Professores"],
        summary: "Buscar Professor por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Professor" },
              },
            },
          },
          404: { description: "Não encontrado" },
        },
      },
      put: {
        tags: ["Professores"],
        summary: "Atualizar Professor",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Professor" },
            },
          },
        },
        responses: {
          200: { description: "Atualizado" },
          404: { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["Professores"],
        summary: "Remover Professor",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 204: { description: "Deletado" } },
      },
    },
    // NOVAS ROTAS DE SECRETÁRIOS
    "/secretarios": {
      get: {
        tags: ["Secretários"],
        summary: "Listar todos os Secretários",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de Secretários",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Secretario" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Secretários"],
        summary: "Criar novo Secretário",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Secretario" },
            },
          },
        },
        responses: {
          201: {
            description: "Secretário criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Secretario" },
              },
            },
          },
        },
      },
    },
    "/secretarios/{id}": {
      get: {
        tags: ["Secretários"],
        summary: "Buscar Secretário por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Secretario" },
              },
            },
          },
          404: { description: "Não encontrado" },
        },
      },
      put: {
        tags: ["Secretários"],
        summary: "Atualizar Secretário",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Secretario" },
            },
          },
        },
        responses: {
          200: { description: "Atualizado" },
          404: { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["Secretários"],
        summary: "Remover Secretário",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 204: { description: "Deletado" } },
      },
    },
    // Rotas de Casas
    "/casas": {
      get: {
        tags: ["Casas"],
        summary: "Listar todas as Casas",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de Casas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Casa" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Casas"],
        summary: "Criar nova Casa",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Casa" },
            },
          },
        },
        responses: {
          201: {
            description: "Casa criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Casa" },
              },
            },
          },
        },
      },
    },
    "/casas/{id}": {
      get: {
        tags: ["Casas"],
        summary: "Buscar Casa por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Casa" },
              },
            },
          },
          404: { description: "Não encontrado" },
        },
      },
      put: {
        tags: ["Casas"],
        summary: "Atualizar Casa",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Casa" },
            },
          },
        },
        responses: {
          200: { description: "Atualizado" },
          404: { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["Casas"],
        summary: "Remover Casa",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 204: { description: "Deletado" } },
      },
    },
    // Rotas de Disciplinas
    "/disciplinas": {
      get: {
        tags: ["Disciplinas"],
        summary: "Listar todas as Disciplinas",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de Disciplinas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Disciplina" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Disciplinas"],
        summary: "Criar nova Disciplina",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Disciplina" },
            },
          },
        },
        responses: {
          201: {
            description: "Disciplina criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Disciplina" },
              },
            },
          },
        },
      },
    },
    "/disciplinas/{id}": {
      get: {
        tags: ["Disciplinas"],
        summary: "Buscar Disciplina por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Disciplina" },
              },
            },
          },
          404: { description: "Não encontrado" },
        },
      },
      put: {
        tags: ["Disciplinas"],
        summary: "Atualizar Disciplina",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Disciplina" },
            },
          },
        },
        responses: {
          200: { description: "Atualizado" },
          404: { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["Disciplinas"],
        summary: "Remover Disciplina",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 204: { description: "Deletado" } },
      },
    },
    // Rotas de Matrículas
    "/matriculas": {
      get: {
        tags: ["Matrículas"],
        summary: "Listar todas as Matrículas",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de Matrículas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Matricula" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Matrículas"],
        summary: "Realizar nova Matrícula",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Matricula" },
            },
          },
        },
        responses: {
          201: {
            description: "Matrícula realizada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Matricula" },
              },
            },
          },
        },
      },
    },
    "/matriculas/{id}": {
      get: {
        tags: ["Matrículas"],
        summary: "Buscar Matrícula por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Matricula" },
              },
            },
          },
          404: { description: "Não encontrado" },
        },
      },
      put: {
        tags: ["Matrículas"],
        summary: "Atualizar Matrícula (e.g., adicionar nota)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Matricula" },
            },
          },
        },
        responses: {
          200: { description: "Atualizado" },
          404: { description: "Não encontrado" },
        },
      },
      delete: {
        tags: ["Matrículas"],
        summary: "Remover Matrícula (cancelamento)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: { 204: { description: "Deletado" } },
      },
    },
  },
};

export default swaggerSpec;
