import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';

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

    // Get both sent and received tips
    const sent = await db.tips.findBySenderId(payload.userId, 50);
    const received = await db.tips.findByRecipientId(payload.userId, 50);

    // Combine and sort by date
    const all = [...sent, ...received].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    // Format response
    const formattedTips = all.map((tip) => ({
      id: tip.id,
      txid: tip.txid,
      senderId: tip.sender_id,
      recipientId: tip.recipient_id,
      recipientAddress: tip.recipient_address,
      amount: tip.amount,
      currency: tip.currency,
      status: tip.status,
      memo: tip.memo,
      isAnonymous: tip.is_anonymous,
      direction: tip.sender_id === payload.userId ? 'sent' : 'received',
      createdAt: tip.created_at,
    }));

    return NextResponse.json({
      tips: formattedTips,
      count: formattedTips.length,
    });
  } catch (error) {
    console.error('[v0] Get history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}
