import api from './api';

export interface Room {
  id: string;
  name: string;
  description?: string | null;
  twitterLink?: string | null;
  telegramLink?: string | null;
  discordLink?: string | null;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  address: string;
  roomId: string;
  createdAt: string;
  userName?: string | null;
}

export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem' | 'split' | 'merge' | 'reward' | 'conversion' | 'maker_rebate';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
}

export interface PositionHolder {
  address: string;
  userName?: string;
  shares: number;
  value: number;
}

export interface Position {
  market: string;
  outcome: string;
  totalValue: number;
  totalShares: number;
  avgPrice: number;
  currentPrice: number;
  cashPnl: number;
  percentPnl: number;
  holders?: PositionHolder[];
}

const ensureArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data;
  console.error('Expected array but got:', data);
  return [];
};

export const roomService = {
  createRoom: async (
    name: string,
    description?: string,
    twitterLink?: string,
    telegramLink?: string,
    discordLink?: string
  ): Promise<Room> => {
    const response = await api.post('/rooms', {
      name,
      description,
      twitterLink,
      telegramLink,
      discordLink,
    });
    return response.data;
  },

  updateRoom: async (
    id: string,
    name?: string,
    description?: string,
    twitterLink?: string,
    telegramLink?: string,
    discordLink?: string
  ): Promise<Room> => {
    const response = await api.patch(`/rooms/${id}`, {
      name,
      description,
      twitterLink,
      telegramLink,
      discordLink,
    });
    return response.data;
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return ensureArray<Room>(response.data);
  },

  getRoom: async (id: string): Promise<Room> => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },

  toggleVisibility: async (id: string): Promise<Room> => {
    const response = await api.patch(`/rooms/${id}/visibility`);
    return response.data;
  },

  getPublicRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms/public/all');
    return ensureArray<Room>(response.data);
  },
};
