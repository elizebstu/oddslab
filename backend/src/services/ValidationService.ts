import { z } from 'zod';
import { ValidationError } from '../types/common';
import type { registerSchema, loginSchema, createRoomSchema, addAddressesSchema } from '../types/dtos';

export type ValidationSchema<T> = z.ZodSchema<T>;

export class ValidationService {
  /**
   * Validate data against a Zod schema
   */
  static validate<T>(schema: ValidationSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      const firstError = result.error.errors[0];
      const field = firstError.path.join('.');
      throw new ValidationError(firstError.message, field);
    }

    return result.data;
  }

  /**
   * Sanitize URL fields - convert empty strings to undefined
   */
  static sanitizeUrls(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    const urlFields = ['twitterLink', 'telegramLink', 'discordLink'];

    for (const field of urlFields) {
      if (sanitized[field] === '') {
        sanitized[field] = undefined;
      }
    }

    return sanitized;
  }
}

// Re-export schemas for convenience
export const schemas = {
  register: registerSchema,
  login: loginSchema,
  createRoom: createRoomSchema,
  addAddresses: addAddressesSchema,
};
