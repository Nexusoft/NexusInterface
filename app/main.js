// External
import { app, BrowserWindow, dialog } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import module from 'module';
import sourceMapSupport from 'source-map-support';
import devToolsInstall, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
import 'electron-debug';

// Internal
import core from 'api/core';
import configuration from 'api/configuration';
import { GetSettings, SaveSettings } from 'api/settings';

let mainWindow;
let resizeTimer;
// Global Objects
global.core = core;

app.setAppUserModelId(APP_ID);

// Configure Updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Enable source map support
if (process.env.NODE_ENV === 'production') {
  sourceMapSupport.install();
}

const p = path.join(__dirname, '..', 'app', 'node_modules');
module.globalPaths.push(p);

// Enable development tools for REACT and REDUX
const installExtensions = async () => {
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  return Promise.all([
    devToolsInstall(REACT_DEVELOPER_TOOLS, forceDownload),
    devToolsInstall(REDUX_DEVTOOLS, forceDownload),
  ]).catch();
};

//
// Create Application Window
//

function createWindow() {
  // App self-destruct timer
  const expiration = 1547926000000;
  var presentTime = new Date().getTime();
  var timeLeft = (expiration - presentTime) / 1000 / 60 / 60 / 24;
  if (presentTime >= expiration) {
    dialog.showErrorBox(
      'Tritium Wallet Beta Expired',
      'The Tritium Beta testing period has ended. Please use your normal wallet.'
    );
    // app.exit();
    // process.abort();
  } else if (Math.floor(timeLeft) <= 5) {
    dialog.showErrorBox(
      'Tritium Wallet Beta Expiring Soon',
      'There are ' +
        Math.floor(timeLeft).toString() +
        ' days left in the Beta Testing period.'
    );
  } else if (Math.floor(timeLeft) < 1) {
    dialog.showErrorBox(
      'Tritium Wallet Beta Expiring Soon',
      'Beta test ending. This application will no longer work in ' +
        Math.floor(timeLeft * 24).toString() +
        ' hours.'
    );
  } else if (Math.floor(timeLeft * 24) < 1) {
    dialog.showErrorBox(
      'Tritium Wallet Beta Expiring Soon',
      'Beta test ending. This application will no longer work in ' +
        Math.floor(timeLeft * 24 * 60).toString() +
        ' minutes.'
    );
  }

  let settings = GetSettings();
  let iconPath = '';
  if (process.env.NODE_ENV === 'development') {
    iconPath = path.join(
      configuration.GetAppDataDirectory(),
      'tray',
      'Nexus_App_Icon_64.png'
    );
  } else if (process.platform == 'darwin') {
    iconPath = path.join(
      configuration.GetAppResourceDir(),
      'images',
      'tray',
      'nexuslogo.ico'
    );
  } else {
    iconPath = path.join(
      configuration.GetAppResourceDir(),
      'images',
      'tray',
      'Nexus_App_Icon_64.png'
    );
  }

  // Create the main browser window
  mainWindow = new BrowserWindow({
    width: settings.windowWidth === undefined ? 1600 : settings.windowWidth,
    height: settings.windowHeight === undefined ? 1650 : settings.windowHeight,
    minWidth: 1050,
    minHeight: 847,
    icon: iconPath,
    backgroundColor: '#232c39',
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the index.html into the new browser window
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // Show the window only once the contents finish loading, then check for updates
  mainWindow.webContents.on('did-finish-load', function() {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    mainWindow.show();
    mainWindow.focus();
    // UNCOMMENT THIS TO OPEN DEVTOOLS FROM THE MAIN PROCESS
    // mainWindow.webContents.openDevTools();

    //updateApplication(); // if updates are checked in app.on('ready') there is a chance the event doesn't make it to the UI if that hasn't loaded yet, this is safer
  });

  // Save the window dimensions once the resize event is completed
  mainWindow.on('resize', function(event) {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function() {
      // Resize event has been completed
      let settings = GetSettings();

      settings.windowWidth = mainWindow.getBounds().width;
      settings.windowHeight = mainWindow.getBounds().height;

      SaveSettings(settings);
    }, 250);
  });

  // Event when the window is minimized
  mainWindow.on('minimize', function(event) {
    let settings = GetSettings();

    if (settings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Application Startup
app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  createWindow();
  core.start();

  mainWindow.on('close', function(e) {
    e.preventDefault();

    let settings = GetSettings();
    log.info('close');

    if (settings) {
      if (settings.minimizeToTray == true) {
        e.preventDefault();
        mainWindow.hide();
      } else {
        core.stop().then(payload => {
          app.exit();
        });
      }
    } else {
      core.stop().then(payload => {
        app.exit();
      });
    }
  });
});

// Application Shutdown
// app.on('window-all-closed', function() {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
//   log.info('all');
//   setTimeout(setTimeout(process.abort(), 3000), 3000);
// });

// app.on('will-quit', function() {
//   log.info('will');
//   app.exit();
// });
