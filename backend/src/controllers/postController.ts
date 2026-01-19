import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

// Helper function to extract URLs from text
const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
};

// Helper function to detect if text contains Polymarket URLs
const containsPolymarketUrl = (text: string): boolean => {
  const urls = extractUrls(text);
  return urls.some(url => url.includes('polymarket.com'));
};

// Create a new post (room owner only)
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    // Ensure roomId is a string
    const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify user owns the room
    const room = await prisma.room.findUnique({
      where: { id: roomIdStr },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Only room owner can create posts' });
    }

    // Extract URLs from content
    const urls = extractUrls(content);

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        roomId: roomIdStr,
        userId,
        isPinned: true, // Owner posts are pinned by default
      },
    });

    // Return post with extracted URLs
    res.status(201).json({
      ...post,
      urls,
      hasPolymarketLink: containsPolymarketUrl(content),
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Get posts for a room
export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    // Ensure roomId is a string
    const roomIdStr = Array.isArray(roomId) ? roomId[0] : roomId;

    const posts = await prisma.post.findMany({
      where: { roomId: roomIdStr },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    // Process posts to extract URLs
    const processedPosts = posts.map(post => ({
      ...post,
      urls: extractUrls(post.content),
      hasPolymarketLink: containsPolymarketUrl(post.content),
    }));

    res.json(processedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Delete a post (room owner only)
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.userId!;

    // Ensure postId is a string
    const postIdStr = Array.isArray(postId) ? postId[0] : postId;

    const post = await prisma.post.findUnique({
      where: { id: postIdStr },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the room
    const room = await prisma.room.findUnique({
      where: { id: post.roomId },
    });

    if (!room || room.userId !== userId) {
      return res.status(403).json({ error: 'Only room owner can delete posts' });
    }

    await prisma.post.delete({
      where: { id: postIdStr },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Add a comment to a post
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId!;

    // Ensure postId is a string
    const postIdStr = Array.isArray(postId) ? postId[0] : postId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postIdStr },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: postIdStr,
        userId,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for a post
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;

    // Ensure postId is a string
    const postIdStr = Array.isArray(postId) ? postId[0] : postId;

    const comments = await prisma.comment.findMany({
      where: { postId: postIdStr },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete a comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    // Ensure commentId is a string
    const commentIdStr = Array.isArray(commentId) ? commentId[0] : commentId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentIdStr },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is comment author or room owner
    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const room = await prisma.room.findUnique({
      where: { id: post.roomId },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Allow deletion by comment author or room owner
    if (comment.userId !== userId && room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.comment.delete({
      where: { id: commentIdStr },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
