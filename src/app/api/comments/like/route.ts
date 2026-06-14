import { NextResponse } from 'next/server';
import { mockVideos } from '@/services/mockdata/mockVideos';

export async function POST(request: Request) {
  try {
    const { commentId, isLiked } = await request.json();
    let foundComment = null;

    // Locate comment in nested server-side array
    for (const video of mockVideos) {
      const comment = video.comments.find((c) => c.id === commentId);
      if (comment) {
        foundComment = comment;
        break;
      }
    }

    if (!foundComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Mutate and persist likes count on server process
    if (isLiked) {
      foundComment.likes += 1;
    } else {
      foundComment.likes = Math.max(0, foundComment.likes - 1);
    }

    return NextResponse.json({ success: true, likes: foundComment.likes });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
