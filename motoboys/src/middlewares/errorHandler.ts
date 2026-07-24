import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
}

/**
 * Middleware global de erros para Express
 * Garante que exceções internas não expõem detalhes do Prisma/SQL ou stack traces em produção.
 */
export function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[ERROR] ${req.method} ${req.path} - ${err.message}`, {
    stack: isProduction ? undefined : err.stack,
  });

  const responseBody = {
    error: isProduction && statusCode === 500 
      ? 'Ocorreu um erro interno no servidor.' 
      : err.message || 'Erro interno no servidor.',
    ...(isProduction ? {} : { stack: err.stack }),
  };

  return res.status(statusCode).json(responseBody);
}
