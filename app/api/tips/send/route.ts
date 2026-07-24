import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyAccessToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendTipSchema } from '@/lib/schemas';
import { sendTransaction } from '@/lib/zcash';
import { v4 as uuidv4 } from 'uuid';

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
    const validationResult = sendTipSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientEmail, recipientUsername, recipientAddress, amount, memo, isAnonymous } = validationResult.data;

    const sender = await db.users.findById(payload.userId);
    if (!sender) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Resolve recipient
    let recipient = null;
    let finalRecipientAddress = recipientAddress;

    if (recipientEmail) {
      recipient = await db.users.findByEmail(recipientEmail);
    } else if (recipientUsername) {
      recipient = await db.users.findByUsername(recipientUsername);
    }

    if (recipient) {
      finalRecipientAddress = recipient.zcashAddress;
    } else if (!finalRecipientAddress) {
      return NextResponse.json(
        { error: 'Could not resolve recipient' },
        { status: 400 }
      );
    }

    // Send transaction
    const txid = await sendTransaction({
      from: sender.zcashAddress,
      to: finalRecipientAddress,
      amount,
      memo: isAnonymous ? 'Anonymous tip' : memo,
    });

    // Create tip record
    const tip = await db.tips.create({
      id: uuidv4(),
      senderId: payload.userId,
      recipientId: recipient?.id,
      recipientAddress: finalRecipientAddress,
      amount,
      currency: 'ZEC',
      txid,
      status: 'pending',
      memo: isAnonymous ? 'Anonymous tip' : memo,
      isAnonymous,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        tipId: tip.id,
        txid,
        recipientId: recipient?.id,
        recipientUsername: recipient?.username,
        amount,
        isAnonymous,
        status: 'pending',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Send tip error:', error);
    return NextResponse.json(
      { error: 'Failed to send tip' },
      { status: 500 }
    );
  }
}
