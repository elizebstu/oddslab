import { Response } from 'express';
import { AddressService } from '../services/AddressService';
import { ValidationService, schemas } from '../services/ValidationService';
import { handleControllerError, sendSuccess, sendSuccessMessage } from '../types/common';
import type { AuthRequest } from '../middleware/auth';
import prisma from '../db/prisma';
import { RoomRepository, AddressRepository } from '../repositories';

// Lazy initialization functions
function getAddressService() {
  const roomRepository = new RoomRepository(prisma);
  const addressRepository = new AddressRepository(prisma);
  return new AddressService({ roomRepository, addressRepository });
}

function getRoomRepository() {
  return new RoomRepository(prisma);
}

function getAddressRepository() {
  return new AddressRepository(prisma);
}

function getParamId(params: { roomId?: unknown; addressId?: unknown }): { roomId: string; addressId?: string } {
  const roomId = typeof params.roomId === 'string' ? params.roomId : Array.isArray(params.roomId) ? params.roomId[0] : '';
  if (!roomId) throw new Error('Invalid roomId parameter');

  const addressId = typeof params.addressId === 'string' ? params.addressId : Array.isArray(params.addressId) ? params.addressId[0] : undefined;

  return { roomId, addressId };
}

export const addAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = getParamId(req.params);
    const userId = req.userId!;
    const dto = ValidationService.validate(schemas.addAddresses, req.body);

    const addressService = getAddressService();
    const result = await addressService.addAddressesToRoom(dto.addresses, roomId, userId);

    if (result.notFound.length > 0) {
      res.status(400).json({
        error: 'Could not find Polymarket users',
        notFound: result.notFound,
      });
      return;
    }

    if (result.botAddresses.length > 0) {
      res.status(400).json({
        error: 'Cannot add bot addresses (300+ trades/hour)',
        botAddresses: result.botAddresses,
      });
      return;
    }

    const addressRepository = getAddressRepository();
    const createdAddresses = await addressRepository.findByRoom(roomId);
    sendSuccess(res, createdAddresses, 201);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const removeAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, addressId } = getParamId(req.params);
    if (!addressId) throw new Error('Invalid addressId parameter');

    const userId = req.userId!;
    const addressService = getAddressService();
    await addressService.removeAddress(addressId, roomId, userId);
    sendSuccessMessage(res, 'Address removed successfully');
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = getParamId(req.params);
    const addressService = getAddressService();

    // Verify access first
    await addressService.getAddresses(roomId, req.userId);

    // Return full Address objects
    const addressRepository = getAddressRepository();
    const addresses = await addressRepository.findByRoom(roomId);
    sendSuccess(res, addresses);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getAddressProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = getParamId(req.params);
    const roomRepository = getRoomRepository();

    const room = await roomRepository.findById(roomId);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.isPublic && room.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { fetchProfilesFromActivities } = await import('../services/polymarket/profileCache');
    const addressList = room.addresses.map(a => a.address);
    const profileMap = await fetchProfilesFromActivities(addressList);

    const addressesWithProfiles = room.addresses.map((addr) => {
      const profile = profileMap.get(addr.address.toLowerCase());
      return {
        ...addr,
        userName: profile?.name || profile?.username || null,
      };
    });

    sendSuccess(res, addressesWithProfiles);
  } catch (error) {
    handleControllerError(res, error);
  }
};
