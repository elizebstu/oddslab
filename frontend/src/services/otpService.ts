import api from './api';

export const otpService = {
  // Send OTP for login
  sendLoginOtp: async (email: string): Promise<void> => {
    await api.post('/otp/login/send', { email });
  },

  // Login with OTP
  loginWithOtp: async (email: string, code: string) => {
    const response = await api.post('/otp/login/verify', { email, code });
    return response.data;
  },

  // Send OTP for password reset
  sendResetOtp: async (email: string): Promise<void> => {
    await api.post('/otp/reset/send', { email });
  },

  // Reset password with OTP
  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    await api.post('/otp/reset/verify', { email, code, newPassword });
  },

  // Check OTP expiry
  checkOtpExpiry: async (email: string, type: 'login' | 'reset_password'): Promise<{ exists: boolean; remainingSeconds: number }> => {
    const response = await api.get('/otp/expiry', { params: { email, type } });
    return response.data;
  },
};
