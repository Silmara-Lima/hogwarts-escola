// =========================================================================
// validationMiddleware
// =========================================================================

import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

interface ValidationIssue {
  campo: string;
  mensagem: string;
}

// =========================================================================
// validateBody
// =========================================================================
export const validateBody = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
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
      next(error);
    }
  };
};

// =========================================================================
// validateParams
// =========================================================================
export const validateParams = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
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

// =========================================================================
// validateQuery
// =========================================================================
export const validateQuery = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
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
