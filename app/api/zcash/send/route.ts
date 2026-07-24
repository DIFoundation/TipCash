import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendTransaction, validateAddress } from '@/lib/zcash';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const sendSchema = z.object({
  toAddress: z.string(),
  amount: z.number().positive(),
  memo: z.string().optional(),
});

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

    // Validate input
    const validationResult = sendSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { toAddress, amount, memo } = validationResult.data;

    // Get sender user
    const sender = await db.users.findById(payload.userId);
    if (!sender) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate recipient address
    const recipientValid = await validateAddress(toAddress);
    if (!recipientValid.isvalid) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      );
    }

    // Send transaction
    const txid = await sendTransaction({
      from: sender.zcashAddress,
      to: toAddress,
      amount,
      memo,
    });

    // Create tip record
    const tip = await db.tips.create({
      id: uuidv4(),
      senderId: payload.userId,
      recipientAddress: toAddress,
      amount,
      currency: 'ZEC',
      txid,
      status: 'pending',
      memo,
      isAnonymous: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      tipId: tip.id,
      txid,
      amount,
      address: toAddress,
      status: 'pending',
      memo,
    });
  } catch (error) {
    console.error('[v0] Send transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to send transaction' },
      { status: 500 }
    );
  }
}
