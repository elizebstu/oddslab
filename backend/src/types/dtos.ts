import { z } from 'zod';

// Auth DTOs
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

// Room DTOs
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  twitterLink: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  telegramLink: z.string().url('Invalid Telegram URL').optional().or(z.literal('')),
  discordLink: z.string().url('Invalid Discord URL').optional().or(z.literal('')),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>;

export interface RoomResponse {
  id: string;
  name: string;
  description: string | null;
  twitterLink: string | null;
  telegramLink: string | null;
  discordLink: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  addresses?: AddressResponse[];
}

export interface AddressResponse {
  id: string;
  address: string;
  roomId: string;
  createdAt: Date;
}

// Address DTOs
export const addAddressesSchema = z.object({
  addresses: z.array(z.string().min(1)).min(1, 'At least one address is required'),
});

export type AddAddressesDto = z.infer<typeof addAddressesSchema>;

export interface AddAddressesResponse {
  created: AddressResponse[];
  notFound: string[];
  botAddresses: string[];
}

// Activity DTOs
export interface ActivityResponse {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: Date;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  field?: string;
}
