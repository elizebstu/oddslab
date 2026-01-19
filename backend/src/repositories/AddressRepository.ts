import { PrismaClient, Prisma } from '@prisma/client';
import type { IAddressRepository } from './interfaces/IAddressRepository';

export class AddressRepository implements IAddressRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.address.findUnique({ where: { id } });
  }

  async findByRoom(roomId: string) {
    return this.prisma.address.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.AddressCreateInput) {
    return this.prisma.address.create({ data });
  }

  async upsert(data: Prisma.AddressUpsertArgs) {
    return this.prisma.address.upsert(data);
  }

  async delete(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  async deleteByRoom(roomId: string) {
    return this.prisma.address.deleteMany({ where: { roomId } });
  }

  async existsInRoom(address: string, roomId: string): Promise<boolean> {
    const existing = await this.prisma.address.findUnique({
      where: { address_roomId: { address, roomId } },
      select: { id: true },
    });
    return existing !== null;
  }

  async upsertMany(addresses: string[], roomId: string) {
    return Promise.all(
      addresses.map(address =>
        this.prisma.address.upsert({
          where: { address_roomId: { address, roomId } },
          update: {},
          create: { address, roomId },
        })
      )
    );
  }
}
