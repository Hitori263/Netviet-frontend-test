export const likeComment = async (commentId: string, isLiked: boolean): Promise<{ success: boolean; likes: number }> => {
  const response = await fetch('/api/comments/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commentId, isLiked }),
  });
  if (!response.ok) {
    throw new Error('Failed to like comment');
  }
  return response.json();
};

