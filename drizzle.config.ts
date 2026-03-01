import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || '',
  },
  // Force push migrations (use with caution in production)
  forceDrop: false,
  // Print verbose logs
  verbose: true,
  // Strict mode
  strict: true,
} satisfies Config;
