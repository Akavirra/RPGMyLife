import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { guilds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/auth';

// PATCH /api/guilds/[id] - Update guild
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const guildId = parseInt(id);
    if (isNaN(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID' }, { status: 400 });
    }

    // Check if guild exists and belongs to user
    const existingGuild = await db.query.guilds.findFirst({
      where: eq(guilds.id, guildId),
    });

    if (!existingGuild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    if (existingGuild.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    const [updatedGuild] = await db.update(guilds)
      .set({
        name: name ?? existingGuild.name,
        description: description !== undefined ? description : existingGuild.description,
      })
      .where(eq(guilds.id, guildId))
      .returning();

    return NextResponse.json({ guild: updatedGuild });
  } catch (error) {
    console.error('Error updating guild:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/guilds/[id] - Delete guild
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const guildId = parseInt(id);
    if (isNaN(guildId)) {
      return NextResponse.json({ error: 'Invalid guild ID' }, { status: 400 });
    }

    // Check if guild exists and belongs to user
    const existingGuild = await db.query.guilds.findFirst({
      where: eq(guilds.id, guildId),
    });

    if (!existingGuild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    if (existingGuild.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(guilds).where(eq(guilds.id, guildId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guild:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
