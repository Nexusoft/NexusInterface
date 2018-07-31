/* eslint global-require: 1*/

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 *
 */
import { app, BrowserWindow, remote, Tray, Menu, ipcMain } from "electron";
import MenuBuilder from "./menu";
import electron from "electron";

import {autoUpdater} from "electron-updater";
import log from "electron-log"
import settings from "./script/settings";

// import menu from "../app/menu/mainmenu"
const path = require("path");
let mainWindow = null;
let tray = null;

//
// Configure Updater
//

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
  const path = require("path");
  const p = path.join(__dirname, "..", "app", "node_modules");
  require("module").globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }
  // TODO: figure out the icon thing
  mainWindow = new BrowserWindow({
    show: false,
    width: 1600,
    height: 1650,
    icon: __dirname + "/images/nexus-logo.png"
  });

  setupTray();

  //  __dirname:    /home/dillon/Desktop/Nexus-Interface-React/app
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    //mainWindow = null;
  });

  // Event when the window is minimized
  mainWindow.on('minimize',function(event){

    //let settings = require("./api/settings").GetSettings();

    //if (settings.minimizeToTray === "true") {
      event.preventDefault();
      mainWindow.hide();
   // }

  });

  // Event when the window is requested to be closed
  mainWindow.on('close', function (event) {

    //let settings = require("./api/settings").GetSettings();

    if(!app.isQuiting && settings.minimizeOnClose === "true") {

        event.preventDefault();
        mainWindow.hide();
        
    }

  });


});

//
// Set up the icon in the system tray
//

function setupTray() {

  tray = new Tray(__dirname + "/images/nexus-logo.png")

  var contextMenu = Menu.buildFromTemplate([
      {
          label: 'Open Nexus', click: function () {
            mainWindow.show();
          }
      },
      {
          label: 'Quit Nexus', click: function () {
              app.isQuiting = true;
              mainWindow.close();
          }
      }
  ])

  tray.setContextMenu(contextMenu);

}

//
// Initialize application updater and check for updates
//

function updateApplication() {

  //
  // TODO: IMPORTANT: Prior to going live, remove this code and revoke the github token. Feed URL logic only applies with a private github repository
  //

  const data = {
    'provider': 'github',
    'owner':    'Nexusoft',
    'repo':     'NexusInterface',
    'token':    "606ac051f55833592161e2e87334fe57c218ae9c"
  };

  autoUpdater.setFeedURL(data);
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();

}

//
// Auto Updater Events
//

autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-checking');
});

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow.webContents.send('update-not-available');
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('update-download-progress', progress);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update-downloaded');
});

autoUpdater.on('error', (err) => {
  mainWindow.webContents.send('update-error', err);
});

//
// Application Events
//

ipcMain.on("update-application", (event, arg) => {
  updateApplication();
});

ipcMain.on("update-download", (event, arg) => {
  autoUpdater.downloadUpdate(); 
});

ipcMain.on("update-quit-and-install", (event, arg) => {
  autoUpdater.quitAndInstall();
});

