import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { Request, Response } from 'express';
import { eq, and, inArray } from 'drizzle-orm';

import { LottieFileConfig } from '@/lib/types';
import { LottieJson, getTextLayerContent, isLottieAssetImage } from '@/lib/lottie';

import Config from '@/config';
import logger from '@/config/logger';
import db from '@/db';

import { lottieFile, lottieLayer } from '@/db/schemas/lottie-file';
import { errorHandler } from '@/lib/decorators/error-handler';
import { prepareLottieBuildSource, copyLottieTemplates } from '@/lib/utils';
import { getLayersData } from '@/utils/lottie-sync';

interface UploadRequest {
  source: string;
  assets: string;
  layers: number[];
}

interface UpdateRequest {
  uuid: string;
  fileName: string;
  selectedLayers: number[];
  updatedLayers: { index: number; value: string }[];
  config: LottieFileConfig;
}

interface UpdateLayerRequest {
  uuid: string;
  layerIndex: number;
  value: string;
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
    const configFilePath = path.join(lottieDataDirPath, 'config.js');
    const configFile = await fs.readFile(configFilePath, 'utf-8');

    const configData = (() => {
      try {
        const configFn = new Function(`${configFile} return config;`);
        return configFn();
      } catch (error) {
        logger.error('Failed to parse config file:', error);
        return null;
      }
    })();

    const data = {
      name: dbLottieFile[0].name,
      uuid: dbLottieFile[0].uuid,
      url: `${Config.HOST}/${Config.LOTTIE_SYNC_DIR}/${dbLottieFile[0].uuid}/index.html`,
      lottieJson: JSON.parse(lottieJsonFile),
      selectedLayerIndices: selectedLayers.map(l => l.layerIndex),
      config: configData,
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
  static async update(req: Request, res: Response): Promise<void> {
    const { uuid, fileName, selectedLayers, updatedLayers, config } = req.body as UpdateRequest;

    if (!uuid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (fileName) {
      await db.update(lottieFile).set({ name: fileName }).where(eq(lottieFile.uuid, uuid));
    }

    const prevFileLayers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const newFileLayers = selectedLayers.map(layer => {
      return {
        fileId: dbLottieFile[0].id,
        layerIndex: layer,
      };
    });

    const removedLayers = prevFileLayers.filter(
      layer => !selectedLayers.some(selectedLayer => selectedLayer === layer.layerIndex)
    );

    if (removedLayers.length > 0) {
      await db.delete(lottieLayer).where(
        inArray(
          lottieLayer.id,
          removedLayers.map(layer => layer.id)
        )
      );
    }

    if (newFileLayers.length > 0) {
      await db.insert(lottieLayer).values(newFileLayers);
    }

    const lottieFileDirPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, dbLottieFile[0].uuid);

    const lottieJsonPath = path.join(lottieFileDirPath, 'data.json');
    const lottieJson: LottieJson = JSON.parse(await fs.readFile(lottieJsonPath, 'utf-8'));

    for (const updatedLayer of updatedLayers) {
      const actualLayer = lottieJson.layers.find(layer => layer.ind === updatedLayer.index);
      if (!actualLayer) continue;

      if (actualLayer.ty === 5 && actualLayer.t) {
        actualLayer.t.d.k[0].s.t = updatedLayer.value;
      }
      if (actualLayer.ty === 2 && actualLayer.refId) {
        const asset = lottieJson.assets?.find(a => a.id === actualLayer.refId);
        if (!asset) continue;

        if (isLottieAssetImage(asset)) {
          const imageName = asset.p.split('/').pop();
          if (!imageName) continue;

          const imagePath = path.join(lottieFileDirPath, 'assets', imageName);
          const base64Data = updatedLayer.value.replace(/^data:image\/\w+;base64,/, '');

          if (base64Data.length > 10 * 1024 * 1024) {
            res.status(400).json({ error: 'Image size must be less than 10MB' });
            return;
          }

          const buffer = Buffer.from(base64Data, 'base64');
          await fs.writeFile(imagePath, buffer);
        }
      }
    }

    await fs.writeFile(lottieJsonPath, JSON.stringify(lottieJson), 'utf-8');

    const configFilePath = path.join(lottieFileDirPath, 'config.js');
    await fs.writeFile(configFilePath, `const config = ${JSON.stringify(config)};`, 'utf-8');

    await db
      .update(lottieFile)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(lottieFile.id, dbLottieFile[0].id));

    res.json({ message: 'File updated successfully' });
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

  @errorHandler()
  static async layerContent(req: Request, res: Response): Promise<void> {
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

    const lottieFileDirPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid);

    const lottieJsonPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid, 'data.json');
    const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
    const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

    const layer = lottieJson.layers.find(layer => layer.ind === Number(layerIndex));

    if (!layer) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (layer.refId && lottieJson.assets) {
      const asset = lottieJson.assets.find(asset => asset.id === layer.refId);

      if (!asset) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      if (!isLottieAssetImage(asset)) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const ext = asset.p.split('.').pop();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      const imageBuffer = await fs.readFile(path.join(lottieFileDirPath, asset.u, asset.p));
      const imageBase64 = imageBuffer.toString('base64');
      const imageData = `data:${mimeType};base64, ${imageBase64}`;

      res.json({ data: imageData });
      return;
    } else if (layer.t) {
      res.json({ data: getTextLayerContent(layer) });
      return;
    } else {
      res.status(404).json({ error: 'Not found' });
      return;
    }
  }

  @errorHandler()
  static async getLayersData(req: Request, res: Response): Promise<void> {
    const { uuid } = req.params;

    if (!uuid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const dbLottieFile = await db.select().from(lottieFile).where(eq(lottieFile.uuid, uuid));

    if (dbLottieFile.length === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const layers = await db
      .select()
      .from(lottieLayer)
      .where(eq(lottieLayer.fileId, dbLottieFile[0].id));

    const lottieJsonPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid, 'data.json');
    const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
    const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

    const layersData = getLayersData(
      uuid,
      lottieJson.layers.filter(layer => layers.some(l => l.layerIndex === layer.ind))
    );

    res.json(layersData);
  }

  @errorHandler()
  static async updateLayer(req: Request, res: Response): Promise<void> {
    const { uuid, layerIndex, value } = req.body as UpdateLayerRequest;

    if (!uuid || !layerIndex || !value) {
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

    const layer = lottieJson.layers.find(layer => layer.ind === Number(layerIndex));

    if (!layer) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (layer.ty === 5 && layer.t) {
      layer.t.d.k[0].s.t = value;
    } else if (layer.ty === 2 && layer.refId) {
      const asset = lottieJson.assets?.find(a => a.id === layer.refId);
      if (!asset) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      if (isLottieAssetImage(asset)) {
        const imageName = asset.p.split('/').pop();
        if (!imageName) {
          res.status(404).json({ error: 'Not found' });
          return;
        }

        const imagePath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid, 'assets', imageName);
        const buffer = Buffer.from(value, 'base64');
        await fs.writeFile(imagePath, buffer);
      }
    }

    await fs.writeFile(lottieJsonPath, JSON.stringify(lottieJson));

    res.json({ message: 'Layer updated successfully' });
  }
}

export default LottieSyncController;
