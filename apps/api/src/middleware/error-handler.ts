import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: 'VALIDATION_ERROR',
      details: err.errors,
    });
  }

  console.error('Error:', err);
  res.status(500).json({
    ok: false,
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
}

