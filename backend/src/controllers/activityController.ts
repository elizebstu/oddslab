import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { fetchPolymarketActivities } from '../services/polymarketService';

const prisma = new PrismaClient();

export const getActivities = async (req: AuthRequest, res: Response) => {
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

    const addressList = room.addresses.map(a => a.address);
    const activities = await fetchPolymarketActivities(addressList);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};
