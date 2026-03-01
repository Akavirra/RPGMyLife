import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quests, questSkills, questCharacters, activityLog } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/telegram/verify';
import { calculateXpReward } from '@/lib/game/xp';

// GET /api/quests - Get all quests for user
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = db.query.quests.findMany({
      where: eq(quests.userId, session.userId),
    });

    if (status) {
      query = db.query.quests.findMany({
        where: and(
          eq(quests.userId, session.userId),
          eq(quests.status, status as 'draft' | 'active' | 'completed' | 'failed')
        ),
      });
    }

    if (type) {
      query = db.query.quests.findMany({
        where: and(
          eq(quests.userId, session.userId),
          eq(quests.type, type as 'once' | 'daily' | 'weekly' | 'chain')
        ),
      });
    }

    const allQuests = await db.query.quests.findMany({
      where: eq(quests.userId, session.userId),
    });

    // Filter by status and type in memory if needed
    let filteredQuests = allQuests;
    if (status) {
      filteredQuests = filteredQuests.filter(q => q.status === status);
    }
    if (type) {
      filteredQuests = filteredQuests.filter(q => q.type === type);
    }

    return NextResponse.json({ quests: filteredQuests });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quests - Create new quest
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
    const { title, description, type, difficulty, deadline, locationId, parentQuestId, characterIds, skillIds } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Calculate XP reward based on difficulty and type
    const xpReward = calculateXpReward(difficulty || 1, type || 'once');

    // Create quest
    const [newQuest] = await db.insert(quests)
      .values({
        userId: session.userId,
        title,
        description: description || null,
        status: 'draft',
        type: type || 'once',
        difficulty: difficulty || 1,
        xpReward,
        deadline: deadline ? new Date(deadline) : null,
        locationId: locationId || null,
        parentQuestId: parentQuestId || null,
      })
      .returning();

    // Add linked characters
    if (characterIds && characterIds.length > 0) {
      const questCharacterRecords = characterIds.map((characterId: number) => ({
        questId: newQuest.id,
        characterId,
      }));
      await db.insert(questCharacters).values(questCharacterRecords);
    }

    // Add linked skills with XP amounts
    if (skillIds && skillIds.length > 0) {
      const questSkillRecords = skillIds.map((skillId: number) => ({
        questId: newQuest.id,
        skillId,
        xpAmount: Math.round(xpReward / skillIds.length), // Distribute XP among skills
      }));
      await db.insert(questSkills).values(questSkillRecords);
    }

    // Log event
    await db.insert(activityLog)
      .values({
        userId: session.userId,
        questId: newQuest.id,
        eventType: 'quest_created',
        metadata: { title, difficulty, type },
      });

    return NextResponse.json({ quest: newQuest }, { status: 201 });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
