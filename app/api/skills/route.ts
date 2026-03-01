import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { skills } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/telegram/verify';

// GET /api/skills - Get all skills
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

    const allSkills = await db.query.skills.findMany({
      where: eq(skills.userId, session.userId),
    });

    return NextResponse.json({ skills: allSkills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/skills - Create new skill
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
    const { name, description, iconUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [newSkill] = await db.insert(skills)
      .values({
        userId: session.userId,
        name,
        description: description || null,
        iconUrl: iconUrl || null,
        xp: 0,
        level: 1,
      })
      .returning();

    return NextResponse.json({ skill: newSkill }, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
