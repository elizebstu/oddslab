import api from './api';
import type { Activity, Position } from './roomService';

export const activityService = {
  getActivities: async (roomId: string): Promise<Activity[]> => {
    const response = await api.get(`/rooms/${roomId}/activities`);
    return response.data;
  },

  getPositions: async (roomId: string): Promise<Position[]> => {
    const response = await api.get(`/rooms/${roomId}/positions`);
    return response.data;
  },
};
