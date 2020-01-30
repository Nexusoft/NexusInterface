import { app, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

import {
  startCore,
  stopCore,
  restartCore,
  getCoreConfig,
  executeCommand,
} from './core';
import { getDomain, serveModuleFiles } from './fileServer';
import { createWindow } from './renderer';
import { setupTray } from './tray';
import { setApplicationMenu, popupContextMenu } from './menu';
import { openVirtualKeyboard } from './keyboard';
import './updater';

let mainWindow;
global.forceQuit = false;
app.setAppUserModelId(APP_ID);

// Temporarily add this because there are some errors in autoUpdater.checkForUpdates
// cannot be caught (net::ERR_HTTP_RESPONSE_CODE_FAILURE).
// This should be removed when the issue is resolved.
// A similar issue: https://github.com/electron-userland/electron-builder/issues/2451
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
});

// HANDLERS
// =============================================================================

// App
ipcMain.handle('is-force-quit', async () => global.forceQuit);
ipcMain.handle('quit-app', () => app.quit());
ipcMain.handle('exit-app', () => app.exit());
ipcMain.handle('hide-window', () => mainWindow.hide());
ipcMain.handle('hide-dock', () => app.dock.hide());
ipcMain.handle('show-open-dialog', (event, options) =>
  dialog.showOpenDialogSync(mainWindow, options)
);
ipcMain.handle('show-save-dialog', async (event, options) =>
  dialog.showSaveDialogSync(mainWindow, options)
);
ipcMain.handle('popup-context-menu', (event, menuTemplate) =>
  popupContextMenu(menuTemplate)
);
ipcMain.handle('set-app-menu', (event, menuTemplate) => {
  setApplicationMenu(menuTemplate);
});
ipcMain.handle('open-virtual-keyboard', (event, ...args) => {
  openVirtualKeyboard(...args);
});

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
ipcMain.handle(
  'execute-command',
  async (event, command) => await executeCommand(command)
);
ipcMain.handle('get-core-config', async () => getCoreConfig());

// Auto update
ipcMain.handle('check-for-updates', (event, ...args) =>
  autoUpdater.checkForUpdates(...args)
);
ipcMain.handle('quit-and-install-update', (event, ...args) =>
  autoUpdater.quitAndInstall(...args)
);

// Sync message handlers
ipcMain.on('get-path', (event, name) => {
  event.returnValue = app.getPath(name);
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
    global.mainWindow = mainWindow = await createWindow();
    mainWindow.on('close', (...args) =>
      mainWindow.webContents.send('window-close', ...args)
    );
    startCore();
    global.tray = setupTray(mainWindow);
  });
}
