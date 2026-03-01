import { db } from '../db';
import { users, skills, activityLog } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Calculate level from total XP using exponential growth formula
 * Level grows as: level = floor(0.1 * sqrt(totalXp))
 * This creates a gentle curve where:
 * - XP 0 = Level 1
 * - XP 100 = Level 10
 * - XP 400 = Level 20
 * - XP 900 = Level 30
 * - XP 1600 = Level 40
 * - XP 2500 = Level 50
 */
export function getLevelFromXp(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.floor(0.1 * Math.sqrt(totalXp)) + 1;
}

/**
 * Calculate XP required for next level
 * @param currentLevel - Current level
 * @returns XP needed to reach next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  // XP threshold formula: level^2 * 100
  // Level 1->2: 100 XP
  // Level 2->3: 400 XP
  // Level 3->4: 900 XP
  // etc.
  return currentLevel * currentLevel * 100;
}

/**
 * Calculate XP required for specific level
 * @param targetLevel - Target level
 * @returns Total XP required for target level
 */
export function getXpForLevel(targetLevel: number): number {
  // Sum of squares formula
  // This is the inverse of our level formula
  const levelMinusOne = targetLevel - 1;
  return levelMinusOne * levelMinusOne * 100;
}

/**
 * Get current level progress (percentage to next level)
 * @param totalXp - User's total XP
 * @returns Progress percentage (0-100)
 */
export function getLevelProgress(totalXp: number): number {
  const currentLevel = getLevelFromXp(totalXp);
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  
  if (xpNeededForNext === 0) return 100;
  
  return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));
}

/**
 * Get XP needed to reach next level
 * @param totalXp - User's total XP
 * @returns XP remaining for next level
 */
export function getXpToNextLevel(totalXp: number): number {
  const currentLevel = getLevelFromXp(totalXp);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  return Math.max(0, nextLevelXp - totalXp);
}

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

/**
 * Get level title based on level number (Ukrainian)
 */
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Новачок';
  if (level < 10) return 'Підмайстер';
  if (level < 20) return 'Справжній воїн';
  if (level < 30) return 'Досвідчений мандрівник';
  if (level < 40) return 'Майстер';
  if (level < 50) return 'Легенда';
  return 'Неймовірний';
}
