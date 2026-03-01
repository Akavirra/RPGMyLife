import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { bot, getBot, setupBot } from '@/lib/telegram/bot';

// Setup bot on module load (will run during build and server start)
if (bot) {
  setupBot();
}

// POST /api/bot - Telegram webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get bot instance
    const botInstance = getBot();
    
    // Handle the update
    await botInstance.handleUpdate(body);

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
