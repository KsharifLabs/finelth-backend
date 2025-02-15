import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').references(() => users.id),
    token: text('token').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
});
