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
