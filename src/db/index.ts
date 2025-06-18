import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import Config from '../config';

const sqlite = new Database(Config.DB_PATH);
const db = drizzle(sqlite);

export default db;
