import type { IRoomRepository, IAddressRepository, RoomWithAddresses } from '../repositories';
import type { CreateRoomDto, UpdateRoomDto } from '../types/dtos';
import { NotFoundError, ForbiddenError } from '../types/common';
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

    return room;
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

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.twitterLink !== undefined) updateData.twitterLink = dto.twitterLink || null;
    if (dto.telegramLink !== undefined) updateData.telegramLink = dto.telegramLink || null;
    if (dto.discordLink !== undefined) updateData.discordLink = dto.discordLink || null;

    const updatedRoom = await this.deps.roomRepository.update(id, updateData);

    logger.info(`Room updated: ${id} by user: ${userId}`);

    return updatedRoom;
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

    if (!updatedRoom) {
      throw new NotFoundError('Room');
    }

    logger.info(`Room visibility toggled: ${id} by user: ${userId}`);

    return updatedRoom;
  }

  async getPublicRooms(): Promise<RoomWithAddresses[]> {
    return this.deps.roomRepository.findPublic();
  }
}
