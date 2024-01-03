import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';

// Internal
import { assetsDir } from 'consts/paths';
import { updateSettingsFile } from 'lib/settings/universal';
import { debounced } from 'utils/universal';

const port = process.env.PORT || 1212;

/**
 * Enable development tools for REACT and REDUX
 *
 * @returns
 */
function installExtensions() {
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  return Promise.all([
    installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: { allowFileAccess: true },
      forceDownload: forceDownload,
    }),
    installExtension(REDUX_DEVTOOLS, {
      loadExtensionOptions: { allowFileAccess: true },
      forceDownload: forceDownload,
    }),
  ]);
}

/**
 * Create the application window
 *
 * @export
 */
export async function createWindow(settings) {
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
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: false,
    },
  });

  // Load the index.html into the new browser window
  const htmlPath =
    process.env.NODE_ENV === 'development'
      ? `http://localhost:${port}/assets/app.html`
      : `file://${path.resolve(__dirname, 'app.html')}`;
  mainWindow.loadURL(htmlPath);

  // Show the window only once the contents finish loading, then check for updates
  mainWindow.webContents.on('did-finish-load', function () {
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

  mainWindow.webContents.addListener(
    'console-message',
    (event, level, message, line, sourceID) => {
      if (level >= 3) {
        if (!message.search('Error: connect ECONNREFUSED')) {
          mainWindow.webContents.send('usage-tracking-error-relay', message); // If the user has Tracking off this will do nothing as there is no renderer listener
        }
      }
    }
  );

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
  mainWindow.on('close', (e) => {
    e.preventDefault();
  });

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true' ||
    settings.devMode
  ) {
    try {
      await installExtensions();
    } catch (err) {
      console.error('Failed to install extensions', err);
    }
  }

  return mainWindow;
}
