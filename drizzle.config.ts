import 'dotenv/config';
import path from 'node:path';

import { defineConfig } from 'drizzle-kit';

const SCHEMA_PATH = path.join(__dirname, 'src', 'db', 'schemas');

export default defineConfig({
  out: './drizzle',
  schema: SCHEMA_PATH,
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME || 'database.db',
  },
});
