import path from 'node:path';
import fs from 'node:fs/promises';

import Config from '../config';
import { isLottieAssetImage } from './lottie';
import { LottieJson } from './lottie';

export async function prepareLottieBuildSource() {
  const buildFile = path.join(Config.LOTTIE_SYNC_DIR_PATH, '_utils', 'lottie.js');
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
  const templatesDirPath = path.join(Config.BASE_DIR, 'templates', 'lottie-sync');
  const templateFiles = await fs.readdir(templatesDirPath);
  const templateFilesWithPath = templateFiles.map(file => path.join(templatesDirPath, file));

  for (const templateFilePath of templateFilesWithPath) {
    const destFilePath = path.join(destDirPath, path.basename(templateFilePath));
    await fs.copyFile(templateFilePath, destFilePath);
  }
}

export async function updateLottieLayer(uuid: string, layerIndex: number, value: string) {
  const lottieJsonPath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid, 'data.json');
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

      const imagePath = path.join(Config.LOTTIE_SYNC_DIR_PATH, uuid, 'assets', imageName);
      const buffer = Buffer.from(value, 'base64');
      await fs.writeFile(imagePath, buffer);
    }
  }

  await fs.writeFile(lottieJsonPath, JSON.stringify(lottieJson));

  return lottieJson;
}
