import 'dotenv/config';
import path from 'node:path';

import { defineConfig } from 'drizzle-kit';

// Schema path doesn't work on windows, but ./src/db/schemas works
// TODO: FIX THIS
const SCHEMA_PATH = path.join(__dirname, 'src', 'db', 'schemas');
const DB_FILE_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'database_storage', 'database.db')
    : path.join(__dirname, 'database.db');

export default defineConfig({
  out: './drizzle',
  schema: SCHEMA_PATH,
  dialect: 'sqlite',
  dbCredentials: {
    url: DB_FILE_PATH,
  },
});
