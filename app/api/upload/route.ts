import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { uploadAvatar, uploadLocationImage, uploadCharacterAvatar } from '@/lib/cloudinary';

// POST /api/upload - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;
    const id = formData.get('id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let url: string | null = null;

    // Upload based on type
    switch (type) {
      case 'avatar':
        url = await uploadAvatar(buffer, session.userId);
        break;
      case 'location':
        const locationId = parseInt(id || '0');
        if (isNaN(locationId)) {
          return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
        }
        url = await uploadLocationImage(buffer, locationId);
        break;
      case 'character':
        const characterId = parseInt(id || '0');
        if (isNaN(characterId) || characterId === 0) {
          // Temporary upload for new character - use generic upload with character folder
          const { uploadImage: charUpload } = await import('@/lib/cloudinary');
          const result = await charUpload(buffer, {
            folder: 'life-rpg/characters',
            transformation: [
              { width: 300, height: 300, crop: 'fill' },
              { gravity: 'face' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          });
          url = result?.url || null;
        } else {
          url = await uploadCharacterAvatar(buffer, characterId);
        }
        break;
      default:
        // Generic upload
        const { uploadImage: genericUpload } = await import('@/lib/cloudinary');
        const result = await genericUpload(buffer);
        url = result?.url || null;
    }

    if (!url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
