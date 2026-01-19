import type { Response } from 'express';
import { logger } from '../utils/logger';
import type { ApiError, ApiResponse } from './dtos';

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Handle controller errors with consistent response format
 */
export function handleControllerError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    const response: ApiError = { error: error.message };
    if (error instanceof ValidationError && error.field) {
      response.field = error.field;
    }
    logger.error(error.message, error);
    res.status(error.statusCode).json(response);
    return;
  }

  if (error instanceof Error) {
    logger.error('Unexpected error', error);
    res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    return;
  }

  logger.error('Unknown error', String(error));
  res.status(500).json({ error: 'An unexpected error occurred' });
}

/**
 * Send a success response (backward compatible - returns data directly)
 */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json(data);
}

/**
 * Send a success response with a message
 */
export function sendSuccessMessage(res: Response, message: string, statusCode: number = 200): void {
  res.status(statusCode).json({ message });
}
