import type { Room, Address, Prisma } from '@prisma/client';

export interface IRoomRepository {
  findById(id: string): Promise<RoomWithAddresses | null>;
  findByUser(userId: string): Promise<RoomWithAddresses[]>;
  findPublic(): Promise<RoomWithAddresses[]>;
  create(data: Prisma.RoomCreateInput): Promise<Room>;
  update(id: string, data: Prisma.RoomUpdateInput): Promise<Room>;
  delete(id: string): Promise<Room>;
  toggleVisibility(id: string): Promise<Room>;
  belongsToUser(roomId: string, userId: string): Promise<boolean>;
}

export type RoomWithAddresses = Room & {
  addresses: Address[];
};

export type RoomCreateInput = {
  name: string;
  description?: string;
  twitterLink?: string;
  telegramLink?: string;
  discordLink?: string;
  userId: string;
};

export type RoomUpdateInput = {
  name?: string;
  description?: string;
  twitterLink?: string;
  telegramLink?: string;
  discordLink?: string;
};
