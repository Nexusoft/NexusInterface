// External
import { app, ipcMain, BrowserWindow, Tray, Menu, screen } from 'electron';
import { autoUpdater } from 'electron-updater';

import { startCore, stopCore, restartCore, getCoreConfig } from './core';
import { getDomain, serveModuleFiles } from './fileServer';
import { createWindow } from './renderer';
import { setupTray } from './tray';

let mainWindow;
// Global Objects
global.forceQuit = false;

app.setAppUserModelId(APP_ID);

// HANDLERS
// =============================================================================

ipcMain.handle('is-force-quit', async () => global.forceQuit);
// File server
ipcMain.handle('get-file-server-domain', async (event, ...args) =>
  getDomain(...args)
);
ipcMain.handle('serve-module-files', (event, ...args) =>
  serveModuleFiles(...args)
);

// Core
ipcMain.handle('start-core', (event, ...args) => startCore(...args));
ipcMain.handle('stop-core', (event, ...args) => stopCore(...args));
ipcMain.handle('restart-core', (event, ...args) => restartCore(...args));
ipcMain.handle('get-core-config', (event, ...args) => getCoreConfig(...args));

// Auto update
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
    if (mainWindow) {
      mainWindow.webContents.send('updater-' + eventName, ...args);
    }
  });
});
ipcMain.handle('check-for-updates', (event, ...args) =>
  autoUpdater.checkForUpdates(...args)
);
ipcMain.handle('quit-and-install-update', (event, ...args) =>
  autoUpdater.quitAndInstall(...args)
);
ipcMain.handle('initialize-updater', (event, configs) => {
  Object.entries(configs).forEach(([key, value]) => {
    autoUpdater[key] = value;
  });
});

// START RENDERER
// =============================================================================
// Ensure only one instance of the wallet is run
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      mainWindow.show();
      if (process.platform === 'darwin') {
        app.dock.show();
      }
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Application Startup
  app.on('ready', async () => {
    mainWindow = await createWindow();
    start();
    setupTray(mainWindow);
  });
}
