import type { Room, Address } from '../services/roomService';

/**
 * API Response Transformers
 * Validates and transforms API responses to ensure type safety and data integrity.
 */

/**
 * Validates a room object from the API.
 */
export function validateRoom(data: unknown): data is Room {
  if (!data || typeof data !== 'object') return false;
  const room = data as Partial<Room>;
  return (
    typeof room.id === 'string' &&
    typeof room.name === 'string' &&
    typeof room.userId === 'string' &&
    typeof room.isPublic === 'boolean' &&
    typeof room.createdAt === 'string' &&
    typeof room.updatedAt === 'string' &&
    (room.description === null || room.description === undefined || typeof room.description === 'string') &&
    Array.isArray(room.addresses)
  );
}

/**
 * Validates an array of rooms.
 */
export function validateRooms(data: unknown): data is Room[] {
  if (!Array.isArray(data)) return false;
  return data.every(validateRoom);
}

/**
 * Validates an address object from the API.
 */
export function validateAddress(data: unknown): data is Address {
  if (!data || typeof data !== 'object') return false;
  const address = data as Partial<Address>;
  return (
    typeof address.id === 'string' &&
    typeof address.address === 'string' &&
    typeof address.roomId === 'string' &&
    typeof address.createdAt === 'string'
  );
}

/**
 * Transforms and validates room data from API response.
 * Throws an error if validation fails.
 */
export function transformRoom(data: unknown): Room {
  if (!validateRoom(data)) {
    throw new Error('Invalid room data received from API');
  }
  return data;
}

/**
 * Transforms and validates an array of rooms from API response.
 */
export function transformRooms(data: unknown): Room[] {
  if (!validateRooms(data)) {
    throw new Error('Invalid rooms data received from API');
  }
  return data;
}

/**
 * Transforms and validates address data from API response.
 */
export function transformAddresses(data: unknown): Address[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected array of addresses from API');
  }
  const addresses = data.filter(validateAddress);
  if (addresses.length !== data.length) {
    console.warn('Some addresses were filtered out due to validation failures');
  }
  return addresses;
}

/**
 * Sanitizes room input data before sending to API.
 * Removes empty strings from optional fields.
 */
export function sanitizeRoomInput(input: {
  name: string;
  description?: string;
  twitterLink?: string;
  telegramLink?: string;
  discordLink?: string;
}): typeof input {
  const result = { ...input };

  // Convert empty strings to undefined for optional fields
  if (result.description === '') result.description = undefined;
  if (result.twitterLink === '') result.twitterLink = undefined;
  if (result.telegramLink === '') result.telegramLink = undefined;
  if (result.discordLink === '') result.discordLink = undefined;

  return result;
}

/**
 * Formats room data for API request.
 */
export function formatRoomForCreate(input: {
  name: string;
  description?: string;
  twitterLink?: string;
  telegramLink?: string;
  discordLink?: string;
}): ReturnType<typeof sanitizeRoomInput> {
  return sanitizeRoomInput(input);
}

/**
 * Formats room data for API update request.
 * Only includes fields that are defined.
 */
export function formatRoomForUpdate(input: {
  name?: string;
  description?: string;
  twitterLink?: string;
  telegramLink?: string;
  discordLink?: string;
}): Partial<ReturnType<typeof sanitizeRoomInput>> {
  const sanitized = sanitizeRoomInput({
    name: input.name ?? '',
    description: input.description,
    twitterLink: input.twitterLink,
    telegramLink: input.telegramLink,
    discordLink: input.discordLink,
  });

  const result: Partial<typeof sanitized> = {};
  if (input.name !== undefined) result.name = sanitized.name;
  if (input.description !== undefined) result.description = sanitized.description;
  if (input.twitterLink !== undefined) result.twitterLink = sanitized.twitterLink;
  if (input.telegramLink !== undefined) result.telegramLink = sanitized.telegramLink;
  if (input.discordLink !== undefined) result.discordLink = sanitized.discordLink;

  return result;
}
