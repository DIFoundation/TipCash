import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const links = await db.receiveLinks.findByUserId(payload.userId);

    return NextResponse.json({
      links,
      count: links.length,
    });
  } catch (error) {
    console.error('[v0] Get receive links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receive links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isAnonymous = false, usesRemaining = 1, expiresAt } = body;

    const token_generated = uuidv4();

    const link = await db.receiveLinks.create({
      id: uuidv4(),
      userId: payload.userId,
      token: token_generated,
      isAnonymous,
      usesRemaining,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdAt: new Date(),
    });

    return NextResponse.json({
      link,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tip/${token_generated}`,
    }, { status: 201 });
  } catch (error) {
    console.error('[v0] Create receive link error:', error);
    return NextResponse.json(
      { error: 'Failed to create receive link' },
      { status: 500 }
    );
  }
}
