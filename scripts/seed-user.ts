// Seed script to create initial users
// Run with: npx tsx scripts/seed-user.ts

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/schema';
import crypto from 'crypto';

config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

// Simple hash function matching lib/auth.ts
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function seed() {
  const email = process.env.SEED_EMAIL || 'korsun0711.korsun@gmail.com';
  const password = process.env.SEED_PASSWORD || 'lexkor00711';
  const firstName = process.env.SEED_FIRST_NAME || 'User';
  const username = process.env.SEED_USERNAME || 'lexkor00711';

  console.log(`Creating user: ${email}`);

  try {
    const passwordHash = await hashPassword(password);
    
    const [user] = await db.insert(schema.users)
      .values({
        email,
        passwordHash,
        username,
        firstName,
        level: 1,
        totalXp: 0,
      })
      .onConflictDoNothing({ target: schema.users.email })
      .returning();

    if (user) {
      console.log(`User created successfully with ID: ${user.id}`);
    } else {
      console.log('User already exists');
    }
  } catch (error: any) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

seed();
