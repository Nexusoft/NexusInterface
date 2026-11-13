import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { dialog } from 'electron';

import { assertExternalUrl, assertRecord } from './ipc/contracts';
import { walletDataDir } from './paths';
import { loadTheme, saveTheme } from './settings';

const wallpaperExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];
const maxWallpaperBytes = 10 * 1024 * 1024;
const wallpaperDownloadTimeoutMs = 30_000;

function toFileUrl(filePath) {
  return pathToFileURL(filePath).toString();
}

function getWallpaperFileName(url) {
  const parsed = new URL(url);
  const extension = path.extname(parsed.pathname).toLowerCase();
  if (!wallpaperExtensions.includes(extension.slice(1))) {
    throw new Error('Wallpaper URL has an unsupported file type');
  }
  return `wallpaper${extension}`;
}

async function downloadWallpaper(url) {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, wallpaperDownloadTimeoutMs);

  try {
    const response = await fetch(url, {
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      throw new Error('Unable to download theme wallpaper');
    }
    const contentLength = Number(response.headers.get('content-length'));
    if (contentLength > maxWallpaperBytes) {
      throw new Error('Theme wallpaper exceeds the 10 MB limit');
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > maxWallpaperBytes) {
        throw new Error('Theme wallpaper exceeds the 10 MB limit');
      }
      chunks.push(chunk);
    }
    return Buffer.concat(chunks, size);
  } catch (error) {
    if (timedOut) throw new Error('Theme wallpaper download timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}

export async function selectWallpaper(mainWindow) {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select wallpaper',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: wallpaperExtensions }],
  });
  return result.canceled || !result.filePaths[0]
    ? undefined
    : toFileUrl(result.filePaths[0]);
}

export async function importTheme(mainWindow) {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select custom theme file',
    properties: ['openFile'],
    filters: [{ name: 'Theme JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePaths[0]) return undefined;

  const contents = await fs.readFile(result.filePaths[0], 'utf8');
  const importedTheme = assertRecord(JSON.parse(contents), 'Imported theme');
  if (typeof importedTheme.wallpaper === 'string' && /^https?:/i.test(importedTheme.wallpaper)) {
    const wallpaperUrl = assertExternalUrl(importedTheme.wallpaper, 'Theme wallpaper URL');
    const wallpaperPath = path.join(walletDataDir, getWallpaperFileName(wallpaperUrl));
    const wallpaper = await downloadWallpaper(wallpaperUrl);
    await fs.writeFile(wallpaperPath, wallpaper, { mode: 0o600 });
    importedTheme.wallpaper = toFileUrl(wallpaperPath);
  }
  const theme = { ...loadTheme(), ...importedTheme };
  return saveTheme(theme);
}

export async function exportTheme(mainWindow) {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Theme File',
    filters: [{ name: 'Theme JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return false;
  await fs.writeFile(result.filePath, JSON.stringify(loadTheme(), null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  return true;
}
