import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getBot, initializeBot } from '@/lib/telegram/bot';

// POST /api/bot - Telegram webhook handler
export async function POST(request: NextRequest) {
  try {
    // Initialize bot on first request
    await initializeBot();
    
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
