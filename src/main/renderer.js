import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

// Internal
import { isTrustedWindowUrl } from './ipc/navigationPolicy';
import { hardenModuleWebviews } from './webviewSecurity';
import { assetsDir, isDevelopment } from './paths';
import { updateSettingsFile } from './settings';
import { debounced } from 'utils/universal';

const port = process.env.PORT || 1212;

export function getMainWindowUrl() {
  return isDevelopment
    ? `http://localhost:${port}/assets/app.html`
    : pathToFileURL(path.resolve(__dirname, 'app.html')).toString();
}

/**
 * Enable development tools for REACT
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
  ]);
}

/**
 * Create the application window
 *
 * @export
 */
export function createWindow(settings) {
  const fileName =
    process.platform == 'darwin' ? 'nexuslogo.ico' : 'Nexus_App_Icon_64.png';
  const iconPath = path.join(assetsDir, 'tray', fileName);

  const x = Math.max(0, settings.windowX);
  const y = Math.max(0, settings.windowY);
  const display = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(settings.windowWidth, display.width);
  const height = Math.min(settings.windowHeight, display.height);
  const allowSandboxOverride =
    !app.isPackaged &&
    (isDevelopment || process.env.DEBUG_PROD === 'true');

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
      preload:
        isDevelopment
          ? path.resolve(process.cwd(), 'build', 'main_preload.dev.js')
          : path.resolve(__dirname, 'main_preload.prod.js'),
      additionalArguments: [
        `--nexus-development=${isDevelopment ? '1' : '0'}`,
      ],
      nodeIntegration: false,
      contextIsolation: true,
      // Diagnostic-only: NEXUS_DISABLE_SANDBOX=1 may disable sandbox but only
      // in an unpackaged development/debug app.
      sandbox: !(
        allowSandboxOverride &&
        process.env.NEXUS_DISABLE_SANDBOX === '1'
      ),
      webviewTag: true,
      enableRemoteModule: false,
    },
  });

  const htmlPath = getMainWindowUrl();
  const preventUntrustedNavigation = (event, url) => {
    if (!isTrustedWindowUrl(url, htmlPath)) {
      event.preventDefault();
    }
  };
  mainWindow.webContents.on('will-navigate', preventUntrustedNavigation);
  mainWindow.webContents.on('will-redirect', preventUntrustedNavigation);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  hardenModuleWebviews(mainWindow);

  // Load the index.html into the new browser window
  mainWindow.loadURL(htmlPath).catch((err) => {
    console.error('Failed to load main window', err);
  });

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
    isDevelopment ||
    (!app.isPackaged &&
      (process.env.DEBUG_PROD === 'true' || settings.devMode))
  ) {
    installExtensions().catch((err) => {
      console.error('Failed to install extensions', err);
    });
  }

  return mainWindow;
}
