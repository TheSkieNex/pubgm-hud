import path from 'node:path';
import fs from 'node:fs/promises';

import { eq, and } from 'drizzle-orm';
import { Request, Response } from 'express';

import Config from '../../config';
import db from '../../db';

import {
  CustomUpdateWWCDTeamRequest,
  CustomUpdateMatchResultRequest,
  CustomUpdateOverallResultsAbsoluteRequest,
  CustomUpdateMapRotationRequest,
} from './types';
import { lottieFile, lottieLayer } from '../../db/schemas/lottie-file';
import { table, team as dbTeam, teamPoint } from '../../db/schemas/table';
import { overallResultsPoints } from '../../db/schemas/custom';
import { errorHandler } from '../../lib/decorators/error-handler';
import { updateLottieLayer, toggleLottieLayer } from '../../lib/utils';
import { LottieJson } from 'src/lib/lottie';

const PLACEMENT_POINTS = {
  1: 10,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
};

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function updateTeamList(
  file_uuid: string,
  index: number,
  team: {
    id: number;
    wwcd: number;
    eliminations: number;
    placementPoints: number;
    total: number;
  },
  dbTable: (typeof table.$inferSelect)[],
  dbLottieLayers: (typeof lottieLayer.$inferSelect)[]
) {
  const dbTeamData = await db
    .select()
    .from(dbTeam)
    .where(and(eq(dbTeam.tableId, dbTable[0].id), eq(dbTeam.teamId, team.id)));

  if (dbTeamData.length === 0) return null;

  const teamLogoPath = path.join(
    Config.TABLES_DIR,
    dbTable[0].uuid,
    `${dbTable[0].largeLogoSize}x${dbTable[0].largeLogoSize}`,
    `${team.id}.png`
  );
  const teamLogo = await fs.readFile(teamLogoPath);
  const teamLogoBase64 = teamLogo.toString('base64');

  // LOGO
  const teamLogoLayer = dbLottieLayers.find(l => l.name === `TEAM_LOGO_${index}`);
  await updateLottieLayer(file_uuid, teamLogoLayer!.layerIndex, teamLogoBase64);

  // NAME
  const teamNameLayer = dbLottieLayers.find(l => l.name === `TEAM_NAME_${index}`);
  await updateLottieLayer(file_uuid, teamNameLayer!.layerIndex, dbTeamData[0].name);

  // WWCD
  const wwcdLayer = dbLottieLayers.find(l => l.name === `WWCD_${index}`);
  await updateLottieLayer(file_uuid, wwcdLayer!.layerIndex, String(team.wwcd));

  // PLACEMENT PTS
  const placementPtsLayer = dbLottieLayers.find(l => l.name === `PTS_${index}`);
  await updateLottieLayer(file_uuid, placementPtsLayer!.layerIndex, String(team.placementPoints));

  // ELIMS
  const elimsLayer = dbLottieLayers.find(l => l.name === `ELIMS_${index}`);
  await updateLottieLayer(file_uuid, elimsLayer!.layerIndex, String(team.eliminations));

  // TOTAL
  const totalLayer = dbLottieLayers.find(l => l.name === `TOTAL_${index}`);
  await updateLottieLayer(file_uuid, totalLayer!.layerIndex, String(team.total));
}

class CustomController {
  @errorHandler()
  static async updateWWCDTeam(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid, team } = req.body as CustomUpdateWWCDTeamRequest;

    if (!file_uuid || !table_uuid || !team) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const dbTeamData = await db
      .select()
      .from(dbTeam)
      .where(and(eq(dbTeam.tableId, dbTable[0].id), eq(dbTeam.teamId, team.id)));

    if (dbTeamData.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const teamLogoPath = path.join(
      Config.TABLES_DIR,
      dbTable[0].uuid,
      `${dbTable[0].largeLogoSize}x${dbTable[0].largeLogoSize}`,
      `${team.id}.png`
    );
    const teamLogo = await fs.readFile(teamLogoPath);
    const teamLogoBase64 = teamLogo.toString('base64');

    // TEAM LOGO
    const teamLogoLayer = dbLottieLayers.find(layer => layer.name === 'TEAM_LOGO');
    await updateLottieLayer(file_uuid, teamLogoLayer!.layerIndex, teamLogoBase64);

    // TEAM NAME
    const teamNameLayer = dbLottieLayers.find(layer => layer.name === 'TEAM_NAME');
    await updateLottieLayer(file_uuid, teamNameLayer!.layerIndex, dbTeamData[0].name.toUpperCase());

    for (const [index, player] of team.players.entries()) {
      const playerIndex = index + 1;

      // PLAYER NAME
      const playerNameLayer = dbLottieLayers.find(
        layer => layer.name === `PLAYER_NAME_${playerIndex}`
      );
      await updateLottieLayer(file_uuid, playerNameLayer!.layerIndex, player.name);

      // ELIMINATIONS
      const eliminationsLayer = dbLottieLayers.find(
        layer => layer.name === `ELIMINATIONS_CONTENT_${playerIndex}`
      );
      await updateLottieLayer(
        file_uuid,
        eliminationsLayer!.layerIndex,
        player.eliminations.toString()
      );

      // KNOCKOUTS
      const knockoutsLayer = dbLottieLayers.find(
        layer => layer.name === `KNOCKOUTS_CONTENT_${playerIndex}`
      );
      await updateLottieLayer(file_uuid, knockoutsLayer!.layerIndex, player.knockouts.toString());

      // GRENEADES
      const grenadesLayer = dbLottieLayers.find(
        layer => layer.name === `GRENADES_USED_CONTENT_${playerIndex}`
      );
      await updateLottieLayer(
        file_uuid,
        grenadesLayer!.layerIndex,
        player.grenades_used.toString()
      );

      // SURVIVAL TIME
      const survivalTimeLayer = dbLottieLayers.find(
        layer => layer.name === `SURVIVAL_TIME_TEXT_CONTENT_${playerIndex}`
      );
      await updateLottieLayer(
        file_uuid,
        survivalTimeLayer!.layerIndex,
        formatTime(player.survival_time)
      );
    }

    if (team.players.length === 4) {
      const lottieJsonPath = path.join(Config.LOTTIE_DIR_PATH, file_uuid, 'data.json');
      const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
      const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

      const layer = lottieJson.layers.find(layer => layer.ind === 8);
      const isHidden = layer?.op === layer?.ip;

      // Disabling 5th player layers, they are from 8 + 19
      if (isHidden) {
        for (let i = 8; i <= 26; i++) {
          await toggleLottieLayer(file_uuid, dbLottieFile[0].id, i, false);
        }
      }
    }

    if (team.players.length === 3) {
      // Disabling 4th player layers, they are from 8 + 19
      for (let i = 8; i <= 26; i++) {
        await toggleLottieLayer(file_uuid, dbLottieFile[0].id, i, true);
      }
    }

    res.status(200).json({ message: 'Success' });
  }

  @errorHandler()
  static async updateMatchResult(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid, teams } = req.body as CustomUpdateMatchResultRequest;

    if (!file_uuid || !table_uuid || !teams) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    // Sorting teams by total points and placement
    const sortedTeams = teams
      .map(team => {
        const placementPoints =
          PLACEMENT_POINTS[team.placement as keyof typeof PLACEMENT_POINTS] || 0;
        const totalPoints = placementPoints + team.eliminations;
        return { ...team, total: totalPoints, placementPoints };
      })
      .sort((a, b) => {
        if (b.total !== a.total) {
          return b.total - a.total;
        }
        return a.placement - b.placement;
      });

    // Getting the first 16 teams
    const first16Teams = sortedTeams.slice(0, 16);

    // Updating the first 16 teams
    for (const [index, team] of first16Teams.entries()) {
      await updateTeamList(
        file_uuid,
        index + 1,
        {
          id: team.id,
          wwcd: team.placement === 1 ? 1 : 0,
          eliminations: team.eliminations,
          placementPoints: team.placementPoints,
          total: team.total,
        },
        dbTable,
        dbLottieLayers
      );
    }

    // Updating team points by adding placement points only, because eliminations are already added
    for (const team of teams) {
      const placementPoints =
        PLACEMENT_POINTS[team.placement as keyof typeof PLACEMENT_POINTS] || 0;

      const dbTeamPoints = await db
        .select()
        .from(teamPoint)
        .where(and(eq(teamPoint.tableId, dbTable[0].id), eq(teamPoint.teamId, team.id)));

      // Team points are created for all teams that are sent in init request so all teams will have points
      if (dbTeamPoints.length > 0) {
        await db
          .update(teamPoint)
          .set({ points: dbTeamPoints[0].points + placementPoints })
          .where(and(eq(teamPoint.tableId, dbTable[0].id), eq(teamPoint.teamId, team.id)));
      }
    }

    // Resetting match elims to 0 for all teams, because the match is already finished
    await db.update(dbTeam).set({ matchElims: 0 }).where(eq(dbTeam.tableId, dbTable[0].id));

    res.status(200).json({ message: 'Success' });
  }

  @errorHandler()
  static async updateOverallResults(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid, teams } = req.body as CustomUpdateMatchResultRequest;

    if (!file_uuid || !table_uuid) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const dbOverallResultsPoints = await db
      .select()
      .from(overallResultsPoints)
      .where(eq(overallResultsPoints.tableId, dbTable[0].id));

    if (dbOverallResultsPoints.length === 0) {
      const sortedTeams = teams
        .map(team => {
          const placementPoints =
            PLACEMENT_POINTS[team.placement as keyof typeof PLACEMENT_POINTS] || 0;
          const totalPoints = placementPoints + team.eliminations;
          return { ...team, total: totalPoints, placementPoints };
        })
        .sort((a, b) => {
          if (b.total !== a.total) {
            return b.total - a.total;
          }
          return a.placement - b.placement;
        });

      for (const [index, team] of sortedTeams.entries()) {
        const placementPoints =
          PLACEMENT_POINTS[team.placement as keyof typeof PLACEMENT_POINTS] || 0;
        const totalPoints = placementPoints + team.eliminations;

        await db.insert(overallResultsPoints).values({
          tableId: dbTable[0].id,
          teamId: team.id,
          wwcd: team.placement === 1 ? 1 : 0,
          placementPts: placementPoints,
          elims: team.eliminations,
          total: totalPoints,
        });

        await updateTeamList(
          file_uuid,
          index + 1,
          {
            id: team.id,
            wwcd: team.placement === 1 ? 1 : 0,
            eliminations: team.eliminations,
            placementPoints,
            total: totalPoints,
          },
          dbTable,
          dbLottieLayers
        );
      }
    } else {
      for (const team of teams) {
        const placementPoints =
          PLACEMENT_POINTS[team.placement as keyof typeof PLACEMENT_POINTS] || 0;
        const totalPoints = placementPoints + team.eliminations;

        const dbTeamPoints = dbOverallResultsPoints.find(p => p.teamId === team.id);

        if (dbTeamPoints) {
          await db
            .update(overallResultsPoints)
            .set({
              wwcd: dbTeamPoints.wwcd + (team.placement === 1 ? 1 : 0),
              placementPts: dbTeamPoints.placementPts + placementPoints,
              elims: dbTeamPoints.elims + team.eliminations,
              total: dbTeamPoints.total + totalPoints,
            })
            .where(eq(overallResultsPoints.id, dbTeamPoints.id));
        } else {
          await db.insert(overallResultsPoints).values({
            tableId: dbTable[0].id,
            teamId: team.id,
            wwcd: team.placement === 1 ? 1 : 0,
            placementPts: placementPoints,
            elims: team.eliminations,
            total: totalPoints,
          });
        }
      }

      const dbTeamPoints = await db
        .select()
        .from(overallResultsPoints)
        .where(eq(overallResultsPoints.tableId, dbTable[0].id));
      const sortedTeams = dbTeamPoints.sort((a, b) => {
        if (b.total !== a.total) {
          return b.total - a.total;
        }
        return b.wwcd - a.wwcd;
      });

      for (const [index, team] of sortedTeams.entries()) {
        await updateTeamList(
          file_uuid,
          index + 1,
          {
            id: team.teamId,
            wwcd: team.wwcd,
            eliminations: team.elims,
            placementPoints: team.placementPts,
            total: team.total,
          },
          dbTable,
          dbLottieLayers
        );
      }
    }

    res.status(200).json({ message: 'Success' });
  }

  static async updateOverallResultsAbsolute(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid, teams } = req.body as CustomUpdateOverallResultsAbsoluteRequest;

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const dbOverallResultsPoints = await db
      .select()
      .from(overallResultsPoints)
      .where(eq(overallResultsPoints.tableId, dbTable[0].id));

    const updatedTeams = teams.map(team => {
      const totalPoints = team.placement + team.eliminations;
      return { ...team, total: totalPoints };
    });

    const sortedTeams = updatedTeams.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      if (b.placement !== a.placement) {
        return a.placement - b.placement;
      }
      return a.eliminations - b.eliminations;
    });

    for (const [index, team] of sortedTeams.entries()) {
      const dbTeamPoints = dbOverallResultsPoints.find(p => p.teamId === team.id);

      if (dbTeamPoints) {
        await db
          .update(overallResultsPoints)
          .set({
            wwcd: team.wwcd,
            placementPts: team.placement,
            elims: team.eliminations,
            total: team.total,
          })
          .where(eq(overallResultsPoints.id, dbTeamPoints.id));
      } else {
        await db.insert(overallResultsPoints).values({
          tableId: dbTable[0].id,
          teamId: team.id,
          wwcd: team.wwcd,
          placementPts: team.placement,
          elims: team.eliminations,
          total: team.total,
        });
      }

      await updateTeamList(
        file_uuid,
        index + 1,
        {
          id: team.id,
          wwcd: team.wwcd,
          placementPoints: team.placement,
          eliminations: team.eliminations,
          total: team.total,
        },
        dbTable,
        dbLottieLayers
      );
    }

    res.status(200).json({ message: 'Success' });
  }

  @errorHandler()
  static async resetMatchResults(req: Request, res: Response): Promise<void> {
    const { fileUUID, tableUUID } = req.params;

    if (!fileUUID || !tableUUID) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, tableUUID));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    await db.delete(overallResultsPoints).where(eq(overallResultsPoints.tableId, dbTable[0].id));

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, fileUUID));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    for (let i = 1, y = 5; i <= 16 && y <= 20; i++, y++) {
      await updateTeamList(
        fileUUID,
        i,
        {
          id: y,
          wwcd: 0,
          eliminations: 0,
          placementPoints: 0,
          total: 0,
        },
        dbTable,
        dbLottieLayers
      );
    }

    res.status(200).json({ message: 'Success' });
  }

  @errorHandler()
  static async resetOverallResults(req: Request, res: Response): Promise<void> {
    const { fileUUID, tableUUID } = req.params;

    if (!fileUUID || !tableUUID) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, tableUUID));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    await db.delete(overallResultsPoints).where(eq(overallResultsPoints.tableId, dbTable[0].id));

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, fileUUID));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    for (let i = 1, y = 5; i <= 20 && y <= 24; i++, y++) {
      await updateTeamList(
        fileUUID,
        i,
        {
          id: y,
          wwcd: 0,
          eliminations: 0,
          placementPoints: 0,
          total: 0,
        },
        dbTable,
        dbLottieLayers
      );
    }

    res.status(200).json({ message: 'Success' });
  }

  @errorHandler()
  static async updateMapView(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid } = req.body as CustomUpdateWWCDTeamRequest;

    if (!file_uuid || !table_uuid) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    // Updating the match number
    const lottieJsonPath = path.join(Config.LOTTIE_DIR_PATH, file_uuid, 'data.json');
    const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
    const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

    const matchNumberLayer = dbLottieLayers.find(layer => layer.name === 'DAY 1 MAP 1/5');
    const matchNumber = lottieJson.layers.find(layer => layer.ind === matchNumberLayer!.layerIndex);

    if (matchNumber) {
      // Extract the number from the current match text, increment it, and update the text
      const matchText = matchNumber.t!.d.k[0].s.t;
      // Match the pattern "DAY X MAP Y/Z" and increment Y
      const matchNumberMatch = matchText.match(/(DAY\s*\d+\s*MAP\s*)(\d+)\/(\d+)/i);
      if (matchNumberMatch) {
        const prefix = matchNumberMatch[1];
        const currentMap = parseInt(matchNumberMatch[2], 10);
        const totalMaps = matchNumberMatch[3];
        const newMap = Math.min(currentMap + 1, parseInt(totalMaps, 10));
        const newText = `${prefix}${newMap}/${totalMaps}`;
        await updateLottieLayer(file_uuid, matchNumberLayer!.layerIndex, newText);
      }
    }

    res.status(200).json({ message: 'Success' });
  }

  @errorHandler()
  static async updateMapRotation(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid, team, match_results_uuid } =
      req.body as CustomUpdateMapRotationRequest;

    if (!file_uuid || !table_uuid || !match_results_uuid) {
      res.status(404).json({ error: 'Body parameters are missing' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Lottie file not found' });
      return;
    }

    const dbMatchResultsLottieFile = await db
      .select()
      .from(lottieFile)
      .where(eq(lottieFile.uuid, match_results_uuid));

    if (dbMatchResultsLottieFile.length === 0) {
      res.status(404).json({ error: 'Match results lottie file not found' });
      return;
    }

    const dbLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const dbMatchResultsLottieLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbMatchResultsLottieFile[0].id));

    const matchResultsJsonPath = path.join(Config.LOTTIE_DIR_PATH, match_results_uuid, 'data.json');
    const matchResultsJsonFile = await fs.readFile(matchResultsJsonPath, 'utf-8');
    const matchResultsJson: LottieJson = JSON.parse(matchResultsJsonFile);

    const matchNumberLayer = dbMatchResultsLottieLayers.find(layer => layer.name === 'WEEK');
    const matchNumber = matchResultsJson.layers.find(
      layer => layer.ind === matchNumberLayer!.layerIndex
    );

    if (matchNumber) {
      const matchText = matchNumber.t!.d.k[0].s.t;
      const matchNumberMatch = matchText.match(/(\d+)$/);
      const currentMatchNumber = matchNumberMatch ? parseInt(matchNumberMatch[1], 10) : 0;
      const newMatchNumber = currentMatchNumber + 1;

      // Updating the match number in the match results
      await updateLottieLayer(
        match_results_uuid,
        matchNumberLayer!.layerIndex,
        `MATCH ${newMatchNumber}`
      );

      // Updating the team logo in the map rotation
      const teamLogoPath = path.join(
        Config.TABLES_DIR,
        dbTable[0].uuid,
        `${dbTable[0].largeLogoSize}x${dbTable[0].largeLogoSize}`,
        'white',
        `${team.id}.png`
      );
      const teamLogo = await fs.readFile(teamLogoPath);
      const teamLogoBase64 = teamLogo.toString('base64');

      // Updating logo
      const teamLogoLayer = dbLottieLayers.find(
        layer => layer.name === `MAP_${newMatchNumber}_TEAM`
      );
      await updateLottieLayer(file_uuid, teamLogoLayer!.layerIndex, teamLogoBase64);

      const teamLogoBGLayer = dbLottieLayers.find(
        layer => layer.name === `MAP_${newMatchNumber}_TEAM_BG`
      );

      await toggleLottieLayer(file_uuid, dbLottieFile[0].id, teamLogoLayer!.layerIndex, false);
      await toggleLottieLayer(file_uuid, dbLottieFile[0].id, teamLogoBGLayer!.layerIndex, false);
    }

    res.status(200).json({ message: 'Success' });
  }
}

export default CustomController;
