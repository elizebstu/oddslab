import { Router } from 'express';
import { getOnboardingStatus, updateOnboardingStatus, skipOnboarding } from '../controllers/onboardingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All onboarding routes require authentication
router.use(authMiddleware);

router.get('/', getOnboardingStatus);
router.patch('/', updateOnboardingStatus);
router.post('/skip', skipOnboarding);

export default router;
