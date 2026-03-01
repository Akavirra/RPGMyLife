/**
 * Скрипт для налаштування Telegram webhook
 * 
 * Використання:
 * 1. Встанови TELEGRAM_BOT_TOKEN в .env файлі
 * 2. Запусти: npx tsx scripts/setup-telegram-webhook.ts
 * 
 * АБО вручну через curl:
 * curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
 *   -d "url=https://your-app.vercel.app/api/bot"
 */

import 'dotenv/config';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.error('❌ Помилка: TELEGRAM_BOT_TOKEN не знайдено в .env файлі');
    console.log('\n📝 Інструкція:');
    console.log('1. Відкрий @BotFather в Telegram');
    console.log('2. Створи нового бота: /newbot');
    console.log('3. Скопіюй токен бота');
    console.log('4. Додай його в .env файл як TELEGRAM_BOT_TOKEN=ваш_токен');
    process.exit(1);
  }

  if (!APP_URL) {
    console.error('❌ Помилка: NEXT_PUBLIC_APP_URL не знайдено в .env файлі');
    console.log('\n📝 Якщо розробляєш локально, використай ngrok:');
    console.log('1. Завантаж ngrok: https://ngrok.com/');
    console.log('2. Запусти: ngrok http 3000');
    console.log('3. Використай HTTPS URL з ngrok як NEXT_PUBLIC_APP_URL');
    process.exit(1);
  }

  const webhookUrl = `${APP_URL}/api/bot`;
  
  console.log(`\n🔧 Налаштування webhook...`);
  console.log(`   URL: ${webhookUrl}`);

  try {
    // Встановлюємо webhook
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      }
    );

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook успішно налаштовано!');
      console.log(`\n📱 Тепер твой бот повинен відповідати на /start`);
      console.log(`\n🔗 Посилання на бота: https://t.me/${BOT_TOKEN.split(':')[1]}`);
    } else {
      console.error('❌ Помилка налаштування webhook:', result.description);
      process.exit(1);
    }

    // Перевіряємо інформацію про бота
    const botInfo = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    );
    const botData = await botInfo.json();
    
    if (botData.ok) {
      console.log(`\n🤖 Інформація про бота:`);
      console.log(`   Ім'я: ${botData.result.first_name}`);
      console.log(`   Username: @${botData.result.username}`);
    }

  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  }
}

setupWebhook();
