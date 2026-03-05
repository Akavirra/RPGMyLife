import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { characters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifySessionToken } from '@/lib/auth';

// PATCH /api/characters/[id] - Update character
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const characterId = parseInt(id);
    if (isNaN(characterId)) {
      return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    // Check if character exists and belongs to user
    const existingCharacter = await db.query.characters.findFirst({
      where: eq(characters.id, characterId),
    });

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    if (existingCharacter.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, role, avatarUrl } = body;

    const [updatedCharacter] = await db.update(characters)
      .set({
        name: name ?? existingCharacter.name,
        role: role !== undefined ? role : existingCharacter.role,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existingCharacter.avatarUrl,
      })
      .where(eq(characters.id, characterId))
      .returning();

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/characters/[id] - Delete character
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const characterId = parseInt(id);
    if (isNaN(characterId)) {
      return NextResponse.json({ error: 'Invalid character ID' }, { status: 400 });
    }

    // Check if character exists and belongs to user
    const existingCharacter = await db.query.characters.findFirst({
      where: eq(characters.id, characterId),
    });

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    if (existingCharacter.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(characters).where(eq(characters.id, characterId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
