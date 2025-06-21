import path from 'node:path';
import fs from 'node:fs/promises';

import Config from '@/config';

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
  const templatesDirPath = path.join(Config.BASE_DIR, 'templates');
  const templateFiles = await fs.readdir(templatesDirPath);
  const templateFilesWithPath = templateFiles.map(file => path.join(templatesDirPath, file));

  for (const templateFilePath of templateFilesWithPath) {
    const destFilePath = path.join(destDirPath, path.basename(templateFilePath));
    await fs.copyFile(templateFilePath, destFilePath);
  }
}
