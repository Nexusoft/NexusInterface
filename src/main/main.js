// External
import { app, ipcMain, BrowserWindow, Tray, Menu, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import devToolsInstall, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

// Internal
import { assetsDir } from 'consts/paths';
import {
  loadSettingsFromFile,
  updateSettingsFile,
} from 'lib/settings/universal';
import { debounced } from 'utils/universal';

import core from './core';
import { getDomain, serveModuleFiles } from './fileServer';
import { createWindow } from './renderer';
import { setupTray } from './tray';

let mainWindow;

// Global Objects
global.core = core;
global.updater = autoUpdater;
global.forceQuit = false;

app.setAppUserModelId(APP_ID);

ipcMain.handle('get-file-server-domain', (event, ...args) =>
  getDomain(...args)
);
ipcMain.handle('serve-module-files', (event, ...args) =>
  serveModuleFiles(...args)
);

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
    const mainWindow = await createWindow();
    core.start();
    setupTray(mainWindow);
  });
}
