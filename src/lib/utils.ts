import path from 'node:path';
import fs from 'node:fs/promises';

import { and, eq } from 'drizzle-orm';

import Config from '../config';
import db from '../db';
import { lottieLayer } from '../db/schemas/lottie-file';
import { isLottieAssetImage } from './lottie';
import { LottieJson } from './lottie';

export async function prepareLottieBuildSource() {
  const buildFile = path.join(Config.LOTTIE_DIR_PATH, '_utils', 'lottie.js');
  const buildDir = path.dirname(buildFile);

  const commitSHA = '507be7fa7fbf748962dd7b1b190d99cc9cf6079b';

  try {
    return await fs.access(buildFile);
  } catch {
    const url = `https://raw.githubusercontent.com/airbnb/lottie-web/${commitSHA}/build/player/lottie.js`;
    const response = await fetch(url);
    const data = await response.text();
    await fs.mkdir(buildDir, { recursive: true });
    await fs.writeFile(buildFile, data);
  }
}

export async function copyLottieTemplates(destDirPath: string) {
  const templatesDirPath = path.join(Config.BASE_DIR, 'templates', 'lottie');
  const templateFiles = await fs.readdir(templatesDirPath);
  const templateFilesWithPath = templateFiles.map(file => path.join(templatesDirPath, file));

  for (const templateFilePath of templateFilesWithPath) {
    const destFilePath = path.join(destDirPath, path.basename(templateFilePath));
    await fs.copyFile(templateFilePath, destFilePath);
  }
}

export async function updateLottieLayer(uuid: string, layerIndex: number, value: string) {
  const lottieJsonPath = path.join(Config.LOTTIE_DIR_PATH, uuid, 'data.json');
  const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
  const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

  const layer = lottieJson.layers.find(layer => layer.ind === Number(layerIndex));

  if (!layer) {
    return null;
  }

  if (layer.ty === 5 && layer.t) {
    layer.t.d.k[0].s.t = value;
  } else if (layer.ty === 2 && layer.refId) {
    const asset = lottieJson.assets?.find(a => a.id === layer.refId);
    if (!asset) {
      return null;
    }

    if (isLottieAssetImage(asset)) {
      const imageName = asset.p.split('/').pop();
      if (!imageName) {
        return null;
      }

      const imagePath = path.join(Config.LOTTIE_DIR_PATH, uuid, 'assets', imageName);
      const buffer = Buffer.from(value, 'base64');
      await fs.writeFile(imagePath, buffer);
    }
  }

  await fs.writeFile(lottieJsonPath, JSON.stringify(lottieJson));

  return lottieJson;
}

export async function toggleLottieLayer(
  uuid: string,
  dbLottieFileId: number,
  layerIndex: number,
  hide?: boolean
) {
  const lottieJsonPath = path.join(Config.LOTTIE_DIR_PATH, uuid, 'data.json');
  const lottieJsonFile = await fs.readFile(lottieJsonPath, 'utf-8');
  const lottieJson: LottieJson = JSON.parse(lottieJsonFile);

  const dbLayer = await db
    .select()
    .from(lottieLayer)
    .where(
      and(eq(lottieLayer.fileId, dbLottieFileId), eq(lottieLayer.layerIndex, Number(layerIndex)))
    );

  if (dbLayer.length === 0) {
    return null;
  }

  const layer = lottieJson.layers.find(layer => layer.ind === Number(layerIndex));

  if (!layer) {
    return null;
  }

  // In point is the layer's start time, out point is the layer's end time.
  // To toggle the layer, we use layer's out point, we set it to the layer's in point for the layer to be invisible.
  // And we save the previous out point in the database, in order to restore the layer's visibility back to its original state.
  // 'Visible' layer wouldn't have the same out point as the in point.

  const outPoint = hide ? layer.ip : layer.op === layer.ip ? dbLayer[0].outPoint : layer.ip;

  if (layer.op !== layer.ip) {
    await db
      .update(lottieLayer)
      .set({ outPoint: layer.op })
      .where(eq(lottieLayer.id, dbLayer[0].id));
  }

  lottieJson.layers = lottieJson.layers.map(layer => {
    if (layer.ind === Number(layerIndex)) {
      return { ...layer, op: outPoint };
    }
    return layer;
  });

  await fs.writeFile(lottieJsonPath, JSON.stringify(lottieJson));

  return outPoint;
}
