import api from './api';

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  content: string;
  roomId: string;
  userId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  urls?: string[];
  hasPolymarketLink?: boolean;
}

const ensureArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data;
  console.error('Expected array but got:', data);
  return [];
};

export const postService = {
  // Create a new post (room owner only)
  createPost: async (roomId: string, content: string): Promise<Post> => {
    const response = await api.post(`/rooms/${roomId}/posts`, { content });
    return response.data;
  },

  // Get posts for a room
  getPosts: async (roomId: string): Promise<Post[]> => {
    const response = await api.get(`/rooms/${roomId}/posts`);
    return ensureArray<Post>(response.data);
  },

  // Delete a post (room owner only)
  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}`);
  },

  // Add a comment to a post
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  // Get comments for a post
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await api.get(`/posts/${postId}/comments`);
    return ensureArray<Comment>(response.data);
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
