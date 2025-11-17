import { prisma } from "../database/prisma";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Aluno, Professor, Secretario } from "@prisma/client";

type Role = "ALUNO" | "PROFESSOR" | "SECRETARIO";

type BaseUser = Aluno | Professor | Secretario;

type User = BaseUser & { role: Role };

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "7d";

const findUserByEmail = async (email: string): Promise<User | null> => {
  let user: BaseUser | null;

  user = await prisma.secretario.findUnique({ where: { email } });
  if (user) {
    return { ...user, role: "SECRETARIO" } as User;
  }

  user = await prisma.professor.findUnique({ where: { email } });
  if (user) {
    return { ...user, role: "PROFESSOR" } as User;
  }

  user = await prisma.aluno.findUnique({ where: { email } });
  if (user) {
    return { ...user, role: "ALUNO" } as User;
  }

  return null;
};

export const login = async (email: string, password: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não está configurado no ambiente.");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Credenciais inválidas.");
  }

  const passwordMatch = await bcrypt.compare(password, user.senha);
  if (!passwordMatch) {
    throw new Error("Credenciais inválidas.");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  const { senha, ...userData } = user;

  return {
    token,
    user: userData,
  };
};
