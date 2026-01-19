import type { Room, Address, Prisma } from '@prisma/client';

export interface IRoomRepository {
  findById(id: string): Promise<RoomWithAddresses | null>;
  findByUser(userId: string): Promise<RoomWithAddresses[]>;
  findPublic(): Promise<RoomWithAddresses[]>;
  create(data: Prisma.RoomUncheckedCreateInput): Promise<Room>;
  update(id: string, data: Prisma.RoomUpdateInput): Promise<Room>;
  delete(id: string): Promise<Room>;
  toggleVisibility(id: string): Promise<Room | null>;
  belongsToUser(roomId: string, userId: string): Promise<boolean>;
}

export type RoomWithAddresses = Room & {
  addresses: Address[];
};
