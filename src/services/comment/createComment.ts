import { Comment } from '@/model/video';

export const createComment = async (videoId: string, text: string): Promise<Comment> => {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId, text }),
  });
  if (!response.ok) {
    throw new Error('Failed to create comment');
  }
  return response.json();
};

