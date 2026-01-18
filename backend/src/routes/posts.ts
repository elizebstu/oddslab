import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createPost,
  getPosts,
  deletePost,
  addComment,
  getComments,
  deleteComment,
} from '../controllers/postController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Post routes
router.post('/rooms/:roomId/posts', createPost);
router.get('/rooms/:roomId/posts', getPosts);
router.delete('/posts/:postId', deletePost);

// Comment routes
router.post('/posts/:postId/comments', addComment);
router.get('/posts/:postId/comments', getComments);
router.delete('/comments/:commentId', deleteComment);

export default router;
