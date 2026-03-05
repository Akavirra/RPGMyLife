import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

async function migrate() {
  console.log('Creating character_relation enum...');
  try {
    await sql`DO $$ BEGIN CREATE TYPE character_relation AS ENUM ('acquaintance', 'friend', 'family', 'enemy'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
    console.log('Enum created successfully');
  } catch (e: any) {
    if (e.message?.includes('duplicate_object')) {
      console.log('Enum already exists');
    } else {
      console.log('Enum error (may already exist):', e.message);
    }
  }

  console.log('Adding relation column...');
  try {
    await sql`ALTER TABLE characters ADD COLUMN relation character_relation;`;
    console.log('Relation column added');
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) {
      console.log('Relation column already exists');
    } else {
      console.log('Relation column error (may already exist):', e.message);
    }
  }

  console.log('Adding description column...');
  try {
    await sql`ALTER TABLE characters ADD COLUMN description text;`;
    console.log('Description column added');
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) {
      console.log('Description column already exists');
    } else {
      console.log('Description column error (may already exist):', e.message);
    }
  }

  console.log('Adding guild_id column...');
  try {
    await sql`ALTER TABLE characters ADD COLUMN guild_id integer REFERENCES guilds(id) ON DELETE SET NULL;`;
    console.log('Guild_id column added');
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) {
      console.log('Guild_id column already exists');
    } else {
      console.log('Guild_id column error (may already exist):', e.message);
    }
  }

  console.log('Migration completed!');
}

migrate().catch(console.error);
