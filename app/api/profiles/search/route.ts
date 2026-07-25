import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate
    const validationResult = searchSchema.safeParse({ q: query, limit, offset });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { q, limit: validLimit, offset: validOffset } = validationResult.data;

    // Search users
    const results = await db.users.search(q, validLimit, validOffset);

    const formattedResults = results.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
    }));

    return NextResponse.json({
      results: formattedResults,
      count: formattedResults.length,
      query: q,
    });
  } catch (error) {
    console.error('[v0] Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
