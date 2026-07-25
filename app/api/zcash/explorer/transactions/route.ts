import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { getExplorerTransactions, CipherscanTransaction } from '@/lib/zcash';

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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const transactions = await getExplorerTransactions(user.zcash_address, page, limit);

    // Convert satoshis to ZEC and format for frontend
    const formattedTransactions = transactions.map((tx: CipherscanTransaction) => ({
      txid: tx.txid,
      blockHeight: tx.blockHeight,
      blockTime: tx.blockTime,
      size: tx.size,
      hasSapling: tx.hasSapling,
      hasOrchard: tx.hasOrchard,
      hasIronwood: tx.hasIronwood,
      inputValue: tx.inputValue / 100000000,
      outputValue: tx.outputValue / 100000000,
      netChange: tx.netChange / 100000000,
      counterparty: tx.counterparty,
      senderCount: tx.senderCount,
      recipientCount: tx.recipientCount,
    }));

    return NextResponse.json({
      address: user.zcash_address,
      transactions: formattedTransactions,
      page,
      limit,
    });
  } catch (error) {
    console.error('Get explorer transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions from explorer' },
      { status: 500 }
    );
  }
}
