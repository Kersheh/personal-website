export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { chatCache } from '../cache';
import { filterContent } from '@/app/utils/contentFilter';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const since = searchParams.get('since');

  const sinceTimestamp = since ? parseInt(since, 10) : undefined;
  const messages = chatCache.getMessages(sinceTimestamp);

  return NextResponse.json(
    {
      messages,
      timestamp: Date.now(),
      success: true
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, username } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required', success: false },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message must be a non-empty string', success: false },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)', success: false },
        { status: 400 }
      );
    }

    const { cleaned } = filterContent(message);

    const existingUser = chatCache.getUser(userId);

    if (!existingUser && username && typeof username === 'string') {
      chatCache.addUser(userId, username);
    }

    const chatMessage = chatCache.addMessage(userId, cleaned.trim());

    if (!chatMessage) {
      return NextResponse.json(
        {
          error: 'User not found. Please join the chat first.',
          success: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: chatMessage,
      success: true
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body', success: false },
      { status: 400 }
    );
  }
}
