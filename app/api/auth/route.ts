import { NextRequest, NextResponse } from 'next/server';
import { loginUser, registerUser, createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, firstName, username } = body;

    if (action === 'register') {
      if (!email || !password || !firstName) {
        return NextResponse.json(
          { error: 'Email, password and first name are required' },
          { status: 400 }
        );
      }

      try {
        const { user, isNew } = await registerUser(email, password, firstName, username);
        const token = await createSessionToken(user.id);

        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            avatarUrl: user.avatarUrl,
            level: user.level,
            totalXp: user.totalXp,
          },
          isNew,
        });

        response.cookies.set('session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return response;
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Registration failed' },
          { status: 400 }
        );
      }
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const result = await loginUser(email, password);
      
      if (!result) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const { user, isNew } = result;
      const token = await createSessionToken(user.id);

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          avatarUrl: user.avatarUrl,
          level: user.level,
          totalXp: user.totalXp,
        },
        isNew,
      });

      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
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

  return NextResponse.json({
    authenticated: true,
  });
}
