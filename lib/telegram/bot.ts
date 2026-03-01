import 'server-only';
import { Bot, Keyboard, InlineKeyboard } from 'grammy';
import { db } from '../db';
import { quests, users } from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Initialize Grammy bot
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = botToken ? new Bot(botToken) : null;

// Helper to get bot instance safely
export function getBot() {
  if (!bot) {
    throw new Error('Telegram bot not configured');
  }
  return bot;
}

// Initialize bot and setup handlers
export async function initializeBot() {
  if (!bot) {
    console.log('Telegram bot not initialized (no token)');
    return;
  }
  
  await bot.init();
  setupBot();
  console.log('Telegram bot initialized successfully');
}

// Setup bot commands and handlers
export function setupBot() {
  if (!bot) {
    console.log('Telegram bot not initialized (no token)');
    return;
  }

  // /start command
  bot.command('start', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    const welcomeText = `Вітаю, ${user.first_name}! 🐉

Ти увійшов у світ Life RPG — твою особисту гру для саморозвитку!

Створюй квести, розвивай навички, відкривай нові локації та героїв — все це у твоєму реальному житті.

Натисни кнопку нижче, щоб відкрити додаток:`;

    const keyboard = new Keyboard()
      .text('Відкрити квести 📋')
      .row()
      .text('Моя статистика 📊')
      .row()
      .text('Допомога ℹ️');

    await ctx.reply(welcomeText, {
      reply_markup: keyboard,
    });
  });

  // /quests command - show active quests
  bot.command('quests', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    // Find user by telegram ID
    const userData = await db.query.users.findFirst({
      where: eq(users.telegramId, String(user.id)),
    });

    if (!userData) {
      await ctx.reply('Користувач не знайдений. Спочатку увійди в додаток!');
      return;
    }

    // Get active quests
    const activeQuests = await db.query.quests.findMany({
      where: and(
        eq(quests.userId, userData.id),
        eq(quests.status, 'active')
      ),
      limit: 5,
    });

    if (activeQuests.length === 0) {
      await ctx.reply('У тебе немає активних квестів. Створи новий у додатку!');
      return;
    }

    let message = '📜 Твої активні квести:\n\n';
    
    for (const quest of activeQuests) {
      message += `⚔️ ${quest.title}\n`;
      message += `   Складність: ${'⭐'.repeat(quest.difficulty)}\n`;
      message += `   Нагорода: ${quest.xpReward} XP\n`;
      if (quest.deadline) {
        message += `   Дедлайн: ${quest.deadline.toLocaleDateString('uk-UA')}\n`;
      }
      message += '\n';
    }

    await ctx.reply(message);
  });

  // /stats command - show quick character stats
  bot.command('stats', async (ctx) => {
    const user = ctx.from;
    if (!user) return;

    const userData = await db.query.users.findFirst({
      where: eq(users.telegramId, String(user.id)),
    });

    if (!userData) {
      await ctx.reply('Користувач не знайдений. Спочатку увійди в додаток!');
      return;
    }

    // Count active quests
    const activeQuestsCount = await db.query.quests.findMany({
      where: and(
        eq(quests.userId, userData.id),
        eq(quests.status, 'active')
      ),
    });

    const statsText = `📊 Твоя статистика:

🏆 Рівень: ${userData.level}
✨ Досвід: ${userData.totalXp} XP
📋 Активних квестів: ${activeQuestsCount.length}
🎯 Прогрес: Рівень "${getLevelTitle(userData.level)}"`;

    await ctx.reply(statsText);
  });

  // /help command
  bot.command('help', async (ctx) => {
    const helpText = `ℹ️ Допомога Life RPG:

/start — Почати роботу з ботом
/quests — Показати активні квести
/stats — Твоя статистика
/help — Ця допомога

Квести бувають:
• Одноразові — виконай один раз
• Щоденні — поновлюються щодня
• Тижневі — поновлюються щотижня
• Ланцюгові — залежать від інших квестів

Складність квестів:
⭐ Легко — 10 XP
⭐⭐ Нормально — 25 XP
⭐⭐⭐ Складно — 50 XP
⭐⭐⭐⭐ Дуже складно — 100 XP
⭐⭐⭐⭐⭐ Легендарний — 200 XP`;

    await ctx.reply(helpText);
  });

  // Handle callback queries for quest completion
  bot.callbackQuery(/complete_quest:(\d+)/, async (ctx) => {
    const questId = parseInt(ctx.match![1]);
    const user = ctx.from;

    if (!user) return;

    const userData = await db.query.users.findFirst({
      where: eq(users.telegramId, String(user.id)),
    });

    if (!userData) {
      await ctx.answerCallbackQuery('Користувач не знайдений');
      return;
    }

    const quest = await db.query.quests.findFirst({
      where: and(
        eq(quests.id, questId),
        eq(quests.userId, userData.id)
      ),
    });

    if (!quest) {
      await ctx.answerCallbackQuery('Квест не знайдено');
      return;
    }

    if (quest.status !== 'active') {
      await ctx.answerCallbackQuery('Квест вже не активний');
      return;
    }

    // Complete quest (would call the API here in production)
    await ctx.answerCallbackQuery(`Квест "${quest.title}" виконано! +${quest.xpReward} XP`);
    await ctx.editMessageText(`✅ ${quest.title} — Виконано!`);
  });

  // Handle text button clicks
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;

    if (text === 'Відкрити квести 📋') {
      await ctx.reply('Відкрий додаток: https://your-app.vercel.app/quests');
    } else if (text === 'Моя статистика 📊') {
      await ctx.reply('Натисни /stats для перегляду статистики');
    } else if (text === 'Допомога ℹ️') {
      await ctx.reply('Натисни /help для перегляду допомоги');
    }
  });

  console.log('Telegram bot setup complete');
}

// Get level title helper
function getLevelTitle(level: number): string {
  if (level < 5) return 'Новачок';
  if (level < 10) return 'Підмайстер';
  if (level < 20) return 'Справжній воїн';
  if (level < 30) return 'Досвідчений мандрівник';
  if (level < 40) return 'Майстер';
  if (level < 50) return 'Легенда';
  return 'Неймовірний';
}

// Export setup function
export default setupBot;
