import db from '../src/db';

import { team } from '../src/db/schemas/table';

async function main() {
  await db.update(team).set({
    matchElims: 0,
  });

  console.log('Team elims was reset');
}

main();
