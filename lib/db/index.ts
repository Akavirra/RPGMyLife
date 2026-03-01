import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create Neon HTTP client with fullResults: false as specified
const sql = neon(process.env.DATABASE_URL!, { fullResults: false });

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Export schema for type inference
export { schema };

// Export sql for direct queries if needed
export { sql };
