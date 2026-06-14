import { NextResponse } from 'next/server';
import { mockCurrentUser } from '@/services/mockdata/mockUser';

export async function GET() {
  return NextResponse.json(mockCurrentUser);
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    Object.assign(mockCurrentUser, updates);
    return NextResponse.json(mockCurrentUser);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
