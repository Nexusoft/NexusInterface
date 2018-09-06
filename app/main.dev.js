import { app, BrowserWindow, remote, Tray, Menu, ipcMain } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import MenuBuilder from "./menu";
import core from "./api/core";

const path = require("path");

let mainWindow;
let tray;
let resizeTimer;

// Global Objects
global.core = core;

// Configure Updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Enable source map support
if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

require("electron-debug")();
const p = path.join(__dirname, "..", "app", "node_modules");
require("module").globalPaths.push(p);

// Enable development tools for REACT and REDUX
const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

// Initialize application updater and check for updates
function updateApplication() {
  // TODO: IMPORTANT: Prior to going live, remove this code and revoke the github token. Feed URL logic only applies with a private github repository
  // ************* Done I removed it.
}

// Set up the icon in the system tray
function setupTray() {
  let trayImage;

  if (process.platform == "darwin") {
    trayImage = path.join(__dirname, "/images/tray/iconTemplate.png");
  } else {
    trayImage = path.join(__dirname, "/images/tray/icon.png");
  }

  tray = new Tray(trayImage);

  if (process.platform == "darwin") {
    tray.setPressedImage(
      path.join(__dirname, "/images/tray/iconHighlight.png")
    );
  }

  var contextMenu = Menu.buildFromTemplate([
      {
          label: 'Open Nexus', click: function () {
            mainWindow.show();
          }
      },
      {
          label: 'Quit Nexus', click: function () {
              app.isQuiting = true;
              let settings = require("./api/settings").GetSettings();
              if (settings.manualDaemon == false){
                RPC.PROMISE("stop",[]).then(payload =>
                  {
                    console.log(payload);
                    setTimeout(() => {
                      remote.getCurrentWindow().close();
                    }, 1000);
                  });
              }
              else
              {
                mainWindow.close();
              }

          }
      }
  ]);

  tray.setContextMenu(contextMenu);
}

//
// Create Application Window
//

function createWindow() {
  let settings = require("./api/settings").GetSettings();

  // Create the main browser window
  mainWindow = new BrowserWindow({
    width: settings.windowWidth === undefined ? 1600 : settings.windowWidth,
    height: settings.windowHeight === undefined ? 1650 : settings.windowHeight,
    icon: path.join(__dirname, "/images/nexus-icon.png"),
    backgroundColor: "#232c39",
    show: false
  });

  // Load the index.html into the new browser window
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // Show the window only once the contents finish loading, then check for updates
  mainWindow.webContents.on("did-finish-load", function() {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    mainWindow.show();
    mainWindow.focus();

    //updateApplication(); // if updates are checked in app.on('ready') there is a chance the event doesn't make it to the UI if that hasn't loaded yet, this is safer
  });

  // Save the window dimensions once the resize event is completed
  mainWindow.on("resize", function(event) {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function() {
      // Resize event has been completed
      let settings = require("./api/settings");
      var settingsObj = settings.GetSettings();

      settingsObj.windowWidth = mainWindow.getBounds().width;
      settingsObj.windowHeight = mainWindow.getBounds().height;

      settings.SaveSettings(settingsObj);
    }, 250);
  });

  // Emitted when the window has finished its close command.
  mainWindow.on("closed", function(event) {});

  // Event when the window is minimized
  mainWindow.on("minimize", function(event) {
    let settings = require("./api/settings").GetSettings();

    if (settings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Event when the window is requested to be closed
  mainWindow.on("close", function(event) {
    let settings = require("./api/settings").GetSettings();

    if (!app.isQuiting && settings.minimizeOnClose) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Application Startup
app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }
  createWindow();
  setupTray();
  core.start();
});

// Application Shutdown
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    core.stop(function() {
      app.quit();
    });
  }
});

//
// Auto Updater Events
//

autoUpdater.on("checking-for-update", () => {
  mainWindow.webContents.send("update-checking");
});

autoUpdater.on("update-available", info => {
  mainWindow.webContents.send("update-available");
});

autoUpdater.on("update-not-available", info => {
  mainWindow.webContents.send("update-not-available");
});

autoUpdater.on("download-progress", progress => {
  mainWindow.webContents.send("update-download-progress", progress);
});

autoUpdater.on("update-downloaded", info => {
  mainWindow.webContents.send("update-downloaded");
});

autoUpdater.on("error", err => {
  mainWindow.webContents.send("update-error", err);
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
