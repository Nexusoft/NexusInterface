import fs from 'fs';
import path from 'path';
import electron from 'electron';

const app = electron.app || electron.remote.app;

const escapeSpace = path =>
  process.platform === 'darwin' ? path.replace(' ', `\ `) : path;

const appDataDir = escapeSpace(
  app.getPath('appData').replace('/Electron/', '')
);

/**
 * Exports
 * =============================================================================
 */
export const walletDataDir = path.join(appDataDir, 'Nexus_Wallet');

export const coreDataDir =
  process.platform === 'win32' || process.platform === 'darwin'
    ? path.join(appDataDir, 'Nexus')
    : path.join(process.env.HOME, '/.Nexus');

const assetsParentDir =
  process.env.NODE_ENV === 'development'
    ? process.cwd()
    : process.platform === 'darwin'
    ? path.resolve(app.getPath('exe'), '..', '..', 'Resources')
    : path.resolve(app.getPath('exe'), '..', 'resources');
export const assetsDir = path.join(assetsParentDir, 'assets');

export const assetsByPlatformDir =
  process.platform === 'win32' || process.platform === 'darwin'
    ? path.join(assetsDir, process.platform)
    : path.join(assetsDir, 'linux');

export const homeDir =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;

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
