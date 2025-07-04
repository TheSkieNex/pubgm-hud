import path from 'node:path';
import fs from 'node:fs/promises';

import { eq, and } from 'drizzle-orm';
import { Request, Response } from 'express';

import Config from '../../config';
import db from '../../db';

import { CustomUpdateWWCDTeamRequest } from './types';
import { lottieFile, lottieLayer } from '../../db/schemas/lottie-file';
import { table, team as dbTeam } from '../../db/schemas/table';
import { errorHandler } from '../../lib/decorators/error-handler';
import { updateLottieLayer, toggleLottieLayer } from '../../lib/utils';

class CustomController {
  @errorHandler()
  static async updateWWCDTeam(req: Request, res: Response): Promise<void> {
    const { file_uuid, table_uuid, team } = req.body as CustomUpdateWWCDTeamRequest;

    if (!file_uuid || !table_uuid || !team) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dbTable = await db.select().from(table).where(eq(table.uuid, table_uuid));

    if (dbTable.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, file_uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Not found' });
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
      Config.STATIC_DIR,
      'tables',
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

    if (team.players.length === 4) {
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
          player.granades_used.toString()
        );

        // SURVIVAL TIME
        const survivalTimeLayer = dbLottieLayers.find(
          layer => layer.name === `SURVIVAL_TIME_TEXT_CONTENT_${playerIndex}`
        );
        await updateLottieLayer(
          file_uuid,
          survivalTimeLayer!.layerIndex,
          player.survival_time.toString()
        );
      }
    } else if (team.players.length === 3) {
      await toggleLottieLayer(file_uuid, dbLottieFile[0].id, 1);
    }

    res.status(200).json({ message: 'Success' });
  }
}

export default CustomController;
