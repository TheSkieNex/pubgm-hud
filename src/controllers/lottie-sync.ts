import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { Request, Response } from 'express';

import Config from '@/config';
import { LottieJson, isLottieAssetImage } from '@/lib/lottie';
import { errorHandler } from '@/lib/decorators/error-handler';
import { prepareLottieBuildSource, copyLottieTemplates } from '@/lib/utils';

import db from '@/db';
import { lottieFile } from '@/db/schemas/lottie-file';

class LottieSyncUploadController {
  @errorHandler()
  static async upload(req: Request, res: Response): Promise<void> {
    const { source, assets } = req.body;

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
    for (const file of JSON.parse(assets)) {
      const destFilePath = path.join(assetsDirPath, file.name);
      const buffer = Buffer.from(file.data, 'base64');

      await fs.writeFile(destFilePath, buffer);
    }

    await copyLottieTemplates(destDirPath);

    res.send('ok');
  }
}

export default LottieSyncUploadController;
