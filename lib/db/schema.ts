import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';

// Enums
export const questStatusEnum = pgEnum('quest_status', ['draft', 'active', 'completed', 'failed']);
export const questTypeEnum = pgEnum('quest_type', ['once', 'daily', 'weekly', 'chain']);
export const eventTypeEnum = pgEnum('event_type', [
  'quest_created',
  'quest_completed',
  'quest_failed',
  'level_up',
  'skill_up',
]);

// Users table - authenticated via email/password
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  username: text('username'),
  firstName: text('first_name').notNull(),
  avatarUrl: text('avatar_url'),
  level: integer('level').notNull().default(1),
  totalXp: integer('total_xp').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Skills table - character skill tree
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  iconUrl: text('icon_url'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Locations table - real or fictional places linked to quests
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Characters table - NPCs / real people linked to quests
export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  avatarUrl: text('avatar_url'),
  reputationLevel: integer('reputation_level').notNull().default(50), // 0-100
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Quests table - core entity
export const quests = pgTable('quests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: questStatusEnum('status').notNull().default('draft'),
  type: questTypeEnum('type').notNull().default('once'),
  difficulty: integer('difficulty').notNull().default(1), // 1-5
  xpReward: integer('xp_reward').notNull().default(0),
  deadline: timestamp('deadline'),
  locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
  parentQuestId: integer('parent_quest_id').references(() => quests.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Quest-Characters junction table (many-to-many)
export const questCharacters = pgTable('quest_characters', {
  questId: integer('quest_id').notNull().references(() => quests.id, { onDelete: 'cascade' }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
}, (table: any) => ({
  pk: primaryKey({ columns: [table.questId, table.characterId] }),
}));

// Quest-Skills junction table (many-to-many) - which skills this quest trains
export const questSkills = pgTable('quest_skills', {
  questId: integer('quest_id').notNull().references(() => quests.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  xpAmount: integer('xp_amount').notNull().default(0),
}, (table: any) => ({
  pk: primaryKey({ columns: [table.questId, table.skillId] }),
}));

// Activity Log table - event journal
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questId: integer('quest_id').references(() => quests.id, { onDelete: 'set null' }),
  eventType: eventTypeEnum('event_type').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
export type QuestCharacter = typeof questCharacters.$inferSelect;
export type NewQuestCharacter = typeof questCharacters.$inferInsert;
export type QuestSkill = typeof questSkills.$inferSelect;
export type NewQuestSkill = typeof questSkills.$inferInsert;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type NewActivityLogEntry = typeof activityLog.$inferInsert;

export type QuestStatus = 'draft' | 'active' | 'completed' | 'failed';
export type QuestType = 'once' | 'daily' | 'weekly' | 'chain';
export type EventType = 'quest_created' | 'quest_completed' | 'quest_failed' | 'level_up' | 'skill_up';
