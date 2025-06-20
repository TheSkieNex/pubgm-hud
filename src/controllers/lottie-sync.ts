import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';

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
    const { uuid } = req.params;

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

    const lottieDataDirPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, dbLottieFile[0].uuid);
    const lottieJsonFile = await fs.readFile(path.join(lottieDataDirPath, 'data.json'), 'utf-8');

    const data = {
      name: dbLottieFile[0].name,
      uuid: dbLottieFile[0].uuid,
      url: `${Config.HOST}/${Config.LOTTIE_SYNC_DIR}/${dbLottieFile[0].uuid}/index.html`,
      lottieJson: JSON.parse(lottieJsonFile),
      selectedLayerIndices: selectedLayers.map(l => l.layerIndex),
    };

    res.json(data);
  }

  @errorHandler()
  static async getAll(req: Request, res: Response): Promise<void> {
    const lottieFiles = await db.select().from(lottieFile);

    if (lottieFiles.length === 0) {
      res.json([]);
      return;
    }

    const data = lottieFiles.map(file => ({
      uuid: file.uuid,
      name: file.name,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      url: `${Config.HOST}/${Config.LOTTIE_SYNC_DIR}/${file.uuid}/index.html`,
    }));

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

    const destDirPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, dbLottieFile[0].uuid);
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

  @errorHandler()
  static async delete(req: Request, res: Response): Promise<void> {
    const { uuid } = req.params;

    if (!uuid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dataDirPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid);

    await db.delete(lottieFile).where(eq(lottieFile.uuid, uuid));
    await fs.rm(dataDirPath, { recursive: true });

    res.json({ message: 'File deleted successfully' });
  }

  @errorHandler()
  static async toggleLayer(req: Request, res: Response): Promise<void> {
    const { uuid, layerIndex } = req.params;

    if (!uuid || !layerIndex) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const lottieJsonPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid, 'data.json');
    const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
    const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

    const dbLayer = await db
      .select()
      .from(lottieLayer)
      .where(
        and(
          eq(lottieLayer.fileId, dbLottieFile[0].id),
          eq(lottieLayer.layerIndex, Number(layerIndex))
        )
      );

    if (dbLayer.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const layer = lottieJson.layers.find(layer => layer.ind === Number(layerIndex));

    if (!layer) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    // In point is the layer's start time, out point is the layer's end time.
    // To toggle the layer, we use layer's out point, we set it to the layer's in point for the layer to be invisible.
    // And we save the previous out point in the database, in order to restore the layer's visibility back to its original state.
    // 'Visible' layer wouldn't have the same out point as the in point.

    const outPoint = layer.op === layer.ip ? dbLayer[0].outPoint : layer.ip;

    await db
      .update(lottieLayer)
      .set({ outPoint: layer.op })
      .where(eq(lottieLayer.id, dbLayer[0].id));

    lottieJson.layers = lottieJson.layers.map(layer => {
      if (layer.ind === Number(layerIndex)) {
        return { ...layer, op: outPoint };
      }
      return layer;
    });

    await fs.writeFile(lottieJsonPath, JSON.stringify(lottieJson));

    res.json({ op: outPoint });
  }
}

export default LottieSyncController;
