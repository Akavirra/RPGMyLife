CREATE TABLE "journal" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"mood" text,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_type";--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('quest_created', 'quest_completed', 'quest_failed', 'level_up', 'skill_up');--> statement-breakpoint
ALTER TABLE "activity_log" ALTER COLUMN "event_type" SET DATA TYPE "public"."event_type" USING "event_type"::"public"."event_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "journal_password_hash" text;--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;