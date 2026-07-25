import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { getExplorerBalance } from '@/lib/zcash';

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

    const user = await db.users.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.zcash_address) {
      return NextResponse.json(
        { error: 'No Zcash address found for user' },
        { status: 400 }
      );
    }

    const balance = await getExplorerBalance(user.zcash_address);

    return NextResponse.json({
      address: user.zcash_address,
      balance: balance / 100000000, // Convert from satoshis to ZEC
      currency: 'ZEC',
    });
  } catch (error) {
    console.error('Get explorer balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance from explorer' },
      { status: 500 }
    );
  }
}
