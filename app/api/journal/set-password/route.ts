import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken, hashPassword, generateSalt } from '@/lib/auth';

// POST /api/journal/set-password - Set journal password
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

    // Use the same salt as user's account or generate new one
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        salt: true,
      },
    });

    const salt = user?.salt || generateSalt();
    const passwordHash = await hashPassword(password, salt);

    // Update user's journal password
    await db.update(users)
      .set({
        journalPasswordHash: passwordHash,
        salt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting journal password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
