import 'server-only';
import { db } from '../db';
import { users, quests } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { getBot } from './bot';

/**
 * Send notification to a user via Telegram
 */
export async function sendTelegramNotification(
  telegramId: string,
  message: string,
  parseMode?: 'Markdown' | 'HTML'
): Promise<boolean> {
  try {
    const bot = getBot();
    await bot.api.sendMessage(telegramId, message, {
      parse_mode: parseMode || 'Markdown',
    });
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Send quest completed notification
 */
export async function notifyQuestCompleted(
  userId: number,
  questTitle: string,
  xpReward: number,
  newLevel?: number,
  oldLevel?: number
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.telegramId) return false;

  let message = `✅ *Квест виконано!*\n\n`;
  message += `📜 ${questTitle}\n`;
  message += `✨ +${xpReward} XP\n`;

  if (newLevel && newLevel > (oldLevel || 0)) {
    message += `\n🎉 *Новий рівень: ${newLevel}!*`;
  }

  return sendTelegramNotification(user.telegramId, message, 'Markdown');
}

/**
 * Send quest failed notification
 */
export async function notifyQuestFailed(
  userId: number,
  questTitle: string,
  xpPenalty: number
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.telegramId) return false;

  const message = `❌ *Квест провалено!*\n\n📜 ${questTitle}\n\nВтрачено: -${xpPenalty} XP\n\nНе здавайся, спробуй знову!`;

  return sendTelegramNotification(user.telegramId, message, 'Markdown');
}

/**
 * Send level up notification
 */
export async function notifyLevelUp(
  userId: number,
  newLevel: number,
  totalXp: number
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.telegramId) return false;

  const titles: Record<number, string> = {
    5: 'Новачок',
    10: 'Підмайстер',
    20: 'Справжній воїн',
    30: 'Досвідчений мандрівник',
    40: 'Майстер',
    50: 'Легенда',
  };

  const title = Object.entries(titles)
    .filter(([lvl]) => newLevel >= parseInt(lvl))
    .pop()?.[1] || 'Гравець';

  let message = `🎊 *Новий рівень досягнуто!*\n\n`;
  message += `🏆 Рівень: *${newLevel}*\n`;
  message += `✨ Всього XP: ${totalXp}\n`;
  message += `📛 Титул: ${title}\n\n`;
  message += `Продовжуй свій шлях до величі!`;

  return sendTelegramNotification(user.telegramId, message, 'Markdown');
}

/**
 * Send quest deadline reminder
 */
export async function notifyDeadlineReminder(
  userId: number,
  questTitle: string,
  deadline: Date
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.telegramId) return false;

  let formattedDate = deadline.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `⏰ *Нагадування про квест!*\n\n`;
  message += `📜 ${questTitle}\n`;
  message += `Дедлайн: ${formattedDate}\n\n`;
  message += `Поспіши, час минає!`;

  return sendTelegramNotification(user.telegramId, message, 'Markdown');
}

/**
 * Send daily quest reset notification
 */
export async function notifyDailyQuestsReset(userId: number): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.telegramId) return false;

  let message = `🌅 *Новий день — нові можливості!*\n\n`;
  message += `Твої щоденні квести поновлено.\n`;
  message += `Відкрий додаток, щоб побачити нові завдання!`;

  return sendTelegramNotification(user.telegramId, message, 'Markdown');
}

/**
 * Broadcast message to all users (admin function)
 */
export async function broadcastToAllUsers(message: string): Promise<number> {
  const allUsers = await db.select().from(users);

  let successCount = 0;
  for (const user of allUsers) {
    if (user.telegramId) {
      const sent = await sendTelegramNotification(user.telegramId, message);
      if (sent) successCount++;
    }
  }

  return successCount;
}
