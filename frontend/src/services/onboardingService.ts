import api from './api';

export interface OnboardingStatus {
  dashboard: boolean;
  feed: boolean;
  explore: boolean;
}

export const onboardingService = {
  getOnboardingStatus: async (): Promise<OnboardingStatus> => {
    const response = await api.get('/onboarding');
    return response.data;
  },

  updateOnboardingStatus: async (page: keyof OnboardingStatus, completed: boolean): Promise<OnboardingStatus> => {
    const response = await api.patch('/onboarding', { page, completed });
    return response.data;
  },

  skipOnboarding: async (): Promise<OnboardingStatus> => {
    const response = await api.post('/onboarding/skip');
    return response.data;
  },
};
