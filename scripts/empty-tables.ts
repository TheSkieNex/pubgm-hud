import path from 'path';
import fs from 'fs/promises';

import db from '../src/db';

import { table } from '../src/db/schemas/table';

async function main() {
  await db.delete(table);

  const tablesDir = path.join(__dirname, '../static/tables');
  try {
    const dirs = await fs.readdir(tablesDir);
    for (const dir of dirs) {
      await fs.rm(path.join(tablesDir, dir), { recursive: true });
    }
  } catch {
    console.log('No tables to empty');
  }

  console.log('Tables emptied');
}

main();
