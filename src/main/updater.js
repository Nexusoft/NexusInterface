import path from 'path';
import fs from 'fs';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import semver from 'semver';

import { assetsParentDir } from './paths';
import { EVENTS } from './ipc/contracts';

export function initializeUpdater(settings) {
  autoUpdater.logger = log;
  autoUpdater.currentVersion = semver.parse(APP_VERSION);
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(
      process.cwd(),
      'dev-app-update.yml'
    );
  }
  autoUpdater.allowPrerelease = !!settings.allowPrerelease;

  // Set Up channels
  const currentChannel = semver.parse(APP_VERSION).prerelease[0] || null;
  if (currentChannel) {
    autoUpdater.allowPrerelease = true;
    autoUpdater.channel = currentChannel;
    autoUpdater.allowDowngrade = false; // We do not have any mechanism to downgrade, as well as there can be issues with your core's chain.
    autoUpdater.autoDownload = false;
  }

  const updaterEvents = [
    'error',
    'checking-for-update',
    'update-available',
    'update-not-available',
    'download-progress',
    'update-downloaded',
  ];
  updaterEvents.forEach((eventName) => {
    autoUpdater.on(eventName, (...args) => {
      if (global.mainWindow) {
        const eventChannel =
          eventName === 'error'
            ? EVENTS.updater.error
            : eventName === 'checking-for-update'
            ? EVENTS.updater.checking
            : eventName === 'update-available'
            ? EVENTS.updater.available
            : eventName === 'update-not-available'
            ? EVENTS.updater.unavailable
            : eventName === 'download-progress'
            ? EVENTS.updater.downloadProgress
            : EVENTS.updater.downloaded;
        global.mainWindow.webContents.send(eventChannel, ...args);
      }

    });
  });
}

export async function getMarketData() {
  const response = await fetch(
    'https://api.dex-trade.com/v1/public/ticker?pair=NXSUSDT'
  );
  if (!response.ok) {
    throw new Error(`Market data request failed: ${response.status}`);
  }
  const payload = await response.json();
  const price = Number(payload?.data?.last);
  const changePct24Hr = Number(
    payload?.data?.['percent_сhange'] ?? payload?.data?.percent_change ?? 0
  );
  if (!payload?.status || !Number.isFinite(price) || !Number.isFinite(changePct24Hr)) {
    throw new Error('Market data response is invalid');
  }
  return { price, changePct24Hr, currency: 'USDT' };
}

export async function checkForUpdates() {
  if (process.env.NODE_ENV === 'development') {
    return { mode: 'disabled' };
  }

  if (!fs.existsSync(path.join(assetsParentDir, 'app-update.yml'))) {
    const response = await fetch(
      'https://api.github.com/repos/Nexusoft/NexusInterface/releases/latest',
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'NexusInterface' } }
    );
    if (!response.ok) {
      throw new Error(`GitHub release request failed: ${response.status}`);
    }
    const release = await response.json();
    if (
      !release ||
      typeof release.tag_name !== 'string' ||
      typeof release.prerelease !== 'boolean'
    ) {
      throw new Error('GitHub release response is invalid');
    }
    return {
      mode: 'github',
      release: {
        tagName: release.tag_name,
        prerelease: release.prerelease,
      },
    };
  }
  const result = await autoUpdater.checkForUpdates();
  return {
    mode: 'auto',
    updateInfo: result?.updateInfo
      ? { version: result.updateInfo.version }
      : undefined,
  };
}

export function setAllowPrerelease(value) {
  autoUpdater.allowPrerelease = !!value;
  if (value) {
    autoUpdater.checkForUpdates();
  }
}

//Mark updater to now use alpha ( this is for testnet -> alpha(mainnet))
export function migrateToMainnet() {
  autoUpdater.allowDowngrade = false;
  autoUpdater.channel = 'alpha';
  autoUpdater.checkForUpdates();
}
