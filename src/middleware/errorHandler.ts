import { Request, Response, NextFunction } from "express";

/**
 * Custom API Error class with status code.
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware.
 * Logs errors server-side and returns sanitized responses to clients.
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the full error server-side
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Check if it's an operational error (expected) or programming error
  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // For production, hide internal error details
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    res.status(500).json({
      error: "An unexpected error occurred. Please try again later.",
    });
  } else {
    // In development, show more details
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
};

/**
 * Async handler wrapper to catch errors in async route handlers.
 * Eliminates the need for try-catch in every controller.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for undefined routes.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
};
