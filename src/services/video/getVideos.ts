import { VideoData } from '@/model/video';

export const getVideos = async (): Promise<VideoData[]> => {
  const response = await fetch('/api/videos');
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
};

