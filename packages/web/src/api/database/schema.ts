import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const advisoryEnquiries = sqliteTable('advisory_enquiries', {
  id: text('id').primaryKey(),
  building: text('building').notNull(),
  stage: text('stage').notNull(),
  revenue: text('revenue').notNull(),
  areas: text('areas', { mode: 'json' }).$type<string[]>().notNull(),
  challenge: text('challenge').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  website: text('website').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, table => [index('advisory_email_created_idx').on(table.email, table.createdAt)]);
