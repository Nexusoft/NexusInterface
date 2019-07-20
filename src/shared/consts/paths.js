import fs from 'fs';
import fse from 'fs-extra';
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
export const walletDataDir = path.join(appDataDir, 'Nexus Wallet');

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

export function fileExists(inPath) {
  return fs.existsSync(inPath);
}

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

//TODO: REMOVE THIS AFTER >1.3
if (fse.existsSync(walletDataDir.replace('Nexus Wallet', 'Nexus_Wallet'))) {
  console.log('Has Bad Folder');
  const doNotCopyList = [
    'Cache',
    'GPUCache',
    'Local Storage',
    'Cookies',
    'Cookies-journal',
    'log.log',
    'Perferences',
  ];
  const badFolder = walletDataDir.replace('Nexus Wallet', 'Nexus_Wallet');
  const filterFunc = (src, dest) => {
    const filename = src && src.replace(/^.*[\\\/]/, '');
    return !doNotCopyList.includes(filename);
  };
  fse.copySync(badFolder, walletDataDir, {
    filter: filterFunc,
  });
  fse.removeSync(badFolder);
}
