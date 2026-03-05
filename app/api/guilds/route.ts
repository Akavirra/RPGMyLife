import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guilds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/auth';

// GET /api/guilds - Get all guilds
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userGuilds = await db.query.guilds.findMany({
      where: eq(guilds.userId, session.userId),
    });

    return NextResponse.json({ guilds: userGuilds });
  } catch (error) {
    console.error('Error fetching guilds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/guilds - Create new guild
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [newGuild] = await db.insert(guilds)
      .values({
        userId: session.userId,
        name,
        description: description || null,
        level: 1,
        xp: 0,
        memberCount: 1,
      })
      .returning();

    return NextResponse.json({ guild: newGuild }, { status: 201 });
  } catch (error) {
    console.error('Error creating guild:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
