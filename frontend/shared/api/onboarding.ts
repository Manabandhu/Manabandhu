import apiClient from './client';

export interface OnboardingData {
  displayName?: string;
  country?: string;
  city?: string;
  role?: string;
  purposes?: string[];
  interests?: string[];
  homepagePriorities?: string[];
  enabledPriorities?: string[];
  onboardingCompleted?: boolean;
}

export const onboardingApi = {
  updateOnboarding: async (data: OnboardingData) => {
    const response = await apiClient.patch('/api/users/me/onboarding', data);
    return response.data;
  },
};
