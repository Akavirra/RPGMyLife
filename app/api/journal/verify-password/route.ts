import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken, verifyPassword } from '@/lib/auth';

// POST /api/journal/verify-password - Verify journal password
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Get user's journal password hash
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        journalPasswordHash: true,
        salt: true,
      },
    });

    if (!user?.journalPasswordHash || !user?.salt) {
      return NextResponse.json({ error: 'No password set' }, { status: 400 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.journalPasswordHash, user.salt);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error verifying journal password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
