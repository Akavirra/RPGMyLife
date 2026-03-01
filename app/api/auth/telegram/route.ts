import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramInitData, getOrCreateUser, createSessionToken } from '@/lib/telegram/verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json(
        { error: 'initData is required' },
        { status: 400 }
      );
    }

    // Verify Telegram initData
    const telegramUser = await verifyTelegramInitData(initData);
    if (!telegramUser) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    // Get or create user in database
    const user = await getOrCreateUser(telegramUser);

    // Create session token
    const token = await createSessionToken(user.id);

    // Set cookie with token
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        avatarUrl: user.avatarUrl,
        level: user.level,
        totalXp: user.totalXp,
      },
      isNew: user.isNew,
    });

    // Set HTTP-only cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session');

  if (!sessionToken?.value) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Return current user info
  // In a real app, we'd verify the token and fetch user
  return NextResponse.json({
    authenticated: true,
  });
}
