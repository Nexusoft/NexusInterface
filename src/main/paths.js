import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const exeDir = app.getPath('exe');
const appDataDir = app.getPath('appData');

export const walletDataDir = path.join(appDataDir, 'Nexus Wallet');
export const settingsFilePath = path.join(walletDataDir, 'settings.json');
export const themeFilePath = path.join(walletDataDir, 'theme.json');
export const addressBookFilePath = path.join(walletDataDir, 'addressbook.json');
export const modulesDir = path.join(walletDataDir, 'modules');
export const moduleDownloadDir = path.join(walletDataDir, '.downloads');
export const temporaryModuleDir = path.join(walletDataDir, '.temp_module');

export const defaultCoreDataDir =
  process.platform === 'win32' || process.platform === 'darwin'
    ? path.join(appDataDir, 'Nexus')
    : path.join(process.env.HOME || app.getPath('home'), '.Nexus');

export const assetsParentDir =
  process.env.NODE_ENV === 'development'
    ? process.cwd()
    : process.platform === 'darwin'
    ? path.resolve(exeDir, '..', '..', 'Resources')
    : path.resolve(exeDir, '..', 'resources');
export const assetsDir = path.join(assetsParentDir, 'assets');
export const assetsByPlatformDir = path.join(
  assetsDir,
  process.platform === 'win32' || process.platform === 'darwin'
    ? process.platform
    : 'linux'
);

export function ensureApplicationDirectories() {
  for (const directory of [walletDataDir, modulesDir, moduleDownloadDir]) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function getModulePreloadPath() {
  return process.env.NODE_ENV === 'development'
    ? path.resolve(process.cwd(), 'build', 'module_preload.dev.js')
    : path.resolve(__dirname, 'module_preload.prod.js');
}
