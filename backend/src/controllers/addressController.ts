import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { isValidEthereumAddress } from '../utils/validation';
import { resolveUsernameToAddress } from '../services/polymarketService';

const prisma = new PrismaClient();

/**
 * Check if input looks like a username (not an Ethereum address)
 */
function isUsername(input: string): boolean {
  const trimmed = input.trim();
  // Usernames don't start with 0x and are shorter than 42 characters
  return !trimmed.startsWith('0x') && trimmed.length < 42;
}

export const addAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { addresses } = req.body;
    const userId = req.userId!;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Addresses array is required' });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId as string } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Separate addresses and usernames
    const resolvedAddresses: string[] = [];
    const notFound: string[] = [];

    for (const input of addresses) {
      const trimmed = input.trim();

      if (!trimmed) continue;

      // If it's a valid Ethereum address, use it directly
      if (isValidEthereumAddress(trimmed)) {
        resolvedAddresses.push(trimmed);
        continue;
      }

      // If it looks like a username, try to resolve it
      if (isUsername(trimmed)) {
        const address = await resolveUsernameToAddress(trimmed);
        if (address) {
          resolvedAddresses.push(address);
        } else {
          notFound.push(trimmed);
        }
      } else {
        notFound.push(trimmed);
      }
    }

    // If any usernames couldn't be resolved, return an error
    if (notFound.length > 0) {
      return res.status(400).json({
        error: 'Could not resolve some usernames or addresses',
        notFound
      });
    }

    // All inputs resolved successfully, add to database
    const createdAddresses = await Promise.all(
      resolvedAddresses.map(address =>
        prisma.address.upsert({
          where: { address_roomId: { address, roomId: roomId as string } },
          update: {},
          create: { address, roomId: roomId as string }
        })
      )
    );

    res.status(201).json(createdAddresses);
  } catch (error) {
    console.error('Error adding addresses:', error);
    res.status(500).json({ error: 'Failed to add addresses' });
  }
};

export const removeAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, addressId } = req.params;
    const userId = req.userId!;

    const room = await prisma.room.findUnique({ where: { id: roomId as string } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.address.delete({ where: { id: addressId as string } });

    res.json({ message: 'Address removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove address' });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId as string },
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
