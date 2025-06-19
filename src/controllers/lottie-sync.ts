import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';

import Config from '@/config';
import { LottieJson, isLottieAssetImage } from '@/lib/lottie';
import { errorHandler } from '@/lib/decorators/error-handler';
import { prepareLottieBuildSource, copyLottieTemplates } from '@/lib/utils';

import db from '@/db';
import { lottieFile, lottieLayer } from '@/db/schemas/lottie-file';

interface UploadRequest {
  source: string;
  assets: string;
  layers: number[];
}

class LottieSyncController {
  @errorHandler()
  static async get(req: Request, res: Response): Promise<void> {
    const { uuid } = req.query;

    if (!uuid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dbLottieFile = await db
      .select()
      .from(lottieFile)
      .where(eq(lottieFile.uuid, uuid as string));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const selectedLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const lottieDataDirPath = path.join(Config.LOTTIE_SYNC_DIR, dbLottieFile[0].uuid);
    const lottieJsonFile = await fs.readFile(path.join(lottieDataDirPath, 'data.json'), 'utf-8');

    const data = {
      url: `${Config.HOST}/assets/${dbLottieFile[0].uuid}/index.html`,
      lottieJson: lottieJsonFile,
      selectedLayerIndices: selectedLayers.map(l => l.layerIndex),
    };

    res.json(data);
  }

  @errorHandler()
  static async upload(req: Request, res: Response): Promise<void> {
    const { source, assets, layers } = req.body as UploadRequest;

    await prepareLottieBuildSource();

    const sourceBuffer = Buffer.from(source, 'base64');
    const jsonData: LottieJson = JSON.parse(sourceBuffer.toString());

    const dbLottieFile = await db
      .insert(lottieFile)
      .values({
        name: jsonData.nm,
        uuid: crypto.randomUUID(),
      })
      .returning();

    await db.insert(lottieLayer).values(
      layers.map(layerIndex => ({
        fileId: dbLottieFile[0].id,
        layerIndex,
      }))
    );

    const destDirPath = path.join(Config.LOTTIE_SYNC_DIR, dbLottieFile[0].uuid);
    await fs.mkdir(destDirPath, { recursive: true });

    const assetsDirPath = path.join(destDirPath, 'assets');
    await fs.mkdir(assetsDirPath, { recursive: true });

    // Source
    jsonData.assets = jsonData.assets?.map(asset => {
      if (isLottieAssetImage(asset)) {
        return {
          ...asset,
          u: 'assets/',
        };
      }

      return asset;
    });

    const destSourceFilePath = path.join(destDirPath, 'data.json');
    await fs.writeFile(destSourceFilePath, JSON.stringify(jsonData));

    // Assets
    for (const file of JSON.parse(assets) as {
      name: string;
      type: string;
      data: string;
    }[]) {
      const destFilePath = path.join(assetsDirPath, file.name);
      const buffer = Buffer.from(file.data, 'base64');

      await fs.writeFile(destFilePath, buffer);
    }

    await copyLottieTemplates(destDirPath);

    res.send('ok');
  }
}

export default LottieSyncController;
