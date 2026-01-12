import api from './api';

export interface Room {
  id: string;
  name: string;
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
}

export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
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
}

export const roomService = {
  createRoom: async (name: string): Promise<Room> => {
    const response = await api.post('/rooms', { name });
    return response.data;
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data;
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
    return response.data;
  },
};
