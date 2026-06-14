import { NextResponse } from 'next/server';
import { mockVideos } from '@/services/mockdata/mockVideos';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const video = mockVideos.find((v) => v.id === id);
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }
      return NextResponse.json(video);
    }
    
    return NextResponse.json(mockVideos);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { videoId, isLiked } = await request.json();
    const video = mockVideos.find((v) => v.id === videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Mutate and persist video likes count on the server process
    if (isLiked) {
      video.likesCount += 1;
    } else {
      video.likesCount = Math.max(0, video.likesCount - 1);
    }

    return NextResponse.json({ success: true, likesCount: video.likesCount });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
