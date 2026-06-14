import { NextResponse } from 'next/server';
import { mockVideos } from '@/services/mockdata/mockVideos';
import { mockCurrentUser } from '@/services/mockdata/mockUser';
import { Comment } from '@/model/video';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  const video = mockVideos.find((v) => v.id === videoId);
  return NextResponse.json(video ? video.comments : []);
}

export async function POST(request: Request) {
  try {
    const { videoId, text } = await request.json();
    const video = mockVideos.find((v) => v.id === videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const newComment: Comment = {
      id: `c-added-${Date.now()}`,
      userName: mockCurrentUser.username,
      userAvatar: mockCurrentUser.avatar,
      text,
      timestamp: 'Just now',
      likes: 0,
    };

    // Mutate and persist comment list on the server process
    video.comments.push(newComment);
    video.commentsCount += 1;

    return NextResponse.json(newComment);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { videoId, commentId } = await request.json();
    const video = mockVideos.find((v) => v.id === videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const initialLength = video.comments.length;
    video.comments = video.comments.filter((c) => c.id !== commentId);

    if (video.comments.length < initialLength) {
      video.commentsCount = Math.max(0, video.commentsCount - 1);
      return NextResponse.json({ success: true, commentsCount: video.commentsCount });
    } else {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { videoId, commentId, text } = await request.json();
    const video = mockVideos.find((v) => v.id === videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const comment = video.comments.find((c) => c.id === commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    comment.text = text;
    return NextResponse.json(comment);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
