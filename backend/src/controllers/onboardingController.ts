import { Response } from 'express';
import { handleControllerError, sendSuccess } from '../types/common';
import type { AuthRequest } from '../middleware/auth';
import prisma from '../db/prisma';

export interface OnboardingStatus {
  dashboard: boolean;
  feed: boolean;
  explore: boolean;
}

export const getOnboardingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { onboardingStatus: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return default status if null
    const status = user.onboardingStatus as OnboardingStatus | null;
    sendSuccess(res, status || { dashboard: false, feed: false, explore: false });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateOnboardingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page, completed } = req.body;

    if (typeof page !== 'string' || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    if (!['dashboard', 'feed', 'explore'].includes(page)) {
      return res.status(400).json({ error: 'Invalid page name' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { onboardingStatus: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentStatus = (user.onboardingStatus as OnboardingStatus | null) || {
      dashboard: false,
      feed: false,
      explore: false,
    };

    const updatedStatus = {
      ...currentStatus,
      [page]: completed,
    };

    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingStatus: updatedStatus as any },
    });

    sendSuccess(res, updatedStatus);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const skipOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const skippedStatus = {
      dashboard: true,
      feed: true,
      explore: true,
    };

    await prisma.user.update({
      where: { id: req.userId },
      data: { onboardingStatus: skippedStatus as any },
    });

    sendSuccess(res, skippedStatus);
  } catch (error) {
    handleControllerError(res, error);
  }
};
