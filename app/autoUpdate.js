import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

// autoUpdater.currentVersion = APP_VERSION;
// autoUpdater.autoDownload = true;
// autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('error', (...args) => {
  console.log('error', ...args);
});

autoUpdater.on('checking-for-update', (...args) => {
  console.log('checking-for-update', ...args);
});

autoUpdater.on('update-available', (...args) => {
  console.log('update-available', ...args);
});

autoUpdater.on('update-not-available', (...args) => {
  console.log('update-not-available', ...args);
});

autoUpdater.on('download-progress', (...args) => {
  console.log('download-progress', ...args);
});

autoUpdater.on('update-downloaded', (...args) => {
  console.log('update-downloaded', ...args);
});

app.on('ready', function() {
  console.log('check for updates');
  autoUpdater.checkForUpdatesAndNotify();
});
