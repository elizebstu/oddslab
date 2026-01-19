import { Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ValidationService, schemas } from '../services/ValidationService';
import { handleControllerError, sendSuccess } from '../types/common';
import type { AuthRequest } from '../middleware/auth';
import prisma from '../db/prisma';
import { UserRepository } from '../repositories';

// Lazy initialization function
function getAuthService() {
  const userRepository = new UserRepository(prisma);
  return new AuthService({ userRepository });
}

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const dto = ValidationService.validate(schemas.register, req.body);
    const authService = getAuthService();
    const result = await authService.register(dto);
    sendSuccess(res, result, 201);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const dto = ValidationService.validate(schemas.login, req.body);
    const authService = getAuthService();
    const result = await authService.login(dto);
    sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error);
  }
};
