import { Response } from 'express';
import { RoomService } from '../services/RoomService';
import { handleControllerError, sendSuccess } from '../types/common';
import type { AuthRequest } from '../middleware/auth';
import { fetchPolymarketActivities, fetchPolymarketPositions } from '../services/polymarketService';
import prisma from '../db/prisma';
import { RoomRepository, AddressRepository } from '../repositories';

// Lazy initialization function
function getRoomService() {
  const roomRepository = new RoomRepository(prisma);
  const addressRepository = new AddressRepository(prisma);
  return new RoomService({ roomRepository, addressRepository });
}

function getParamId(params: { roomId?: unknown }): string {
  const roomId = typeof params.roomId === 'string' ? params.roomId : Array.isArray(params.roomId) ? params.roomId[0] : '';
  if (!roomId) throw new Error('Invalid roomId parameter');
  return roomId;
}

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = getParamId(req.params);

    const roomService = getRoomService();
    const room = await roomService.getRoom(roomId, req.userId);
    const addressList = room.addresses.map((a: { address: string }) => a.address);
    const activities = await fetchPolymarketActivities(addressList);

    sendSuccess(res, activities);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getPositions = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = getParamId(req.params);

    const roomService = getRoomService();
    const room = await roomService.getRoom(roomId, req.userId);
    const addressList = room.addresses.map((a: { address: string }) => a.address);
    const positions = await fetchPolymarketPositions(addressList);

    sendSuccess(res, positions);
  } catch (error) {
    handleControllerError(res, error);
  }
};
