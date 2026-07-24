import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/schemas';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { getNewAddress } from '@/lib/zcash';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, username, password, displayName } = validationResult.data;

    // Check if user already exists
    const existingByEmail = await db.users.findByEmail(email);
    const existingByUsername = await db.users.findByUsername(username);

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    if (existingByUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate new Zcash address
    const zcashAddress = await getNewAddress();

    // Create user
    const userId = uuidv4();
    const user = await db.users.create({
      id: userId,
      email,
      username,
      passwordHash,
      displayName,
      zcashAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Set refresh token as HTTP-only cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          zcashAddress: user.zcashAddress,
        },
        accessToken,
      },
      { status: 201 }
    );

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account', errorMessage: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
