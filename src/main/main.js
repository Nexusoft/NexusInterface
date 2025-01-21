import { app, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import { loadSettingsFromFile } from 'lib/settings/universal';
import {
  startCore,
  coreBinaryExists,
  executeCommand,
  isCoreRunning,
  killCoreProcess,
} from './core';
import { getDomain, serveModuleFiles } from './fileServer';
import { createWindow } from './renderer';
import { setupTray } from './tray';
import { setApplicationMenu, popupContextMenu } from './menu';
import { openVirtualKeyboard } from './keyboard';
import {
  initializeUpdater,
  migrateToMainnet,
  setAllowPrerelease,
} from './updater';
import { proxyRequest } from './modules';
import { initialize } from '@aptabase/electron/main';

let mainWindow;
global.forceQuit = false;
app.setAppUserModelId(APP_ID);
initialize('A-US-0744437796'); // This doesn't send anything so it is safe to fire even if the user has turned tracking off

log.initialize();

// Temporarily add this because there are some errors in autoUpdater.checkForUpdates
// cannot be caught (net::ERR_HTTP_RESPONSE_CODE_FAILURE).
// This should be removed when the issue is resolved.
// A similar issue: https://github.com/electron-userland/electron-builder/issues/2451
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// HANDLERS
// =============================================================================

// App
ipcMain.handle('is-force-quit', async () => global.forceQuit);
ipcMain.handle('quit-app', async () => {
  app.quit();
});
ipcMain.handle('exit-app', () => {
  app.exit();
});
ipcMain.handle('hide-window', () => mainWindow.hide());
ipcMain.handle('hide-dock', () => app.dock.hide());
ipcMain.handle('show-open-dialog', (event, options) =>
  dialog.showOpenDialogSync(mainWindow, options)
);
ipcMain.handle('show-save-dialog', async (event, options) =>
  dialog.showSaveDialogSync(mainWindow, options)
);
ipcMain.handle('popup-context-menu', (event, menuTemplate, webContentsId) =>
  popupContextMenu(menuTemplate, webContentsId)
);
ipcMain.handle('set-app-menu', (event, menuTemplate) => {
  setApplicationMenu(menuTemplate);
});
ipcMain.handle('open-virtual-keyboard', (event, ...args) => {
  openVirtualKeyboard(...args);
});

// File server
ipcMain.handle('serve-module-files', (event, ...args) =>
  serveModuleFiles(...args)
);

// Core
ipcMain.handle('check-core-exists', async () => await coreBinaryExists());
ipcMain.handle('check-core-running', async () => await isCoreRunning());
ipcMain.handle('start-core', (event, ...args) => startCore(...args));
ipcMain.handle('kill-core-process', async () => await killCoreProcess());
ipcMain.handle(
  'execute-core-command',
  async (event, command) => await executeCommand(command)
);

// Auto update
ipcMain.handle('check-for-updates', (event, ...args) =>
  autoUpdater.checkForUpdates(...args)
);
ipcMain.handle('quit-and-install-update', (event, ...args) =>
  autoUpdater.quitAndInstall(...args)
);
ipcMain.handle('set-allow-prerelease', (event, value) =>
  setAllowPrerelease(value)
);
ipcMain.handle('migrate-to-mainnet', (event, value) => migrateToMainnet());

// Sync message handlers
ipcMain.on('get-path', (event, name) => {
  event.returnValue = app.getPath(name);
});
ipcMain.on('get-file-server-domain', (event) => {
  event.returnValue = getDomain();
});

// Modules
ipcMain.handle('proxy-request', (event, ...params) => proxyRequest(...params));

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
    const settings = loadSettingsFromFile();
    initializeUpdater(settings);
    global.mainWindow = mainWindow = await createWindow(settings);
    mainWindow.on('close', () => {
      mainWindow.webContents.send('window-close');
    });
    global.tray = setupTray(mainWindow);
  });
}
