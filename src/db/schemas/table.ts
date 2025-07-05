import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const table = sqliteTable('tables', {
  id: integer().primaryKey(),
  uuid: text('uuid').notNull(),
  name: text('name').notNull(),
  largeLogoSize: integer('large_logo_size').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const team = sqliteTable('teams', {
  id: integer().primaryKey(),
  tableId: integer('table_id')
    .notNull()
    .references(() => table.id, {
      onDelete: 'cascade',
    }),
  teamId: integer('team_id').notNull(),
  name: text('name').notNull(),
  tag: text('tag').notNull(),
  matchElims: integer('match_elims').notNull().default(0),
  present: integer('present').notNull().default(1),
});

export const teamPoint = sqliteTable('team_points', {
  id: integer().primaryKey(),
  tableId: integer('table_id')
    .notNull()
    .references(() => table.id, {
      onDelete: 'cascade',
    }),
  teamId: integer('team_id')
    .notNull()
    .references(() => team.id, {
      onDelete: 'cascade',
    }),
  points: integer('points').notNull().default(0),
});
