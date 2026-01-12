import api from './api';
import type { Address } from './roomService';

export const addressService = {
  addAddresses: async (roomId: string, addresses: string[]): Promise<Address[]> => {
    const response = await api.post(`/addresses/${roomId}/addresses`, { addresses });
    return response.data;
  },

  removeAddress: async (roomId: string, addressId: string): Promise<void> => {
    await api.delete(`/addresses/${roomId}/addresses/${addressId}`);
  },

  getAddressProfiles: async (roomId: string): Promise<Address[]> => {
    const response = await api.get(`/addresses/${roomId}/profiles`);
    return response.data;
  },
};
