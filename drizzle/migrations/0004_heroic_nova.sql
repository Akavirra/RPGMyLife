-- Migration: Add character relation, description and guild support
-- Created at: 2026-03-05

-- Create enum for character relations if not exists
DO $$ BEGIN
  CREATE TYPE character_relation AS ENUM ('acquaintance', 'friend', 'family', 'enemy');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add relation column (replacing role)
ALTER TABLE characters ADD COLUMN relation character_relation;

-- Add description column
ALTER TABLE characters ADD COLUMN description text;

-- Add guild_id column
ALTER TABLE characters ADD COLUMN guild_id integer REFERENCES guilds(id) ON DELETE SET NULL;

-- Drop the old role column (optional - comment this out if you want to keep role data)
-- ALTER TABLE characters DROP COLUMN role;
