import { Request, Response } from 'express';
import prisma from '../db/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAndSendOtp, verifyOtp, getOtpExpiry } from '../services/otpService';

/**
 * Send OTP for login
 */
export const sendLoginOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await createAndSendOtp(email, 'login');

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

/**
 * Login with OTP
 */
export const loginWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Verify OTP
    const isValid = await verifyOtp(email, code, 'login');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login with OTP error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Send OTP for password reset
 */
export const sendResetOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists (but don't reveal if not found for security)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({ message: 'If the email exists, a reset code has been sent' });
    }

    await createAndSendOtp(email, 'reset_password');

    res.json({ message: 'If the email exists, a reset code has been sent' });
  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({ error: 'Failed to send reset code' });
  }
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify OTP
    const isValid = await verifyOtp(email, code, 'reset_password');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

/**
 * Check OTP expiry status
 */
export const checkOtpExpiry = async (req: Request, res: Response) => {
  try {
    const { email, type } = req.query;

    if (!email || !type) {
      return res.status(400).json({ error: 'Email and type are required' });
    }

    const remainingSeconds = await getOtpExpiry(email as string, type as 'login' | 'reset_password');

    if (remainingSeconds === null) {
      return res.json({ exists: false, remainingSeconds: 0 });
    }

    res.json({ exists: true, remainingSeconds });
  } catch (error) {
    console.error('Check OTP expiry error:', error);
    res.status(500).json({ error: 'Failed to check OTP status' });
  }
};
