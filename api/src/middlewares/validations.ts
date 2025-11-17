import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

// Interface para estruturar os erros de validação
interface ValidationIssue {
  campo: string;
  mensagem: string;
}

// Middleware para validar o body da requisição
export const validateBody = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      // Substitui o body original pelos dados validados
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues: ValidationIssue[] = error.issues.map((err: ZodIssue) => ({
          campo: err.path.join("."),
          mensagem: err.message,
        }));

        return res.status(400).json({
          message: "Dados de entrada inválidos (BODY)",
          errors: issues,
        });
      }
      // Passa outros tipos de erro adiante
      next(error);
    }
  };
};

// Middleware para validar parâmetros da URL (ex: /professores/:id)
export const validateParams = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      // Substitui os parâmetros originais pelos validados
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues: ValidationIssue[] = error.issues.map((err: ZodIssue) => ({
          campo: err.path.join("."),
          mensagem: err.message,
        }));

        return res.status(400).json({
          message: "Parâmetros inválidos (URL PARAMS)",
          errors: issues,
        });
      }
      next(error);
    }
  };
};

// Middleware para validar query parameters (ex: /alunos?casa=Grifinoria)
export const validateQuery = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      // Substitui os query parameters originais pelos validados
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues: ValidationIssue[] = error.issues.map((err: ZodIssue) => ({
          campo: err.path.join("."),
          mensagem: err.message,
        }));

        return res.status(400).json({
          message: "Parâmetros de consulta inválidos (QUERY)",
          errors: issues,
        });
      }
      next(error);
    }
  };
};
