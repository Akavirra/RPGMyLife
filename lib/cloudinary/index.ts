import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: object[];
  }
): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
      {
        folder: options?.folder || 'life-rpg',
        public_id: options?.publicId,
        transformation: options?.transformation || [
          { width: 500, height: 500, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
}

/**
 * Upload avatar image with circular transformation
 */
export async function uploadAvatar(file: Buffer | string, userId: number): Promise<string | null> {
  const result = await uploadImage(file, {
    folder: 'life-rpg/avatars',
    publicId: `user_${userId}`,
    transformation: [
      { width: 200, height: 200, crop: 'fill' },
      { gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return result?.url || null;
}

/**
 * Upload location image
 */
export async function uploadLocationImage(
  file: Buffer | string,
  locationId: number
): Promise<string | null> {
  const result = await uploadImage(file, {
    folder: 'life-rpg/locations',
    publicId: `location_${locationId}`,
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return result?.url || null;
}

/**
 * Upload character/NPC avatar
 */
export async function uploadCharacterAvatar(
  file: Buffer | string,
  characterId: number
): Promise<string | null> {
  const result = await uploadImage(file, {
    folder: 'life-rpg/characters',
    publicId: `character_${characterId}`,
    transformation: [
      { width: 300, height: 300, crop: 'fill' },
      { gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });

  return result?.url || null;
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Generate optimized URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || 'fill',
    quality: options?.quality || 'auto',
    fetch_format: 'auto',
    secure: true,
  });
}
