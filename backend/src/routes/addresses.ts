import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { addAddresses, removeAddress, getAddresses } from '../controllers/addressController';

const router = Router();

router.post('/:roomId/addresses', authMiddleware, addAddresses);
router.delete('/:roomId/addresses/:addressId', authMiddleware, removeAddress);
router.get('/:roomId/addresses', authMiddleware, getAddresses);

export default router;
