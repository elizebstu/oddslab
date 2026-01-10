import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { createRoom, getRooms, getRoom, deleteRoom, toggleVisibility, getPublicRooms } from '../controllers/roomController';
import { getActivities } from '../controllers/activityController';

const router = Router();

router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, getRooms);
router.get('/public/all', getPublicRooms);  // Get all public rooms - no auth required
router.get('/:id', optionalAuthMiddleware, getRoom);  // Public rooms accessible without auth
router.delete('/:id', authMiddleware, deleteRoom);
router.patch('/:id/visibility', authMiddleware, toggleVisibility);
router.get('/:roomId/activities', optionalAuthMiddleware, getActivities);  // Public rooms accessible without auth

export default router;
