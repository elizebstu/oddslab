import { Response } from 'express';
import { RoomService } from '../services/RoomService';
import { ValidationService, schemas } from '../services/ValidationService';
import { handleControllerError, sendSuccess, sendSuccessMessage } from '../types/common';
import type { AuthRequest } from '../middleware/auth';
import prisma from '../db/prisma';
import { RoomRepository, AddressRepository } from '../repositories';

// Lazy initialization function
function getRoomService() {
  const roomRepository = new RoomRepository(prisma);
  const addressRepository = new AddressRepository(prisma);
  return new RoomService({ roomRepository, addressRepository });
}

function getParamId(params: { id?: unknown }): string {
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  if (!id) throw new Error('Invalid id parameter');
  return id as string;
}

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const sanitized = ValidationService.sanitizeUrls(req.body);
    const dto = ValidationService.validate(schemas.createRoom, sanitized);
    const userId = req.userId!;
    const roomService = getRoomService();
    const result = await roomService.createRoom(dto, userId);
    sendSuccess(res, result, 201);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const roomService = getRoomService();
    const result = await roomService.getRooms(userId);
    sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params);
    const roomService = getRoomService();
    const result = await roomService.getRoom(id, req.userId);
    sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params);
    const userId = req.userId!;
    const roomService = getRoomService();
    await roomService.deleteRoom(id, userId);
    sendSuccessMessage(res, 'Room deleted successfully');
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const toggleVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params);
    const userId = req.userId!;
    const roomService = getRoomService();
    const result = await roomService.toggleVisibility(id, userId);
    sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const id = getParamId(req.params);
    const sanitized = ValidationService.sanitizeUrls(req.body);
    const dto = ValidationService.validate(schemas.updateRoom, sanitized);
    const userId = req.userId!;
    const roomService = getRoomService();
    const result = await roomService.updateRoom(id, dto, userId);
    sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getPublicRooms = async (req: AuthRequest, res: Response) => {
  try {
    const roomService = getRoomService();
    const result = await roomService.getPublicRooms();
    sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error);
  }
};
