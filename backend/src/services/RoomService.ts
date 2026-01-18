import type { IRoomRepository, IAddressRepository } from '../repositories';
import type { CreateRoomDto, UpdateRoomDto, RoomWithAddresses } from '../types/dtos';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../types/common';
import { logger } from '../utils/logger';

export interface RoomServiceDependencies {
  roomRepository: IRoomRepository;
  addressRepository: IAddressRepository;
}

export class RoomService {
  constructor(private deps: RoomServiceDependencies) {}

  async createRoom(dto: CreateRoomDto, userId: string): Promise<RoomWithAddresses> {
    const room = await this.deps.roomRepository.create({
      name: dto.name,
      description: dto.description,
      twitterLink: dto.twitterLink,
      telegramLink: dto.telegramLink,
      discordLink: dto.discordLink,
      userId,
    });

    logger.info(`Room created: ${room.id} by user: ${userId}`);

    return { ...room, addresses: [] };
  }

  async getRooms(userId: string): Promise<RoomWithAddresses[]> {
    return this.deps.roomRepository.findByUser(userId);
  }

  async getRoom(id: string, requestingUserId?: string): Promise<RoomWithAddresses> {
    const room = await this.deps.roomRepository.findById(id);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (!room.isPublic && room.userId !== requestingUserId) {
      throw new ForbiddenError('This room is private');
    }

    return room;
  }

  async updateRoom(id: string, dto: UpdateRoomDto, userId: string): Promise<RoomWithAddresses> {
    const room = await this.deps.roomRepository.findById(id);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.userId !== userId) {
      throw new ForbiddenError('You can only edit your own rooms');
    }

    const updatedRoom = await this.deps.roomRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.twitterLink !== undefined && { twitterLink: dto.twitterLink || null }),
      ...(dto.telegramLink !== undefined && { telegramLink: dto.telegramLink || null }),
      ...(dto.discordLink !== undefined && { discordLink: dto.discordLink || null }),
    });

    logger.info(`Room updated: ${id} by user: ${userId}`);

    return { ...updatedRoom, addresses: room.addresses };
  }

  async deleteRoom(id: string, userId: string): Promise<void> {
    const room = await this.deps.roomRepository.findById(id);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.userId !== userId) {
      throw new ForbiddenError('You can only delete your own rooms');
    }

    await this.deps.roomRepository.delete(id);

    logger.info(`Room deleted: ${id} by user: ${userId}`);
  }

  async toggleVisibility(id: string, userId: string): Promise<RoomWithAddresses> {
    const room = await this.deps.roomRepository.findById(id);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.userId !== userId) {
      throw new ForbiddenError('You can only change your own rooms');
    }

    const updatedRoom = await this.deps.roomRepository.toggleVisibility(id);

    logger.info(`Room visibility toggled: ${id} by user: ${userId}`);

    return { ...updatedRoom!, addresses: room.addresses };
  }

  async getPublicRooms(): Promise<RoomWithAddresses[]> {
    return this.deps.roomRepository.findPublic();
  }
}
