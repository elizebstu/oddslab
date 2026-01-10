import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { isValidEthereumAddress } from '../utils/validation';

const prisma = new PrismaClient();

export const addAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { addresses } = req.body;
    const userId = req.userId!;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Addresses array is required' });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const invalidAddresses = addresses.filter(addr => !isValidEthereumAddress(addr));
    if (invalidAddresses.length > 0) {
      return res.status(400).json({
        error: 'Invalid Ethereum addresses',
        invalidAddresses
      });
    }

    const createdAddresses = await Promise.all(
      addresses.map(address =>
        prisma.address.upsert({
          where: { address_roomId: { address, roomId } },
          update: {},
          create: { address, roomId },
        })
      )
    );

    res.status(201).json(createdAddresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add addresses' });
  }
};

export const removeAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, addressId } = req.params;
    const userId = req.userId!;

    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.address.delete({ where: { id: addressId } });

    res.json({ message: 'Address removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove address' });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { addresses: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isPublic && room.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(room.addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};
