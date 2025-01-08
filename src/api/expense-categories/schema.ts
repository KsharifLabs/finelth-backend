import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const expenseCategories = pgTable('expense_categories', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow(),
});
