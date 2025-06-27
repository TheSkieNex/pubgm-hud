import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { Request, Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';

import { errorHandler } from '../lib/decorators/error-handler';

import Config from '../config';
import db from '../db';
import { getSocket } from '../config/socket';

import { table, team, teamPoint } from '../db/schemas/table';

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

interface TeamsInfoRequest {
  table_uuid: string;
  team_info_list: {
    teamId: number;
    killNum: number;
  }[];
}

interface PlayersInfoRequest {
  table_uuid: string;
  player_info_list: {
    teamId: number;
    uID: number;
    health: number;
    liveState: number;
    bHasDied: boolean;
    rank: number;
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

    for (const teamData of teamsData) {
      const dbTeam = await db
        .insert(team)
        .values({
          tableId: dbTable[0].id,
          teamId: teamData.id,
          name: teamData.name,
          tag: teamData.tag,
        })
        .returning();

      const logoPath = path.join(tableDirPath, `${teamData.id}.png`);
      const base64Data = teamData.logo_data.replace(/^data:image\/\w+;base64,/, '');
      await fs.writeFile(logoPath, Buffer.from(base64Data, 'base64'));

      await db.insert(teamPoint).values({
        tableId: dbTable[0].id,
        teamId: dbTeam[0].id,
        points: 0,
      });
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

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbTeams = await db.select().from(team).where(eq(team.tableId, dbTable[0].id));
    const dbTeamPoints = await db
      .select()
      .from(teamPoint)
      .where(eq(teamPoint.tableId, dbTable[0].id));

    res.json({
      table: dbTable[0],
      teams: dbTeams.map(team => {
        const teamPoints = dbTeamPoints.find(t => t.teamId === team.id);
        return {
          ...team,
          points: teamPoints?.points,
          liveMemberNum: 4,
        };
      }),
    });
  }

  @errorHandler()
  static async check(req: Request, res: Response): Promise<void> {
    const { uuid } = req.params;

    if (!uuid) {
      res.status(400).json({ error: 'UUID is required' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    res.json({ success: true });
  }

  @errorHandler()
  static async teamsInfo(req: Request, res: Response): Promise<void> {
    const { table_uuid, team_info_list } = req.body as TeamsInfoRequest;

    const socket = getSocket();

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0 || !table_uuid) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const teamsData = [];

    for (const teamInfo of team_info_list) {
      const { teamId, killNum } = teamInfo;

      const dbTeam = await db
        .select()
        .from(team)
        .where(and(eq(team.teamId, teamId), eq(team.tableId, dbTable[0].id)))
        .orderBy(desc(team.id))
        .limit(1);

      if (dbTeam.length === 0) continue;

      if (killNum !== dbTeam[0].matchElims) {
        const dbTeamPoint = await db
          .select()
          .from(teamPoint)
          .where(eq(teamPoint.teamId, dbTeam[0].id))
          .limit(1);

        await db
          .update(teamPoint)
          .set({
            points: dbTeamPoint[0].points + (killNum - dbTeam[0].matchElims),
          })
          .where(eq(teamPoint.teamId, dbTeam[0].id));

        await db.update(team).set({ matchElims: killNum }).where(eq(team.teamId, teamId));
      }

      teamsData.push({
        teamId,
        matchElims: killNum,
      });
    }

    socket.emit(`team-info-${table_uuid}`, teamsData);

    res.json({ success: true });
  }

  @errorHandler()
  static async resetMatchElims(req: Request, res: Response): Promise<void> {
    const { uuid } = req.params;

    if (!uuid) {
      res.status(400).json({ error: 'Table UUID is required' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    await db.update(team).set({ matchElims: 0 }).where(eq(team.tableId, dbTable[0].id));

    res.json({ success: true });
  }

  @errorHandler()
  static async playersInfo(req: Request, res: Response): Promise<void> {
    const { table_uuid, player_info_list } = req.body as PlayersInfoRequest;

    const socket = getSocket();

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0 || !table_uuid) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const playersByTeam = new Map<number, typeof player_info_list>();

    for (const player of player_info_list) {
      if (!playersByTeam.has(player.teamId)) {
        playersByTeam.set(player.teamId, []);
      }
      playersByTeam.get(player.teamId)!.push(player);
    }

    const eliminatedTeams = [];

    for (const [teamId, players] of playersByTeam) {
      const allPlayersDead = players.every(player => player.bHasDied === true);
      if (allPlayersDead) {
        const dbTeam = await db.select().from(team).where(eq(team.teamId, teamId));
        if (dbTeam.length === 0) continue;

        eliminatedTeams.push({
          tableUUID: table_uuid,
          teamId: dbTeam[0].teamId,
          teamName: dbTeam[0].name,
          matchElims: dbTeam[0].matchElims,
          rank: players[0].rank,
        });
      }
    }

    socket.emit(`players-info-${table_uuid}`, player_info_list);

    if (eliminatedTeams.length > 0) {
      socket.emit(`team-eliminated-${table_uuid}`, eliminatedTeams);
    }

    res.json({ success: true });
  }
}

export default TableController;
