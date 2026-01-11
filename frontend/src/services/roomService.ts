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

  addAddresses: async (roomId: string, addresses: string[]): Promise<Address[]> => {
    const response = await api.post(`/addresses/${roomId}/addresses`, { addresses });
    return response.data;
  },

  removeAddress: async (roomId: string, addressId: string): Promise<void> => {
    await api.delete(`/addresses/${roomId}/addresses/${addressId}`);
  },

  getActivities: async (roomId: string): Promise<Activity[]> => {
    const response = await api.get(`/rooms/${roomId}/activities`);
    return response.data;
  },

  getPositions: async (roomId: string): Promise<Position[]> => {
    const response = await api.get(`/rooms/${roomId}/positions`);
    return response.data;
  },

  getPublicRooms: async (): Promise<Room[]> => {
    const response = await api.get('/rooms/public/all');
    return response.data;
  },
};

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
}
