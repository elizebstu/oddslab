import type { IRoomRepository, IAddressRepository } from '../repositories';
import { resolveUsernameToAddress, checkIfBot } from './polymarketService';
import { isValidEthereumAddress } from '../utils/validation';
import { NotFoundError, ForbiddenError } from '../types/common';
import { logger } from '../utils/logger';

export interface AddressServiceDependencies {
  roomRepository: IRoomRepository;
  addressRepository: IAddressRepository;
}

export interface AddressResolutionResult {
  resolved: string[];
  notFound: string[];
  botAddresses: string[];
}

export class AddressService {
  constructor(private deps: AddressServiceDependencies) {}

  async addAddressesToRoom(
    inputs: string[],
    roomId: string,
    userId: string
  ): Promise<{ created: string[]; notFound: string[]; botAddresses: string[] }> {
    const room = await this.deps.roomRepository.findById(roomId);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.userId !== userId) {
      throw new ForbiddenError('You can only add addresses to your own rooms');
    }

    const resolution = await this.resolveAddresses(inputs);

    if (resolution.notFound.length > 0) {
      logger.warn(`Could not resolve usernames for room ${roomId}:`, { notFound: resolution.notFound });
      return { created: [], notFound: resolution.notFound, botAddresses: resolution.botAddresses };
    }

    if (resolution.botAddresses.length > 0) {
      logger.warn(`Bot addresses detected for room ${roomId}:`, { botAddresses: resolution.botAddresses });
      return { created: [], notFound: [], botAddresses: resolution.botAddresses };
    }

    const created = await this.deps.addressRepository.upsertMany(resolution.resolved, roomId);

    logger.info(`Added ${created.length} addresses to room ${roomId}`);

    return {
      created: created.map(a => a.address),
      notFound: [],
      botAddresses: [],
    };
  }

  async removeAddress(addressId: string, roomId: string, userId: string): Promise<void> {
    const room = await this.deps.roomRepository.findById(roomId);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.userId !== userId) {
      throw new ForbiddenError('You can only remove addresses from your own rooms');
    }

    await this.deps.addressRepository.delete(addressId);

    logger.info(`Removed address ${addressId} from room ${roomId}`);
  }

  async getAddresses(roomId: string, requestingUserId?: string): Promise<string[]> {
    const room = await this.deps.roomRepository.findById(roomId);

    if (!room) {
      throw new NotFoundError('Room');
    }

    if (!room.isPublic && room.userId !== requestingUserId) {
      throw new ForbiddenError('This room is private');
    }

    return room.addresses.map(a => a.address);
  }

  private async resolveAddresses(inputs: string[]): Promise<AddressResolutionResult> {
    const resolved: string[] = [];
    const notFound: string[] = [];
    const botAddresses: string[] = [];

    for (const input of inputs) {
      const trimmed = input.trim();
      if (!trimmed) continue;

      if (isValidEthereumAddress(trimmed)) {
        const botCheck = await checkIfBot(trimmed);
        if (botCheck?.isBot) {
          botAddresses.push(trimmed);
        } else {
          resolved.push(trimmed);
        }
      } else if (this.isUsername(trimmed)) {
        const address = await resolveUsernameToAddress(trimmed);
        if (address) {
          const botCheck = await checkIfBot(address);
          if (botCheck?.isBot) {
            botAddresses.push(trimmed);
          } else {
            resolved.push(address);
          }
        } else {
          notFound.push(trimmed);
        }
      } else {
        notFound.push(trimmed);
      }
    }

    return { resolved, notFound, botAddresses };
  }

  private isUsername(input: string): boolean {
    const trimmed = input.trim();
    return !trimmed.startsWith('0x') && trimmed.length < 42;
  }
}
