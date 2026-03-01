import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quests, users, questSkills, activityLog, skills } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/telegram/verify';
import { checkLevelUp, checkSkillLevelUp } from '@/lib/game/level-server';
import { calculateXpReward, calculateFailurePenalty } from '@/lib/game/xp';
import { notifyQuestCompleted, notifyQuestFailed, notifyLevelUp } from '@/lib/telegram/notifications';

// GET /api/quests/[id] - Get single quest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const questId = parseInt(id);
    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
    }

    const quest = await db.query.quests.findFirst({
      where: and(
        eq(quests.id, questId),
        eq(quests.userId, session.userId)
      ),
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    return NextResponse.json({ quest });
  } catch (error) {
    console.error('Error fetching quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/quests/[id] - Update quest (including complete/fail)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const questId = parseInt(id);
    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
    }

    const quest = await db.query.quests.findFirst({
      where: and(
        eq(quests.id, questId),
        eq(quests.userId, session.userId)
      ),
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, title, description, type, difficulty, deadline, locationId, parentQuestId } = body;

    // Handle quest completion
    if (status === 'completed' && quest.status === 'active') {
      // Award XP to user
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });

      if (user) {
        const newTotalXp = user.totalXp + quest.xpReward;
        
        // Check for level up
        const levelResult = await checkLevelUp(session.userId, newTotalXp);

        // Award XP to linked skills
        const linkedSkills = await db.query.questSkills.findMany({
          where: eq(questSkills.questId, questId),
        });

        for (const link of linkedSkills) {
          const skill = await db.query.skills.findFirst({
            where: eq(skills.id, link.skillId),
          });

          if (skill) {
            const newSkillXp = skill.xp + link.xpAmount;
            await checkSkillLevelUp(link.skillId, newSkillXp);
          }
        }

        // Log completion event
        await db.insert(activityLog)
          .values({
            userId: session.userId,
            questId: quest.id,
            eventType: 'quest_completed',
            metadata: {
              xpReward: quest.xpReward,
              newTotalXp,
              leveledUp: levelResult.leveledUp,
              newLevel: levelResult.newLevel,
            },
          });

        // Send notification
        await notifyQuestCompleted(
          session.userId,
          quest.title,
          quest.xpReward,
          levelResult.newLevel,
          levelResult.oldLevel
        );

        if (levelResult.leveledUp) {
          await notifyLevelUp(session.userId, levelResult.newLevel, newTotalXp);
        }
      }

      // Update quest status
      await db.update(quests)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(quests.id, questId));

      return NextResponse.json({
        success: true,
        message: 'Quest completed!',
        xpAwarded: quest.xpReward,
      });
    }

    // Handle quest failure
    if (status === 'failed' && quest.status === 'active') {
      const penalty = calculateFailurePenalty(quest.xpReward);

      // Apply penalty to user
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });

      if (user) {
        const newTotalXp = Math.max(0, user.totalXp - penalty);
        
        await db.update(users)
          .set({ totalXp: newTotalXp })
          .where(eq(users.id, session.userId));

        // Log failure event
        await db.insert(activityLog)
          .values({
            userId: session.userId,
            questId: quest.id,
            eventType: 'quest_failed',
            metadata: {
              xpPenalty: penalty,
              newTotalXp,
            },
          });

        // Send notification
        await notifyQuestFailed(session.userId, quest.title, penalty);
      }

      // Update quest status
      await db.update(quests)
        .set({ status: 'failed' })
        .where(eq(quests.id, questId));

      return NextResponse.json({
        success: true,
        message: 'Quest failed',
        xpPenalty: penalty,
      });
    }

    // Regular update
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (difficulty !== undefined) {
      updateData.difficulty = difficulty;
      updateData.xpReward = calculateXpReward(difficulty, type || quest.type);
    }
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;
    if (locationId !== undefined) updateData.locationId = locationId;
    if (parentQuestId !== undefined) updateData.parentQuestId = parentQuestId;
    if (status !== undefined) updateData.status = status;

    const [updatedQuest] = await db.update(quests)
      .set(updateData)
      .where(eq(quests.id, questId))
      .returning();

    return NextResponse.json({ quest: updatedQuest });
  } catch (error) {
    console.error('Error updating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/quests/[id] - Delete quest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const questId = parseInt(id);
    if (isNaN(questId)) {
      return NextResponse.json({ error: 'Invalid quest ID' }, { status: 400 });
    }

    const quest = await db.query.quests.findFirst({
      where: and(
        eq(quests.id, questId),
        eq(quests.userId, session.userId)
      ),
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    await db.delete(quests).where(eq(quests.id, questId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
