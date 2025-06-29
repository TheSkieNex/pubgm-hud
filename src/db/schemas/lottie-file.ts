import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const lottieFile = sqliteTable('lottie_files', {
  id: integer().primaryKey(),
  uuid: text('uuid').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const lottieLayer = sqliteTable('lottie_layers', {
  id: integer().primaryKey(),
  name: text('name').notNull(),
  fileId: integer('file_id')
    .notNull()
    .references(() => lottieFile.id, {
      onDelete: 'cascade',
    }),
  layerIndex: integer('layer_index').notNull(),
  outPoint: integer('out_point').notNull().default(0),
});
