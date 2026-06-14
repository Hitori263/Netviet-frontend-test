export const deleteComment = async (videoId: string, commentId: string): Promise<{ success: boolean; commentsCount: number }> => {
  const response = await fetch('/api/comments', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId, commentId }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
  return response.json();
};
