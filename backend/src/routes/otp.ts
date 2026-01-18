import { Router } from 'express';
import {
  sendLoginOtp,
  loginWithOtp,
  sendResetOtp,
  resetPassword,
  checkOtpExpiry,
} from '../controllers/otpController';

const router = Router();

// Send OTP for login
router.post('/login/send', sendLoginOtp);

// Login with OTP
router.post('/login/verify', loginWithOtp);

// Send OTP for password reset
router.post('/reset/send', sendResetOtp);

// Reset password with OTP
router.post('/reset/verify', resetPassword);

// Check OTP expiry
router.get('/expiry', checkOtpExpiry);

export default router;
