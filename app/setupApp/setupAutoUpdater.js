// External
import { remote } from 'electron';
import log from 'electron-log';
import path from 'path';

// Internal
import UIController from 'components/UIController';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';

const autoUpdater = remote.getGlobal('autoUpdater');

export default async function setupAutoUpdater(store) {
  const {
    settings: { settings },
  } = store.getState();

  autoUpdater.logger = log;
  autoUpdater.currentVersion = APP_VERSION;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(
      __dirname,
      '..',
      'dev-app-update.yml'
    );
  }
  autoUpdater.on('error', err => {
    console.error(err);
  });

  autoUpdater.on('update-available', updateInfo => {
    UIController.showNotification(
      `New wallet version ${updateInfo.version} available. Downloading...`,
      'success'
    );
  });

  autoUpdater.on('update-downloaded', updateInfo => {
    UIController.showBackgroundTask(AutoUpdateBackgroundTask, {
      version: updateInfo.version,
      autoUpdater: autoUpdater,
      stopAutoChecking: () => {
        autoCheckStopped = true;
      },
    });
  });

  if (settings.autoUpdate) {
    autoCheck();
  }
}

let autoCheckStopped = false;

async function autoCheck() {
  if (autoCheckStopped) return;
  const result = await autoUpdater.checkForUpdates();
  if (result.downloadPromise) {
    await result.downloadPromise;
  }
  // Check for updates every 2 hours
  setTimeout(autoCheck, 120 * 60 * 1000);
}
