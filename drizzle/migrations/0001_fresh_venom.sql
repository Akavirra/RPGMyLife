-- Add salt column to users table for better password hashing
ALTER TABLE "users" ADD COLUMN "salt" text;
