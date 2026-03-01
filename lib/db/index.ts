import 'server-only';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Validate database URL is provided
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env.local file.');
}

// Create Neon HTTP client
const sql = neon(databaseUrl);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Export schema for type inference
export { schema };

// Export sql for direct queries if needed
export { sql };
