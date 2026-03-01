import 'server-only';
import { db } from '../db';
import { users, skills, activityLog } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getLevelFromXp } from './level';

/**
 * Check and apply level up for user
 * @param userId - User ID
 * @param currentTotalXp - Current total XP after any rewards
 * @returns Object with new level and whether level up occurred
 */
export async function checkLevelUp(userId: number, currentTotalXp: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return { leveledUp: false, newLevel: 1, oldLevel: 1 };

  const oldLevel = user.level;
  const newLevel = getLevelFromXp(currentTotalXp);

  if (newLevel > oldLevel) {
    // Update user's level
    await db.update(users)
      .set({ level: newLevel, totalXp: currentTotalXp })
      .where(eq(users.id, userId));

    // Log level up event
    await db.insert(activityLog)
      .values({
        userId,
        eventType: 'level_up',
        metadata: {
          oldLevel,
          newLevel,
          totalXp: currentTotalXp,
        },
      });

    return { leveledUp: true, newLevel, oldLevel };
  }

  // Update XP even if no level up
  await db.update(users)
    .set({ totalXp: currentTotalXp })
    .where(eq(users.id, userId));

  return { leveledUp: false, newLevel, oldLevel };
}

/**
 * Check and apply level up for skill
 * @param skillId - Skill ID
 * @param currentSkillXp - Current skill XP
 * @returns Object with new level and whether level up occurred
 */
export async function checkSkillLevelUp(skillId: number, currentSkillXp: number) {
  const skill = await db.query.skills.findFirst({
    where: eq(skills.id, skillId),
  });

  if (!skill) return { leveledUp: false, newLevel: 1, oldLevel: 1 };

  const oldLevel = skill.level;
  const newLevel = getLevelFromXp(currentSkillXp);

  if (newLevel > oldLevel) {
    // Update skill level
    await db.update(skills)
      .set({ level: newLevel, xp: currentSkillXp, updatedAt: new Date() })
      .where(eq(skills.id, skillId));

    return { leveledUp: true, newLevel, oldLevel };
  }

  // Update XP even if no level up
  await db.update(skills)
    .set({ xp: currentSkillXp, updatedAt: new Date() })
    .where(eq(skills.id, skillId));

  return { leveledUp: false, newLevel, oldLevel };
}
