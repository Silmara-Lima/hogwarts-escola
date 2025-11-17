// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Aluno, Professor, Secretario } from "@prisma/client";

// Define as funções (roles) que a API utiliza
type UserRole = "ALUNO" | "PROFESSOR" | "SECRETARIO";

// Definição de tipos para o objeto de usuário que será anexado ao Request
interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Extende a interface Request do Express para incluir o campo 'user'
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para verificar o JWT.
 * Anexa o usuário (id, email, role) à requisição se o token for válido.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Obtém o token do cabeçalho 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  if (!JWT_SECRET) {
    // Isso deve ser verificado na inicialização do servidor, mas é uma proteção extra
    console.error("JWT_SECRET não configurado.");
    return res
      .status(500)
      .json({ message: "Erro de configuração do servidor." });
  }

  try {
    // 2. Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 3. Anexa os dados do usuário à requisição
    req.user = decoded;

    // 4. Continua para a próxima função (rota ou outro middleware)
    next();
  } catch (error: any) {
    // Token inválido, expirado, ou malformado
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expirado. Por favor, faça login novamente." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
};

/**
 * Middleware para verificar a autorização com base na função (role) do usuário.
 * @param allowedRoles Lista de funções permitidas (Ex: ['SECRETARIO', 'PROFESSOR']).
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verifica se o usuário foi anexado pelo middleware 'authenticate'
    if (!req.user) {
      // Se 'authenticate' não foi executado ou falhou, retorna erro 401
      return res.status(401).json({ message: "Não autenticado." });
    }

    const userRole = req.user.role;

    // 1. Verifica se a função do usuário está na lista de funções permitidas
    if (allowedRoles.includes(userRole)) {
      // 2. Permissão concedida
      next();
    } else {
      // 3. Permissão negada
      return res.status(403).json({
        message: `Acesso proibido. Requer função: ${allowedRoles.join(
          " ou "
        )}.`,
      });
    }
  };
};
