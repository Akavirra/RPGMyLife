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
  chain: 1.2,   // Part of a chain, bonus XP
};

/**
 * Calculate XP reward for a quest based on difficulty and type
 * @param difficulty - Quest difficulty (1-5)
 * @param type - Quest type (once/daily/weekly/chain)
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
    chain: 'Ланцюговий',
  };
  return labels[type] || 'Одноразовий';
}

/**
 * Calculate XP penalty for failed quest
 * @param xpReward - Original XP reward
 * @returns Penalty amount (10% of reward)
 */
export function calculateFailurePenalty(xpReward: number): number {
  return Math.round(xpReward * 0.1);
}
