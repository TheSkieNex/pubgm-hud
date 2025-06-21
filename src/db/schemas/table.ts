import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const teams = sqliteTable('teams', {
  id: integer().primaryKey(),
  teamId: integer('team_id').notNull(),
  name: text('name').notNull(),
  tag: text('tag').notNull(),
});

export const teamPoints = sqliteTable('team_points', {
  id: integer().primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, {
      onDelete: 'cascade',
    }),
  points: integer('points').notNull().default(0),
});
