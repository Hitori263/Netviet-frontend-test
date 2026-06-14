import { Comment } from '@/model/video';

export const getComments = async (videoId: string): Promise<Comment[]> => {
  const response = await fetch(`/api/comments?videoId=${encodeURIComponent(videoId)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
};

