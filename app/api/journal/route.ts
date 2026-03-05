import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { journal, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken, hashPassword } from '@/lib/auth';

// GET /api/journal - Get all journal entries for user (requires journal password)
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

    // Check if user has a journal password set
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        journalPasswordHash: true,
      },
    });

    // If no journal password, return empty array (user needs to set password first)
    if (!user?.journalPasswordHash) {
      return NextResponse.json({ 
        entries: [],
        hasPassword: false 
      });
    }

    const entries = await db.query.journal.findMany({
      where: eq(journal.userId, session.userId),
      orderBy: (journal, { desc }) => [desc(journal.createdAt)],
    });

    return NextResponse.json({ 
      entries,
      hasPassword: true
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/journal - Create new journal entry
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
    const { title, content, mood, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const result = await db.insert(journal)
      .values({
        userId: session.userId,
        title,
        content,
        mood: mood || null,
        tags: tags || null,
      })
      .returning();

    return NextResponse.json({ entry: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
