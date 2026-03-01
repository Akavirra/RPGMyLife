import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper handling
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Ukrainian locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('uk-UA', options || {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 години тому")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'щойно';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${declension(diffMinutes, ['хвилина', 'хвилини', 'хвилин'])} тому`;
  } else if (diffHours < 24) {
    return `${diffHours} ${declension(diffHours, ['година', 'години', 'годин'])} тому`;
  } else if (diffDays < 7) {
    return `${diffDays} ${declension(diffDays, ['день', 'дні', 'днів'])} тому`;
  } else {
    return formatDate(d);
  }
}

/**
 * Declension helper for Ukrainian language
 */
export function declension(num: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[num % 100 > 4 && num % 100 < 20 ? 2 : cases[num % 10 < 5 ? num % 10 : 5]];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse query params from URL
 */
export function parseQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Get difficulty color based on level
 */
export function getDifficultyColor(difficulty: number): string {
  const colors: Record<number, string> = {
    1: 'text-green-400',
    2: 'text-yellow-400',
    3: 'text-orange-400',
    4: 'text-red-400',
    5: 'text-purple-400',
  };
  return colors[difficulty] || 'text-gray-400';
}

/**
 * Get status color for quests
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-500',
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}

/**
 * Format XP with suffix
 */
export function formatXp(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Calculate time remaining until deadline
 */
export function getTimeRemaining(deadline: Date | string): string {
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Прострочено';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} ${declension(diffDays, ['день', 'дні', 'днів'])}`;
  } else if (diffHours > 0) {
    return `${diffHours} ${declension(diffHours, ['година', 'години', 'годин'])}`;
  } else {
    return `${diffMinutes} ${declension(diffMinutes, ['хвилина', 'хвилини', 'хвилин'])}`;
  }
}
