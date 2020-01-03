import path from 'path';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

autoUpdater.logger = log;
autoUpdater.currentVersion = APP_VERSION;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;
if (process.env.NODE_ENV === 'development') {
  autoUpdater.updateConfigPath = path.join(process.cwd(), 'dev-app-update.yml');
}

const updaterEvents = [
  'error',
  'checking-for-update',
  'update-available',
  'update-not-available',
  'download-progress',
  'update-downloaded',
];
updaterEvents.forEach(eventName => {
  autoUpdater.on(eventName, (...args) => {
    if (global.mainWindow) {
      global.mainWindow.webContents.send('updater:' + eventName, ...args);
    }
  });
});
