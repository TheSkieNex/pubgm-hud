import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { Request, Response } from 'express';
import { desc, eq } from 'drizzle-orm';

import { errorHandler } from '@/lib/decorators/error-handler';

import Config from '@/config';
import db from '@/db';

import { table, teams, teamPoints } from '@/db/schemas/table';

interface InitRequest {
  table: {
    name: string;
  };
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
    const { table: tableData, teams: teamsData } = req.body as InitRequest;

    const dbTable = await db
      .insert(table)
      .values({
        uuid: crypto.randomUUID(),
        name: tableData.name,
      })
      .returning();

    const tableDirPath = path.join(Config.STATIC_DIR, 'tables', dbTable[0].uuid);
    await fs.mkdir(tableDirPath, { recursive: true });

    for (const team of teamsData) {
      await db
        .insert(teams)
        .values({ tableId: dbTable[0].id, teamId: team.id, name: team.name, tag: team.tag });

      const logoPath = path.join(tableDirPath, `${team.id}.png`);
      const base64Data = team.logo_data.replace(/^data:image\/\w+;base64,/, '');
      await fs.writeFile(logoPath, Buffer.from(base64Data, 'base64'));
    }

    res.json({ success: true });
  }

  @errorHandler()
  static async getAll(req: Request, res: Response): Promise<void> {
    const tables = await db.select().from(table).orderBy(desc(table.createdAt));
    res.json(tables);
  }

  @errorHandler()
  static async get(req: Request, res: Response): Promise<void> {
    const { uuid } = req.params;

    if (!uuid) {
      res.status(400).json({ error: 'UUID is required' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, uuid));

    if (!dbTable) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbTeams = await db.select().from(teams).where(eq(teams.tableId, dbTable[0].id));
    const dbTeamPoints = await db
      .select()
      .from(teamPoints)
      .where(eq(teamPoints.tableId, dbTable[0].id));

    res.json({
      table: dbTable[0],
      teams: dbTeams,
      teamPoints: dbTeamPoints,
    });
  }
}

export default TableController;
