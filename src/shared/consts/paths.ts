import fs from 'fs';
import path from 'path';
import { app, ipcRenderer } from 'electron';

const escapeSpace = (path: string) =>
  process.platform === 'darwin' ? path.replace(' ', `\ `) : path;

const exeDir = app
  ? app.getPath('exe')
  : ipcRenderer.sendSync('get-path', 'exe');
const appDataDir = escapeSpace(
  app ? app.getPath('appData') : ipcRenderer.sendSync('get-path', 'appData')
);

/**
 * Exports
 * =============================================================================
 */
export const walletDataDir = path.join(appDataDir, 'Nexus Wallet');
const settingsFileName = 'settings.json';
export const settingsFilePath = path.join(walletDataDir, settingsFileName);

export const defaultCoreDataDir =
  process.platform === 'win32' || process.platform === 'darwin'
    ? path.join(appDataDir, 'Nexus')
    : path.join(process.env['HOME'] || '', '/.Nexus');

export const assetsParentDir =
  process.env['NODE_ENV'] === 'development'
    ? process.cwd()
    : process.platform === 'darwin'
    ? path.resolve(exeDir, '..', '..', 'Resources')
    : path.resolve(exeDir, '..', 'resources');
export const assetsDir = path.join(assetsParentDir, 'assets');

export const assetsByPlatformDir =
  process.platform === 'win32' || process.platform === 'darwin'
    ? path.join(assetsDir, process.platform)
    : path.join(assetsDir, 'linux');

export const homeDir =
  process.platform === 'win32'
    ? process.env['USERPROFILE']
    : process.env['HOME'];

export const modulesDir = path.join(walletDataDir, 'modules');

/**
 * Start
 * =============================================================================
 */
if (!fs.existsSync(walletDataDir)) {
  fs.mkdirSync(walletDataDir);
}
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir);
}
