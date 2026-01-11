import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { createRoom, getRooms, getRoom, deleteRoom, toggleVisibility, getPublicRooms } from '../controllers/roomController';
import { getActivities, getPositions } from '../controllers/activityController';

const router = Router();

router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, getRooms);
router.get('/public/all', getPublicRooms);
router.get('/:id', optionalAuthMiddleware, getRoom);
router.delete('/:id', authMiddleware, deleteRoom);
router.patch('/:id/visibility', authMiddleware, toggleVisibility);
router.get('/:roomId/activities', optionalAuthMiddleware, getActivities);
router.get('/:roomId/positions', optionalAuthMiddleware, getPositions);

export default router;
