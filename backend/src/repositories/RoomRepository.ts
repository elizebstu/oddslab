import { PrismaClient } from '@prisma/client';
import type { IRoomRepository, RoomWithAddresses, RoomCreateInput, RoomUpdateInput } from './interfaces/IRoomRepository';

export class RoomRepository implements IRoomRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<RoomWithAddresses | null> {
    return this.prisma.room.findUnique({
      where: { id },
      include: { addresses: true },
    });
  }

  async findByUser(userId: string): Promise<RoomWithAddresses[]> {
    return this.prisma.room.findMany({
      where: { userId },
      include: { addresses: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic(): Promise<RoomWithAddresses[]> {
    return this.prisma.room.findMany({
      where: { isPublic: true },
      include: { addresses: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(data: RoomCreateInput) {
    return this.prisma.room.create({ data });
  }

  async update(id: string, data: RoomUpdateInput) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.room.delete({ where: { id } });
  }

  async toggleVisibility(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) return null;
    return this.prisma.room.update({
      where: { id },
      data: { isPublic: !room.isPublic },
    });
  }

  async belongsToUser(roomId: string, userId: string): Promise<boolean> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { userId: true },
    });
    return room?.userId === userId;
  }
}
