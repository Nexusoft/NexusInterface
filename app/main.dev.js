import {
  app,
  BrowserWindow,
  remote,
  Tray,
  Menu,
  ipcMain,
  dialog,
  globalShortcut
} from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import MenuBuilder from "./menu";
import core from "./api/core";
import configuration from "./api/configuration";
import settings from "./api/settings";

const path = require("path");

let mainWindow;
let tray;
let resizeTimer;
var keepDaemon = false;

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

require("electron-debug");
const p = path.join(__dirname, "..", "app", "node_modules");
require("module").globalPaths.push(p);

// Enable development tools for REACT and REDUX
const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch();
};

//
// Create Application Window
//

function createWindow() {
  // App self-destruct timer
  const expiration = 1541030401000
  var presentTime = (new Date).getTime();
  var timeLeft = (expiration - presentTime) / 1000 / 60 / 60 / 24;
  if ( presentTime >= expiration ) {
    dialog.showErrorBox('Tritium Wallet Beta Expired', 'The Tritium Beta testing period has ended. Please use your normal wallet.');
    app.exit();
  } else if ( Math.floor(timeLeft) <= 5) {
    dialog.showErrorBox('Tritium Wallet Beta Expiring Soon', 'There are ' + Math.floor(timeLeft).toString() + ' days left in the Beta Testing period.');
  } else if ( Math.floor(timeLeft) < 1) {
    dialog.showErrorBox('Tritium Wallet Beta Expiring Soon', 'Beta test ending. This application will no longer work in ' + Math.floor(timeLeft * 24).toString() + ' hours.');
  } else if ( Math.floor(timeLeft * 24) < 1 ) {
    dialog.showErrorBox('Tritium Wallet Beta Expiring Soon', 'Beta test ending. This application will no longer work in ' + Math.floor(timeLeft * 24 * 60).toString() + ' minutes.');
  }

  let settings = require("./api/settings").GetSettings();
  let iconPath = "";
  if (process.env.NODE_ENV === "development") {
    iconPath = path.join(
      configuration.GetAppDataDirectory(),
      "tray",
      "Nexus_App_Icon_64.png"
    );
  } else if (process.platform == "darwin") {
    iconPath = path.join(
      configuration.GetAppResourceDir(),
      "images",
      "tray",
      "nexuslogo.ico"
    );
  } else {
    iconPath = path.join(
      configuration.GetAppResourceDir(),
      "images",
      "tray",
      "Nexus_App_Icon_64.png"
    );
  }

  // Create the main browser window
  mainWindow = new BrowserWindow({
    width: settings.windowWidth === undefined ? 1600 : settings.windowWidth,
    height: settings.windowHeight === undefined ? 1650 : settings.windowHeight,
    icon: iconPath,
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
};

// Application Startup
app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  createWindow();
  core.start();
  const ret = globalShortcut.register("Escape", function() {
    mainWindow.setFullScreen(false);
  });

  mainWindow.on("close", function(e) {
    const settings = require("./api/settings.js").GetSettings();
    if (keepDaemon !== true || keepDaemon === undefined) {
      core.stop();
    }
    if (settings) {
      if (settings.minimizeToTray) {
        e.preventDefault();
        mainWindow.hide();
      } else {
        app.quit();
      }
    } else {
      app.quit();
    }
  });
});

// Application Shutdown
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    core.stop(function() {
      app.quit();
    });
  }
  globalShortcut.unregister("Escape");

  globalShortcut.unregisterAll();
});

app.on("will-quit", function() {
  globalShortcut.unregister("Escape");

  globalShortcut.unregisterAll();
});
