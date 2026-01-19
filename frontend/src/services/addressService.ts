import api from './api';
import type { Address } from './roomService';

const ensureArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data;
  console.error('Expected array but got:', data);
  return [];
};

export const addressService = {
  addAddresses: async (roomId: string, addresses: string[]): Promise<Address[]> => {
    const response = await api.post(`/addresses/${roomId}/addresses`, { addresses });
    return ensureArray<Address>(response.data);
  },

  removeAddress: async (roomId: string, addressId: string): Promise<void> => {
    await api.delete(`/addresses/${roomId}/addresses/${addressId}`);
  },

  getAddresses: async (roomId: string): Promise<Address[]> => {
    const response = await api.get(`/addresses/${roomId}/addresses`);
    return ensureArray<Address>(response.data);
  },

  getAddressProfiles: async (roomId: string): Promise<Address[]> => {
    const response = await api.get(`/addresses/${roomId}/profiles`);
    return ensureArray<Address>(response.data);
  },
};
