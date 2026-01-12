import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { addAddresses, removeAddress, getAddresses, getAddressProfiles } from '../controllers/addressController';

const router = Router();

router.post('/:roomId/addresses', authMiddleware, addAddresses);
router.delete('/:roomId/addresses/:addressId', authMiddleware, removeAddress);
router.get('/:roomId/addresses', authMiddleware, getAddresses);
router.get('/:roomId/profiles', optionalAuthMiddleware, getAddressProfiles);

export default router;
