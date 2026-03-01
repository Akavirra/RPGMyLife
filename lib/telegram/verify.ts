import { SignJWT, jwtVerify } from 'jose';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
);

// Telegram user data from initData
export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

// Verify Telegram initData using HMAC-SHA256
export async function verifyTelegramInitData(initData: string): Promise<TelegramUserData | null> {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    // Remove hash from params for verification
    params.delete('hash');

    // Sort params alphabetically
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create HMAC-SHA256
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    const secretKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const tokenKey = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      new TextEncoder().encode(botToken)
    );

    const signatureKey = await crypto.subtle.importKey(
      'raw',
      tokenKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      signatureKey,
      new TextEncoder().encode(dataCheckString)
    );

    const expectedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (hash !== expectedHash) {
      console.error('Hash mismatch');
      return null;
    }

    // Extract user data
    const userJson = params.get('user');
    if (!userJson) return null;

    const userData = JSON.parse(userJson) as TelegramUserData;
    return userData;
  } catch (error) {
    console.error('Error verifying Telegram initData:', error);
    return null;
  }
}

// Create JWT session token
export async function createSessionToken(userId: number): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT session token
export async function verifySessionToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.userId !== 'number') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

// Get or create user from Telegram data
export async function getOrCreateUser(telegramUser: TelegramUserData) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.telegramId, String(telegramUser.id)),
  });

  if (existingUser) {
    // Update user info
    await db.update(users)
      .set({
        username: telegramUser.username || existingUser.username,
        firstName: telegramUser.first_name,
        avatarUrl: telegramUser.username ? `https://t.me/i/userpic/320/${telegramUser.username}.jpg` : existingUser.avatarUrl,
      })
      .where(eq(users.id, existingUser.id));

    return { ...existingUser, isNew: false };
  }

  // Create new user
  const [newUser] = await db.insert(users)
    .values({
      telegramId: String(telegramUser.id),
      username: telegramUser.username || null,
      firstName: telegramUser.first_name,
      avatarUrl: telegramUser.username ? `https://t.me/i/userpic/320/${telegramUser.username}.jpg` : null,
      level: 1,
      totalXp: 0,
    })
    .returning();

  return { ...newUser, isNew: true };
}

// Get user by ID
export async function getUserById(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

// Get user by Telegram ID
export async function getUserByTelegramId(telegramId: string) {
  return db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
}
