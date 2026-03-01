import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { bot, getBot, setupBot } from '@/lib/telegram/bot';

// Singleton pattern to ensure setupBot is called only once
let isSetup = false;
if (!isSetup && bot) {
  setupBot();
  isSetup = true;
}

// POST /api/bot - Telegram webhook handler
export async function POST(request: NextRequest) {
  try {
    // Verify secret token
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    const expectedSecret = process.env.TELEGRAM_BOT_SECRET;

    if (expectedSecret && secretToken !== expectedSecret) {
      console.error('Invalid Telegram secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Initialize bot if not already running
    const bot = getBot();
    
    // Handle the update
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/bot - Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Telegram bot webhook is running' 
  });
}
