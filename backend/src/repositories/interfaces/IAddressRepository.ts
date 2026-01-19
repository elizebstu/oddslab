import type { Address, Prisma } from '@prisma/client';

export interface IAddressRepository {
  findById(id: string): Promise<Address | null>;
  findByRoom(roomId: string): Promise<Address[]>;
  create(data: Prisma.AddressCreateInput): Promise<Address>;
  upsert(data: Prisma.AddressUpsertArgs): Promise<Address>;
  delete(id: string): Promise<Address>;
  deleteByRoom(roomId: string): Promise<{ count: number }>;
  existsInRoom(address: string, roomId: string): Promise<boolean>;
  upsertMany(addresses: string[], roomId: string): Promise<Address[]>;
}
