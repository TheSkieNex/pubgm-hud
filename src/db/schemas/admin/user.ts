import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const adminUser = sqliteTable('admin_users', {
  id: integer().primaryKey(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
