// External
import { app, BrowserWindow, Tray, Menu, dialog } from 'electron';
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
import { LoadSettings, UpdateSettings } from 'api/settings';

let mainWindow;
let resizeTimer;
// Global Objects
global.core = core;
global.autoUpdater = autoUpdater;
global.forceQuit = false;

app.setAppUserModelId(APP_ID);

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

function setupTray(mainWindow) {
  const root =
    process.env.NODE_ENV === 'development'
      ? __dirname
      : configuration.GetAppResourceDir();
  const fileName =
    process.platform == 'darwin'
      ? 'Nexus_Tray_Icon_Template_16.png'
      : 'Nexus_Tray_Icon_32.png';
  const trayImage = path.join(root, 'images', 'tray', fileName);
  const tray = new Tray(trayImage);

  const pressedFileName = 'Nexus_Tray_Icon_Highlight_16.png';
  const pressedImage = path.join(root, 'images', 'tray', pressedFileName);
  tray.setPressedImage(pressedImage);

  app.on('before-quit', () => {
    global.forceQuit = true;
  });
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Nexus',
      click: function() {
        mainWindow.show();
      },
    },
    {
      label: 'Quit Nexus',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });

  return tray;
}

//
// Create Application Window
//

function createWindow() {
  const settings = LoadSettings();
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
    width: settings.windowWidth,
    height: settings.windowHeight,
    minWidth: 1050,
    minHeight: 847,
    icon: iconPath,
    backgroundColor: '#232c39',
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  global.tray = setupTray(mainWindow);

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
      UpdateSettings({
        windowWidth: mainWindow.getBounds().width,
        windowHeight: mainWindow.getBounds().height,
      });
    }, 250);
  });

  // e.preventDefault doesn't work on renderer process so leave it in the main process
  // https://github.com/electron/electron/issues/4473
  mainWindow.on('close', e => {
    e.preventDefault();
  });
}

// Application Startup
app.on('ready', async () => {
  createWindow();
  core.start();

  const settings = LoadSettings();
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true' ||
    settings.devMode
  ) {
    installExtensions();
  }
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
