import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.userId!;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await prisma.room.create({
      data: { name, userId },
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const rooms = await prisma.room.findMany({
      where: { userId },
      include: { addresses: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: id as string },
      include: { addresses: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isPublic && room.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const room = await prisma.room.findUnique({ where: { id: id as string } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.room.delete({ where: { id: id as string } });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

export const toggleVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const room = await prisma.room.findUnique({ where: { id: id as string } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: id as string },
      data: { isPublic: !room.isPublic },
    });

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room visibility' });
  }
};

export const getPublicRooms = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isPublic: true },
      include: { addresses: true },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public rooms' });
  }
};
