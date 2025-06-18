import 'dotenv/config';
import path from 'node:path';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: path.join(__dirname, 'src', 'db', 'schemas'),
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME || 'local.db',
  },
});
