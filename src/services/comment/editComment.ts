import { Comment } from '@/model/video';

export const editComment = async (videoId: string, commentId: string, text: string): Promise<Comment> => {
  const response = await fetch('/api/comments', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId, commentId, text }),
  });
  if (!response.ok) {
    throw new Error('Failed to edit comment');
  }
  return response.json();
};
