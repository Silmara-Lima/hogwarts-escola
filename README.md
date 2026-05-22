# 🧙 Sistema de Gerenciamento Hogwarts

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Sistema para gerenciamento da escola Hogwarts, incluindo alunos, professores, casas, turmas e disciplinas.

---

## 📋 Visão Geral

O **Sistema de Hogwarts** é uma aplicação fullstack que permite:

- ✅ Gerenciar secretários e controle de acesso
- ✅ Cadastro e gestão de professores e alunos
- ✅ Busca avançada e filtros em tempo real
- ✅ Interface intuitiva e responsiva
- ✅ API REST documentada com Swagger

---

## 🏗️ Arquitetura

### Estrutura do Projeto

```
.
├── hogwarts-api/ # Backend (Node.js + TypeScript)
│ ├── src/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── routes/
│ │ ├── middlewares/
│ │ ├── schemas/
│ │ ├── database/
│ │ └── index.ts
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── migrations/
│ └── package.json
│
├── hogwarts-frontend/ # Frontend (React + TypeScript)
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ ├── services/
│ │ ├── schemas/
│ │ ├── types/
│ │ ├── App.tsx
│ │ └── main.tsx
│ └── package.json
```

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnologia     | Versão | Propósito                 |
| -------------- | ------ | ------------------------- |
| **Node.js**    | 18+    | Runtime JavaScript        |
| **Express.js** | 5.1    | Framework web             |
| **TypeScript** | 5.9    | Tipagem estática          |
| **Prisma**     | 6.16   | ORM moderno               |
| **PostgreSQL** | Latest | Banco de dados relacional |
| **Zod**        | 4.1    | Validação de esquemas     |
| **Swagger**    | 6.2    | Documentação da API       |
| **bcryptjs**   | 3.0    | Hash seguro de senhas     |

### Frontend

| Tecnologia       | Versão | Propósito          |
| ---------------- | ------ | ------------------ |
| **React**        | 19     | Biblioteca UI      |
| **TypeScript**   | 5.8    | Tipagem estática   |
| **Vite**         | 7.1    | Build tool moderno |
| **Material-UI**  | 7.3    | Componentes UI     |
| **Axios**        | 1.12   | Cliente HTTP       |
| **React Router** | 6.30   | Roteamento         |
| **Zod**          | 4.1    | Validação          |

---

## 🚀 Guia de Instalação e Setup

### 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 10+ ou **yarn** 4+
- **Git**

### 1️⃣ Clone o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd hogwarts-api
```

**Credenciais do banco:**

- Host: `localhost`
- Porta: `5434`
- Usuário: `postgres`
- Senha: `postgres`
- Banco: `hogwarts`

### 3️⃣ Configure o Backend

```bash
cd hogwarts-api
npm install
npx prisma generate
npx prisma migrate dev
```

**Variáveis de ambiente** (`.env`):

```env
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/hogwarts"
PORT=3000
```

**Inicie o servidor:**

```bash
npm run dev
```

Servidor rodando em: **[http://localhost:3000](http://localhost:3000)**
Swagger disponível em: **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

### 4️⃣ Configure o Frontend

```bash
cd ../hogwarts-frontend
npm install
npm run dev
```

Aplicação disponível em: **[http://localhost:5173](http://localhost:5173)**

---

## 📚 Documentação da API

**Swagger**: **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

Endpoints principais:

- 🔑 `/login`
- 👤 `/secretarios`
- 👩‍🏫 `/professores`
- 🧑 `/alunos`
- 🏠 `/casas`
- 📚 `/turmas`
- 📝 `/disciplinas`

Todos podem ser testados via **Swagger UI** ou **cURL**.

---

## 🎨 Funcionalidades do Frontend

- 🔐 Login seguro e dashboard interativo
- 👥 CRUD de Alunos, Professores e Secretários
- 🏠 Gerenciamento de Casas e Turmas
- 📚 Gestão de Disciplinas e aulas ministradas
- 🔍 Busca e filtros em tempo real
- 🎨 Tema escuro e responsivo com Material-UI

---

## 📊 Modelo de Dados (Resumo)

- **Secretario** → id, nome, email, telefone
- **Professor** → id, nome, email, matrícula, disciplinasMinistradas
- **Aluno** → id, nome, email, matrícula, casaId, turmaId
- **Casa** → id, nome, diretor, cor
- **Turma** → id, série, turno, cursoId
- **Disciplina** → id, nome, cargaHoraria, eObrigatoria
- **DisciplinaMinistrada** → vincula disciplina e turmas

---

## 🧪 Testando a Aplicação

1. **Swagger UI**: `http://localhost:3000/api-docs`
2. **Frontend**: `http://localhost:5173`
3. **cURL**: `curl -X GET http://localhost:3000/alunos`

---

## 🔒 Segurança

- Senhas com hash (bcryptjs)
- Validação de dados (Zod)
- Tipagem forte (TypeScript)
- Proteção básica de CORS
- JWT (a implementar para produção)

---

## 📄 Licença

MIT License

---

## 👨‍💻 Autor

**Silmara Lima**

- GitHub: [@silmara](https://github.com/Silmara-Lima)
- Email: [silmara.pereiraspl@gmail.com](mailto:silmara.pereiraspl@gmail.com)
