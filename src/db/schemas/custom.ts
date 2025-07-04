import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const overallResultsPoints = sqliteTable('overall_results_points', {
  id: integer().primaryKey(),
  tableId: integer('table_id').notNull(),
  teamId: integer('team_id').notNull(),
  wwcd: integer('wwcds').notNull().default(0),
  placementPts: integer('placement_pts').notNull().default(0),
  elims: integer('elims').notNull().default(0),
  total: integer('total').notNull().default(0),
});
