// XP calculation based on difficulty (1-5)
// Base XP values scaled by difficulty
export const BASE_XP_VALUES = {
  1: 10,   // Легко (Easy)
  2: 25,   // Нормально (Normal)
  3: 50,   // Складно (Hard)
  4: 100,  // Дуже складно (Very Hard)
  5: 200,  // Легендарний (Legendary)
};

// Quest type multipliers
export const QUEST_TYPE_MULTIPLIERS = {
  once: 1.0,    // Single completion
  daily: 0.7,   // Repeatable, less XP per completion
  weekly: 0.8,  // Less frequent, moderate XP
};

/**
 * Calculate XP reward for a quest based on difficulty and type
 * @param difficulty - Quest difficulty (1-5)
 * @param type - Quest type (once/daily/weekly)
 * @returns Calculated XP reward
 */
export function calculateXpReward(difficulty: number, type: keyof typeof QUEST_TYPE_MULTIPLIERS = 'once'): number {
  const baseXp = BASE_XP_VALUES[difficulty as keyof typeof BASE_XP_VALUES] || BASE_XP_VALUES[1];
  const multiplier = QUEST_TYPE_MULTIPLIERS[type] || 1.0;
  return Math.round(baseXp * multiplier);
}

/**
 * Get difficulty label in Ukrainian
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: 'Легко',
    2: 'Нормально',
    3: 'Складно',
    4: 'Дуже складно',
    5: 'Легендарний',
  };
  return labels[difficulty] || 'Легко';
}

/**
 * Get quest type label in Ukrainian
 */
export function getQuestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    once: 'Одноразовий',
    daily: 'Щоденний',
    weekly: 'Тижневий',
  };
  return labels[type] || 'Одноразовий';
}

/**
 * Calculate difficulty based on various quest factors
 * Base difficulty is from the user's selection (1-5)
 * Additional factors can increase difficulty:
 * - Linked characters (each adds 0.1)
 * - Linked locations (adds 0.2)
 * - Sub-quests/stages (each adds 0.15)
 * - Limited duration (adds 0.2)
 * 
 * @param baseDifficulty - Base difficulty selected by user (1-5)
 * @param options - Additional options that affect difficulty
 * @returns Calculated difficulty (1-5, rounded)
 */
export function calculateDifficulty(
  baseDifficulty: number,
  options: {
    linkedCharactersCount?: number;
    hasLocation?: boolean;
    subQuestsCount?: number;
    isLimitedDuration?: boolean;
    hasGuild?: boolean;
  } = {}
): number {
  const {
    linkedCharactersCount = 0,
    hasLocation = false,
    subQuestsCount = 0,
    isLimitedDuration = false,
    hasGuild = false,
  } = options;

  // Start with base difficulty (converted to 0-4 scale for calculation)
  let difficultyScore = baseDifficulty - 1;

  // Add modifiers
  difficultyScore += linkedCharactersCount * 0.1;
  difficultyScore += hasLocation ? 0.2 : 0;
  difficultyScore += subQuestsCount * 0.15;
  difficultyScore += isLimitedDuration ? 0.2 : 0;
  difficultyScore += hasGuild ? 0.15 : 0;

  // Convert back to 1-5 scale and clamp
  const calculatedDifficulty = Math.round(difficultyScore + 1);
  return Math.min(5, Math.max(1, calculatedDifficulty));
}

/**
 * Calculate XP penalty for failed quest
 * @param xpReward - Original XP reward
 * @returns Penalty amount (10% of reward)
 */
export function calculateFailurePenalty(xpReward: number): number {
  return Math.round(xpReward * 0.1);
}
