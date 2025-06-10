import path from 'path';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import semver from 'semver';

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
        global.mainWindow.webContents.send('updater:' + eventName, ...args);
      }
    });
  });
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
