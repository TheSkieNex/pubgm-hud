import path from 'node:path';
import fs from 'node:fs/promises';

import { Request, Response } from 'express';

import { errorHandler } from '@/lib/decorators/error-handler';

import Config from '@/config';
import db from '@/db';

import { teams } from '@/db/schemas/table';

interface InitRequest {
  teams: {
    id: number;
    name: string;
    tag: string;
    logo_data: string;
  }[];
}

class TableController {
  @errorHandler()
  static async init(req: Request, res: Response): Promise<void> {
    const { teams: teamsData } = req.body as InitRequest;

    const teamsAlreadyExists = await db.select().from(teams);
    if (teamsAlreadyExists.length > 0) {
      await db.delete(teams);
    }

    const teamsDirPath = path.join(Config.STATIC_DIR, 'teams');
    if (
      await fs
        .stat(teamsDirPath)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.rm(teamsDirPath, { recursive: true });
    }

    await fs.mkdir(teamsDirPath, { recursive: true });

    for (const team of teamsData) {
      await db.insert(teams).values({ teamId: team.id, name: team.name, tag: team.tag });

      const logoPath = path.join(teamsDirPath, `${team.id}.png`);
      const base64Data = team.logo_data.replace(/^data:image\/\w+;base64,/, '');
      await fs.writeFile(logoPath, Buffer.from(base64Data, 'base64'));
    }

    res.json({ success: true });
  }
}

export default TableController;
