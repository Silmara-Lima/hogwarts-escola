// =========================================================================
// authMiddleware
// =========================================================================

import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// Define as funções (roles) que a API utiliza
export type UserRole = "ALUNO" | "PROFESSOR" | "SECRETARIO";

// Definição de tipos para o objeto de usuário anexado ao Request
interface DecodedToken {
  id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// =========================================================================
// authenticate
// =========================================================================
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET não configurado.");
    return res
      .status(500)
      .json({ message: "Erro de configuração do servidor." });
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expirado. Por favor, faça login novamente." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
};

// =========================================================================
// authorize
// =========================================================================
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({
        message: `Acesso proibido. Requer função: ${allowedRoles.join(
          " ou "
        )}.`,
      });
    }
  };
};
