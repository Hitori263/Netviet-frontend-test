export const likeVideo = async (videoId: string, isLiked: boolean): Promise<{ success: boolean; likesCount: number }> => {
  const response = await fetch('/api/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoId, isLiked }),
  });
  if (!response.ok) {
    throw new Error('Failed to like video');
  }
  return response.json();
};

