import { BrowserWindow, screen } from 'electron';
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

/**
 * Enable development tools for REACT and REDUX
 *
 * @returns
 */
async function installExtensions() {
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  return Promise.all([
    devToolsInstall(REACT_DEVELOPER_TOOLS, forceDownload),
    devToolsInstall(REDUX_DEVTOOLS, forceDownload),
  ]).catch();
}

/**
 * Create the application window
 *
 * @export
 */
export async function createWindow() {
  const settings = loadSettingsFromFile();
  const fileName =
    process.platform == 'darwin' ? 'nexuslogo.ico' : 'Nexus_App_Icon_64.png';
  const iconPath = path.join(assetsDir, 'tray', fileName);

  const x = Math.max(0, settings.windowX);
  const y = Math.max(0, settings.windowY);
  const display = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(settings.windowWidth, display.width);
  const height = Math.min(settings.windowHeight, display.height);
  // Create the main browser window
  const mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 1022,
    minHeight: 713,
    icon: iconPath,
    backgroundColor: '#171719',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      enableRemoteModule: false,
    },
  });

  // Load the index.html into the new browser window
  const htmlPath =
    process.env.NODE_ENV === 'development' ? '../src/app.html' : 'app.html';
  mainWindow.loadURL(`file://${path.resolve(__dirname, htmlPath)}`);

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
  const updateWindowSize = debounced(() => {
    const bounds = mainWindow.getBounds();
    // Resize event has been completed
    updateSettingsFile({
      windowWidth: bounds.width,
      windowHeight: bounds.height,
    });
  }, 1000);
  mainWindow.on('resize', updateWindowSize);

  const updateWindowPos = debounced(() => {
    const bounds = mainWindow.getBounds();
    updateSettingsFile({
      windowX: bounds.x,
      windowY: bounds.y,
    });
  }, 1000);
  mainWindow.on('move', updateWindowPos);

  // e.preventDefault doesn't work on renderer process so leave it in the main process
  // https://github.com/electron/electron/issues/4473
  mainWindow.on('close', e => {
    e.preventDefault();
  });

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true' ||
    settings.devMode
  ) {
    await installExtensions();
  }

  return mainWindow;
}
