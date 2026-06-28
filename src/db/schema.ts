import { pgTable, uuid, varchar, text, integer, boolean, timestamp, decimal, jsonb, index, vector } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// NextAuth System Tables
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: varchar('token_type', { length: 50 }),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: varchar('session_state', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_accounts_user').on(table.userId),
  providerIdx: index('idx_accounts_provider').on(table.provider, table.providerAccountId),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  userIdIdx: index('idx_sessions_user').on(table.userId),
  tokenIdx: index('idx_sessions_token').on(table.sessionToken),
}));

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// ============================================
// Custom Tables
// ============================================

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'admin' | 'member'
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  avatarStylePrompt: text('avatar_style_prompt'),
  bio: text('bio'),
  totalQuestionsAsked: integer('total_questions_asked').default(0),
  lastActiveAt: timestamp('last_active_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_user_profiles_user').on(table.userId),
}));

export const guestSessions = pgTable('guest_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 100 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  questionsUsed: integer('questions_used').default(0),
  maxQuestions: integer('max_questions').default(2),
  convertedToUserId: uuid('converted_to_user_id').references(() => users.id, { onDelete: 'set null' }),
  convertedAt: timestamp('converted_at', { mode: 'date' }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
}, (table) => ({
  sessionIdIdx: index('idx_guest_sessions_session').on(table.sessionId),
  expiresAtIdx: index('idx_guest_sessions_expires').on(table.expiresAt),
}));

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 100 }),
  title: varchar('title', { length: 255 }).default('New Chat'),
  status: varchar('status', { length: 20 }).default('active'), // 'active' | 'archived'
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_conversations_user').on(table.userId),
  sessionIdIdx: index('idx_conversations_session').on(table.sessionId),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
  messageType: varchar('message_type', { length: 30 }).default('text'), // 'text' | 'image_generation' | 'video_avatar'
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  audioUrl: text('audio_url'),
  generationModel: varchar('generation_model', { length: 50 }),
  audioDurationMs: integer('audio_duration_ms'),
  tokensUsed: integer('tokens_used').default(0),
  knowledgeChunksUsed: jsonb('knowledge_chunks_used').default([]),
  responseTimeMs: integer('response_time_ms'),
  feedbackScore: integer('feedback_score'),
  isFlagged: boolean('is_flagged').default(false),
  isOutOfScope: boolean('is_out_of_scope').default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  conversationIdIdx: index('idx_messages_conversation').on(table.conversationId),
  createdAtIdx: index('idx_messages_created').on(table.createdAt),
  isFlaggedIdx: index('idx_messages_flagged').on(table.isFlagged),
  isOutOfScopeIdx: index('idx_messages_out_of_scope').on(table.isOutOfScope),
  messageTypeIdx: index('idx_messages_type').on(table.messageType),
}));

export const knowledgeDocuments = pgTable('knowledge_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  sourceFile: varchar('source_file', { length: 500 }),
  category: varchar('category', { length: 50 }).default('general'), // 'personal' | 'education' | 'work_experience' | 'skills' | 'projects' | 'general'
  version: integer('version').default(1),
  isActive: boolean('is_active').default(true),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => knowledgeDocuments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  chunkIndex: integer('chunk_index').notNull(),
  metadata: jsonb('metadata').default({}),
  tokens: integer('tokens').default(0),
  hitCount: integer('hit_count').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  documentIdIdx: index('idx_chunks_document').on(table.documentId),
  // Note: Vector index will be created via SQL migration
}));

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 100 }),
  action: varchar('action', { length: 50 }).notNull(), // 'question' | 'login' | 'logout' | 'signup' | 'feedback' | 'knowledge_update' | 'image_gen' | 'tts' | 'video_gen'
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  tokensConsumed: integer('tokens_consumed').default(0),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }).default('0'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_usage_logs_user').on(table.userId),
  sessionIdIdx: index('idx_usage_logs_session').on(table.sessionId),
  createdAtIdx: index('idx_usage_logs_created').on(table.createdAt),
  actionIdx: index('idx_usage_logs_action').on(table.action),
}));

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  conversations: many(conversations),
  usageLogs: many(usageLogs),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const knowledgeChunksRelations = relations(knowledgeChunks, ({ one }) => ({
  document: one(knowledgeDocuments, {
    fields: [knowledgeChunks.documentId],
    references: [knowledgeDocuments.id],
  }),
}));
