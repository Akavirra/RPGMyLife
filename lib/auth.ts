'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';
import { users, activityLog } from './db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
);

// Generate a random salt
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Password hashing using Web Crypto API with salt
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password with salt
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const passwordHash = await hashPassword(password, salt);
  return passwordHash === hash;
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

// Register new user
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  username?: string
): Promise<{ user: any; isNew: boolean }> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create new user
  const [newUser] = await db.insert(users)
    .values({
      email,
      passwordHash,
      salt,
      username: username || null,
      firstName,
      level: 1,
      totalXp: 0,
    })
    .returning();

  return { user: newUser, isNew: true };
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: any; isNew: boolean } | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.salt) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return null;
  }

  return { user, isNew: false };
}

// Get user by ID
export async function getUserById(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

// Get user by email
export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

// Update user profile
export async function updateUser(
  userId: number,
  data: {
    username?: string;
    firstName?: string;
    avatarUrl?: string;
  }
) {
  await db.update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// Update user password
export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<boolean> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  
  await db.update(users)
    .set({
      passwordHash,
      salt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  return true;
}

// Log user action - silently fails if enum value doesn't exist in DB
export async function logUserAction(
  userId: number,
  action: string,
  metadata?: Record<string, any>
) {
  try {
    await db.insert(activityLog)
      .values({
        userId,
        eventType: 'quest_created' as any, // Use existing enum value
        metadata: {
          action,
          ...metadata,
        },
      });
  } catch (error) {
    // Silently fail - logging should not break the main functionality
    console.error('Failed to log user action:', error);
  }
}
