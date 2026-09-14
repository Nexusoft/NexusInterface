import { app, clipboard, ipcMain, dialog, shell, webContents } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { initialize, trackEvent } from '@aptabase/electron/main';

import { ensureApplicationDirectories } from './paths';
import { loadSettingsFromFile } from './settings';
import { createCoreLifecycleCoordinator } from './coreLifecycle';
import {
  coreBinaryExists,
  coreBinaryStatus,
  executeCommand,
  isCoreRunning,
  killCoreProcess,
  resyncLiteDatabase,
  startConfiguredCore,
  stopEmbeddedCore,
} from './core';
import { getDomain, serveModuleFiles } from './fileServer';
import { createWindow, getMainWindowUrl } from './renderer';
import { isTrustedWindowUrl } from './ipc/navigationPolicy';
import { createCoreRpcSessionPolicy } from './ipc/coreRpcSessionPolicy';
import { authorizeModuleEntry } from './webviewSecurity';
import {
  registerModuleBrokerHandlers,
  pushContextToGuest,
} from './moduleBroker';
import { setupTray } from './tray';
import { setApplicationMenu, popupContextMenu } from './menu';
import { openVirtualKeyboard } from './keyboard';
import { setOpenOnStart } from './autoLaunch';
import {
  initializeUpdater,
  checkForUpdates,
  getMarketData,
  migrateToMainnet,
  setAllowPrerelease,
} from './updater';
import {
  CHANNELS,
  EVENTS,
  assertBoolean,
  assertAllowedCoreRpcEndpoint,
  assertExternalUrl,
  assertRecord,
  assertSafeModuleName,
  assertString,
  error as ipcError,
  result as ipcResult,
  validateClipboardText,
  validateCoreConsoleCommand,
  redactSensitiveText,
  validateCoreRpcRequest,
  validateCoreConsoleRpcUrl,
  validateMenuTemplate,
  validateTrackEventRequest,
  validateModuleDownloadRequest,
  validateModuleFiles as validateModuleFilePaths,
  validateModuleStorageRequest,
  validateNoArguments,
  validateSettingsUpdate,
  validateThemeUpdate,
} from './ipc/contracts';
import { assertCoreConsoleAllowed } from './ipc/coreConsolePolicy';
import { abortBootstrap, startBootstrap } from './bootstrap';
import { subscribeCoreOutput, unsubscribeCoreOutput } from './coreOutput';
import {
  fetchExternalIcon,
  loadRecoveryWords,
  loadTranslation,
  loadTranslationSync,
  lookupGeoIp,
  lookupPublicGeoIp,
  readModuleIcon,
} from './fileAssets';
import {
  getRendererSettings,
  getManagedPath,
  loadTheme,
  readAddressBook,
  saveTheme,
  updateSettingsFile,
  writeAddressBook,
} from './settings';
import { exportTheme, importTheme, selectWallpaper } from './theme';
import {
  getModuleEntry,
  validateModuleFiles,
} from './moduleFiles';
import {
  abortDownload,
  addDevelopmentModule,
  checkForModuleUpdates,
  downloadAndInstallModule,
  finalizeInstall,
  getFeaturedModules,
  inspectInstallSource,
  listModules,
  openFailureLocation,
  readModuleStorage,
  removeModule,
  writeModuleStorage,
} from './modules';
import {
  callCoreRpc,
  callCoreRpcByUrl,
  clearCoreConfigCache,
  getPublicCoreConfiguration,
} from './coreRpc';

let mainWindow;
global.forceQuit = false;
const coreLifecycle = createCoreLifecycleCoordinator();
const coreRpcSessionPolicy = createCoreRpcSessionPolicy();
const CORE_TARGET_SETTINGS = new Set([
  'coreDataDir',
  'embeddedCoreBinaryPath',
  'embeddedCoreUseNonSSL',
  'embeddedCoreApiPort',
  'embeddedCoreApiPortSSL',
  'manualDaemon',
  'manualDaemonIP',
  'manualDaemonApiIP',
  'manualDaemonApiSSL',
  'manualDaemonApiUser',
  'manualDaemonApiPassword',
  'manualDaemonApiPort',
  'manualDaemonApiPortSSL',
]);
// Guards against re-entrant Core shutdown during quit/exit (IPC + before-quit).
let embeddedCoreShutdownPromise = null;
// Once Core cleanup finished, allow Electron to complete quit/exit/install.
let allowingFinalQuit = false;
app.setAppUserModelId(APP_ID);
ensureApplicationDirectories();
initialize('A-US-0744437796'); // This doesn't send anything so it is safe to fire even if the user has turned tracking off

log.initialize();

async function ensureEmbeddedCoreStopped() {
  if (!embeddedCoreShutdownPromise) {
    embeddedCoreShutdownPromise = coreLifecycle
      .shutdown(() => stopEmbeddedCore())
      .catch((error) => {
        log.warn(
          `Core Manager: shutdown during app quit failed: ${
            error?.message || error
          }`
        );
        return { stopped: false, reason: 'error' };
      });
  }
  return embeddedCoreShutdownPromise;
}

async function shutdownEmbeddedCoreAndAllowQuit() {
  global.forceQuit = true;
  const result = await ensureEmbeddedCoreStopped();
  if (!result?.stopped && result?.reason !== 'manual-daemon') {
    global.forceQuit = false;
    embeddedCoreShutdownPromise = null;
    coreLifecycle.cancelShutdown();
    throw new Error('Nexus Core shutdown could not be confirmed');
  }
  allowingFinalQuit = true;
}

const allowedOpenDialogProperties = new Set([
  'openFile',
  'openDirectory',
  'multiSelections',
  'showHiddenFiles',
  'createDirectory',
  'promptToCreate',
  'noResolveAliases',
  'treatPackageAsDirectory',
  'dontAddToRecent',
]);
const selectedCoreBinaries = new Map();
const selectedModuleSources = new Map();
const selectedDevelopmentModuleSources = new Map();
const allowedAppPathNames = new Set([
  'home',
  'appData',
  'userData',
  'sessionData',
  'temp',
  'exe',
  'module',
  'desktop',
  'documents',
  'downloads',
  'music',
  'pictures',
  'videos',
  'recent',
  'logs',
  'crashDumps',
]);
const allowedMenuRoles = new Set([
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'pasteAndMatchStyle',
  'delete',
  'selectAll',
  'reload',
  'forceReload',
  'toggleDevTools',
  'resetZoom',
  'zoomIn',
  'zoomOut',
  'toggleSpellChecker',
  // Electron's built-in role is lowercase; must match appMenu exactly.
  'togglefullscreen',
  'window',
  'minimize',
  'close',
  'help',
  'about',
  'services',
  'hide',
  'hideOthers',
  'unhide',
  'quit',
  'showSubstitutions',
  'toggleSmartQuotes',
  'toggleSmartDashes',
  'toggleTextReplacement',
  'startSpeaking',
  'stopSpeaking',
  'front',
  'zoom',
  'toggleTabBar',
  'selectNextTab',
  'selectPreviousTab',
  'showAllTabs',
  'mergeAllWindows',
  'moveTabToNewWindow',
  'windowMenu',
]);

function ensureString(value, fieldName) {
  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a string`);
  }
  return value;
}

function ensureNonEmptyString(value, fieldName) {
  const stringValue = ensureString(value, fieldName).trim();
  if (!stringValue) {
    throw new TypeError(`${fieldName} must not be empty`);
  }
  return stringValue;
}

function ensureStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new TypeError(`${fieldName} must be an array of strings`);
  }
  return value;
}

function ensureBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    throw new TypeError(`${fieldName} must be a boolean`);
  }
  return value;
}

function ensureOptionalBoolean(value, fieldName, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return ensureBoolean(value, fieldName);
}

function ensureObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an object`);
  }
  return value;
}

function rememberSelectedPaths(pathsBySender, event, selectedPaths) {
  if (!selectedPaths?.length) return;
  const selectedPathSet = pathsBySender.get(event.sender.id) || new Set();
  for (const selectedPath of selectedPaths) {
    selectedPathSet.add(selectedPath);
  }
  pathsBySender.set(event.sender.id, selectedPathSet);
}

function ensureSelectedPath(value, pathsBySender, event, fieldName) {
  const selectedPath = assertString(value, fieldName, { min: 1, max: 4096 });
  if (!pathsBySender.get(event.sender.id)?.has(selectedPath)) {
    throw new TypeError(`${fieldName} must be selected through its dialog`);
  }
  return selectedPath;
}

function validateModuleInstallRequest(request) {
  const value = assertRecord(request, 'Module install request');
  const unsupportedField = Object.keys(value).find(
    (key) => key !== 'token' && key !== 'overwrite'
  );
  if (unsupportedField) {
    throw new TypeError(`Unsupported module install field: ${unsupportedField}`);
  }
  return {
    token: assertString(value.token, 'Install token', { min: 1, max: 128 }),
    overwrite:
      value.overwrite === undefined
        ? false
        : assertBoolean(value.overwrite, 'overwrite'),
  };
}

function sanitizeDialogFilters(filters) {
  if (filters === undefined) return undefined;
  const filterList = Array.isArray(filters) ? filters : [filters];
  if (filterList.some((filter) => !filter || typeof filter !== 'object')) {
    throw new TypeError('Dialog filters must be an array');
  }
  return filterList.map((filter) => ({
    name: ensureString(filter?.name, 'Dialog filter name'),
    extensions: ensureStringArray(
      filter?.extensions,
      'Dialog filter extensions'
    ),
  }));
}

function sanitizeOpenDialogOptions(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Open dialog options must be an object');
  }
  return {
    title:
      options.title === undefined
        ? undefined
        : ensureString(options.title, 'Dialog title'),
    defaultPath:
      options.defaultPath === undefined
        ? undefined
        : ensureString(options.defaultPath, 'Dialog defaultPath'),
    buttonLabel:
      options.buttonLabel === undefined
        ? undefined
        : ensureString(options.buttonLabel, 'Dialog buttonLabel'),
    properties: (options.properties || []).filter((property) =>
      allowedOpenDialogProperties.has(property)
    ),
    filters: sanitizeDialogFilters(options.filters),
  };
}

function sanitizeSaveDialogOptions(options = {}) {
  const sanitized = sanitizeOpenDialogOptions(options);
  delete sanitized.properties;
  return sanitized;
}

function sanitizeKeyboardOptions(options = {}) {
  const value = assertRecord(options, 'Keyboard options');
  const theme = assertRecord(value.theme, 'Keyboard theme');
  let serializedTheme;
  try {
    serializedTheme = JSON.stringify(theme);
  } catch {
    throw new TypeError('Keyboard theme must be serializable');
  }
  if (!serializedTheme || serializedTheme.length > 64 * 1024) {
    throw new TypeError('Keyboard theme is too large');
  }
  return {
    theme: JSON.parse(serializedTheme),
    defaultText:
      value.defaultText === undefined
        ? ''
        : assertString(value.defaultText, 'Keyboard defaultText', {
            max: 100000,
          }),
    placeholder:
      value.placeholder === undefined
        ? ''
        : assertString(value.placeholder, 'Keyboard placeholder', {
            max: 4096,
          }),
    maskable:
      value.maskable === undefined
        ? false
        : assertBoolean(value.maskable, 'Keyboard maskable'),
  };
}

function sanitizeMenuTemplate(template) {
  if (!Array.isArray(template)) {
    throw new TypeError('Menu template must be an array');
  }

  return template.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new TypeError('Menu item must be an object');
    }

    if (item.type === 'separator') {
      return { type: 'separator' };
    }

    const sanitized = {};
    if (item.id !== undefined) sanitized.id = ensureString(item.id, 'Menu id');
    if (item.label !== undefined) {
      sanitized.label = ensureString(item.label, 'Menu label');
    }
    if (item.accelerator !== undefined) {
      sanitized.accelerator = ensureString(
        item.accelerator,
        'Menu accelerator'
      );
    }
    if (item.role !== undefined) {
      if (!allowedMenuRoles.has(item.role)) {
        throw new TypeError(`Unsupported menu role: ${item.role}`);
      }
      sanitized.role = item.role;
    }
    if (item.enabled !== undefined) {
      sanitized.enabled = !!item.enabled;
    }
    if (item.visible !== undefined) {
      sanitized.visible = !!item.visible;
    }
    if (item.checked !== undefined) {
      sanitized.checked = !!item.checked;
    }
    if (item.click !== undefined) {
      if (typeof item.click !== 'boolean') {
        throw new TypeError('Menu click marker must be a boolean');
      }
      sanitized.click = item.click;
    }
    if (item.submenu !== undefined) {
      sanitized.submenu = sanitizeMenuTemplate(item.submenu);
    }

    return sanitized;
  });
}

function sanitizeWebContentsId(webContentsId) {
  if (webContentsId === undefined || webContentsId === null) return undefined;
  if (!Number.isInteger(webContentsId) || webContentsId < 1) {
    throw new TypeError('webContentsId must be a positive integer');
  }
  const target = webContents.fromId(webContentsId);
  if (
    !target ||
    (target.id !== mainWindow?.webContents.id &&
      target.hostWebContents?.id !== mainWindow?.webContents.id)
  ) {
    throw new Error('webContentsId must belong to the main window');
  }
  return webContentsId;
}

function sanitizeAppPathName(name) {
  const pathName = ensureString(name, 'Path name');
  if (!allowedAppPathNames.has(pathName)) {
    throw new Error(`Unsupported app path: ${pathName}`);
  }
  return pathName;
}

function sanitizeProxyRequest(url, config = {}) {
  const requestURL = ensureNonEmptyString(url, 'Proxy request URL');
  ensureObject(config, 'Proxy request config');
  let parsedURL;
  try {
    parsedURL = new URL(requestURL);
  } catch (err) {
    throw new Error(`Invalid proxy request URL: ${requestURL}`);
  }
  if (!['http:', 'https:'].includes(parsedURL.protocol)) {
    throw new Error(`Unsupported proxy request protocol: ${parsedURL.protocol}`);
  }
  return [requestURL, config];
}

function isMainWindowSender(event) {
  const windowContents = mainWindow?.webContents || global.mainWindow?.webContents;
  return (
    !!windowContents &&
    event.sender.id === windowContents.id &&
    event.senderFrame === windowContents.mainFrame &&
    isTrustedWindowUrl(event.senderFrame?.url, getMainWindowUrl())
  );
}

function senderError() {
  return ipcError('UNAUTHORIZED_SENDER', 'IPC sender is not an application window');
}

function operationError(err) {
  const rawMessage = err instanceof Error ? err.message : 'Operation failed';
  // Defense in depth: never write credentials/session material to logs even if
  // a lower layer accidentally included them in an Error message.
  const message = redactSensitiveText(rawMessage) || 'Operation failed';
  log.warn(`IPC operation failed: ${message}`);
  return ipcError('OPERATION_FAILED', message);
}

const CORE_TRACE_CHANNELS = new Set([
  CHANNELS.core.getStatus,
  CHANNELS.core.getConfiguration,
  CHANNELS.core.start,
  CHANNELS.core.restart,
  CHANNELS.core.stop,
  CHANNELS.core.kill,
  CHANNELS.core.resyncLiteDatabase,
  CHANNELS.core.subscribeOutput,
  CHANNELS.core.unsubscribeOutput,
  CHANNELS.coreRpc.call,
  CHANNELS.coreRpc.callByUrl,
]);

function registerOperation(channel, validateRequest, operation) {
  ipcMain.handle(channel, async (event, request) => {
    if (!isMainWindowSender(event)) return senderError();
    const traceCore = CORE_TRACE_CHANNELS.has(channel);
    if (traceCore) {
      let endpoint;
      if (channel === CHANNELS.coreRpc.call && request?.endpoint) {
        try {
          endpoint = assertAllowedCoreRpcEndpoint(request.endpoint);
        } catch {
          endpoint = undefined;
        }
      } else if (typeof request === 'string') {
        try {
          endpoint = validateCoreConsoleRpcUrl(request).split(/[/?]/)[0];
        } catch {
          endpoint = undefined;
        }
      }
      log.info('ipc.core.enter', {
        channel,
        endpoint,
      });
    }
    try {
      const validatedRequest = validateRequest
        ? validateRequest(request, event)
        : validateNoArguments(request, channel);
      const value = await operation(validatedRequest, event);
      if (traceCore) {
        log.info('ipc.core.exit', {
          channel,
          ok: true,
          apiReachable:
            value && typeof value === 'object' ? value.apiReachable : undefined,
        });
      }
      return ipcResult(value);
    } catch (err) {
      if (traceCore) {
        const message = redactSensitiveText(
          err instanceof Error ? err.message : String(err)
        );
        log.warn('ipc.core.exit', {
          channel,
          ok: false,
          message,
        });
      }
      return operationError(err);
    }
  });
}

function registerSynchronousOperation(channel, validateRequest, operation) {
  ipcMain.on(channel, (event, request) => {
    if (!isMainWindowSender(event)) {
      event.returnValue = senderError();
      return;
    }
    try {
      const validatedRequest = validateRequest
        ? validateRequest(request, event)
        : validateNoArguments(request, channel);
      event.returnValue = ipcResult(operation(validatedRequest, event));
    } catch (err) {
      event.returnValue = operationError(err);
    }
  });
}

// Temporarily add this because there are some errors in autoUpdater.checkForUpdates
// cannot be caught (net::ERR_HTTP_RESPONSE_CODE_FAILURE).
// This should be removed when the issue is resolved.
// A similar issue: https://github.com/electron-userland/electron-builder/issues/2451
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// HANDLERS
// =============================================================================

// Synchronous bootstrap is intentionally limited to static renderer state
// needed before React can mount. Every user-triggered operation is async.
registerSynchronousOperation(CHANNELS.paths.getBootstrap, undefined, () => ({
  // Kept only for synchronous bootstrap compatibility; no filesystem paths
  // are exposed to the renderer.
}));
registerSynchronousOperation(CHANNELS.settings.getInitial, undefined, () => ({
  settings: getRendererSettings(),
  addressBook: readAddressBook(),
}));
registerSynchronousOperation(CHANNELS.theme.getInitial, undefined, () =>
  loadTheme()
);
registerSynchronousOperation(
  CHANNELS.fileAssets.loadTranslation,
  (locale) => assertString(locale, 'Locale', { min: 2, max: 8 }),
  (locale) => loadTranslationSync(locale)
);

// App/window operations
registerOperation(CHANNELS.app.isForceQuit, undefined, async () => global.forceQuit);
// Always stop the wallet-managed Core from the main process on quit/exit.
// Renderer stopCore is best-effort; if the API is down or the renderer is
// already tearing down, Core must not be left as an orphan requiring OS kill.
//
// Main window `close` is always preventDefault'd (renderer.js), so app.quit()
// alone cannot terminate the process. After Core cleanup we must app.exit().
// Setting allowingFinalQuit before app.quit() would also disable the
// before-quit hard-exit fallback and leave a stuck process if the renderer
// never completes closeWallet.
registerOperation(CHANNELS.app.quit, undefined, async () => {
  await shutdownEmbeddedCoreAndAllowQuit();
  app.exit(0);
});
registerOperation(CHANNELS.app.exit, undefined, async () => {
  await shutdownEmbeddedCoreAndAllowQuit();
  app.exit(0);
});
registerOperation(CHANNELS.app.hideWindow, undefined, async () => mainWindow.hide());
registerOperation(CHANNELS.app.hideDock, undefined, async () => {
  if (process.platform === 'darwin') app.dock.hide();
});
registerOperation(
  CHANNELS.app.setOpenOnStart,
  (enabled) => assertBoolean(enabled, 'openOnStart'),
  async (enabled) => setOpenOnStart(enabled)
);
registerOperation(
  CHANNELS.app.popupContextMenu,
  (request) => {
    const value = assertRecord(request, 'Context menu request');
    return {
      template: sanitizeMenuTemplate(validateMenuTemplate(value.template)),
      webContentsId: sanitizeWebContentsId(value.webContentsId),
    };
  },
  ({ template, webContentsId }) => popupContextMenu(template, webContentsId)
);
registerOperation(
  CHANNELS.app.setMenu,
  (request) => sanitizeMenuTemplate(validateMenuTemplate(request)),
  async (template) => setApplicationMenu(template)
);
registerOperation(
  CHANNELS.app.openVirtualKeyboard,
  (request) => sanitizeKeyboardOptions(request),
  async (options) => openVirtualKeyboard(options)
);
registerOperation(
  CHANNELS.app.openExternal,
  (url) => assertExternalUrl(url, 'External URL', { mailto: true }),
  async (url) => shell.openExternal(url)
);
registerOperation(
  CHANNELS.app.openManagedPath,
  (name) => {
    if (name !== 'walletData' && name !== 'coreData') {
      throw new TypeError('Unsupported managed path');
    }
    return name;
  },
  async (name) => shell.openPath(getManagedPath(name))
);
registerOperation(
  CHANNELS.app.writeClipboard,
  validateClipboardText,
  async (text) => {
    clipboard.writeText(text);
    return { written: true };
  }
);
registerOperation(
  CHANNELS.app.trackEvent,
  validateTrackEventRequest,
  async ({ eventName, props }) => {
    await trackEvent(eventName, props);
    return { tracked: true };
  }
);

// Named dialogs never accept renderer-defined dialog options.
registerOperation(CHANNELS.dialogs.selectBackupDirectory, undefined, async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select backup directory',
    properties: ['openDirectory', 'createDirectory'],
  });
  return result.canceled ? undefined : result.filePaths;
});
registerOperation(
  CHANNELS.dialogs.selectCoreBinary,
  undefined,
  async (_request, event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Nexus Core binary',
      properties: ['openFile'],
      filters:
        process.platform === 'win32'
          ? [{ name: 'Windows executable', extensions: ['exe'] }]
          : undefined,
    });
    if (!result.canceled && result.filePaths[0]) {
      const selected = selectedCoreBinaries.get(event.sender.id) || new Set();
      selected.add(result.filePaths[0]);
      selectedCoreBinaries.set(event.sender.id, selected);
    }
    return result.canceled ? undefined : result.filePaths;
  }
);
registerOperation(
  CHANNELS.dialogs.selectModuleArchive,
  undefined,
  async (_request, event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select module archive file',
      properties: ['openFile'],
      filters: [{ name: 'Archive', extensions: ['zip'] }],
    });
    if (!result.canceled) {
      rememberSelectedPaths(selectedModuleSources, event, result.filePaths);
    }
    return result.canceled ? undefined : result.filePaths;
  }
);
registerOperation(
  CHANNELS.dialogs.selectModuleDirectory,
  undefined,
  async (_request, event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select module directory',
      properties: ['openDirectory'],
    });
    if (!result.canceled) {
      rememberSelectedPaths(selectedModuleSources, event, result.filePaths);
    }
    return result.canceled ? undefined : result.filePaths;
  }
);
registerOperation(
  CHANNELS.dialogs.selectDevModuleDirectory,
  undefined,
  async (_request, event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select development module directory',
      properties: ['openDirectory'],
    });
    if (!result.canceled) {
      rememberSelectedPaths(
        selectedDevelopmentModuleSources,
        event,
        result.filePaths
      );
    }
    return result.canceled ? undefined : result.filePaths;
  }
);

// Settings and theme persistence
registerOperation(
  CHANNELS.settings.update,
  (updates, event) => {
    const validated = validateSettingsUpdate(updates);
    const binaryPath = validated.embeddedCoreBinaryPath;
    if (
      binaryPath &&
      !selectedCoreBinaries.get(event.sender.id)?.has(binaryPath)
    ) {
      throw new TypeError(
        'Core binary paths must be selected through the Core binary dialog'
      );
    }
    if (validated.devModulePaths) {
      const currentPaths = new Set(
        getRendererSettings().devModulePaths || []
      );
      const selectedPaths =
        selectedDevelopmentModuleSources.get(event.sender.id) || new Set();
      if (
        validated.devModulePaths.some(
          (path) => !currentPaths.has(path) && !selectedPaths.has(path)
        )
      ) {
        throw new TypeError(
          'Development module paths must be selected through the development module dialog'
        );
      }
    }
    return validated;
  },
  async (updates) => {
    return coreLifecycle.run('update-settings', async () => {
      const previousSettings = loadSettingsFromFile();
      let stoppedPreviousCore = false;
      const coreTargetChanged = Object.keys(updates).some(
        (key) =>
          CORE_TARGET_SETTINGS.has(key) &&
          updates[key] !== previousSettings[key]
      );
      if (coreTargetChanged) {
        const stopResult = await stopEmbeddedCore();
        if (!stopResult?.stopped && stopResult?.reason !== 'manual-daemon') {
          throw new Error(
            'Core settings cannot change until Nexus Core shutdown is confirmed'
          );
        }
        stoppedPreviousCore =
          stopResult.stopped && stopResult.reason !== 'not-running';
      }
      try {
        updateSettingsFile(updates);
      } catch (error) {
        if (stoppedPreviousCore) {
          coreRpcSessionPolicy.reset();
          try {
            await startConfiguredCore();
          } catch (restartError) {
            log.error('core.settings.rollback.restart.failed', {
              error: restartError?.message || String(restartError),
            });
          }
        }
        throw error;
      }
      clearCoreConfigCache();
      if (coreTargetChanged) coreRpcSessionPolicy.reset();
      return getRendererSettings();
    });
  }
);
registerOperation(
  CHANNELS.settings.saveAddressBook,
  (addressBook) => assertRecord(addressBook, 'Address book'),
  async (addressBook) => writeAddressBook(addressBook)
);
registerOperation(CHANNELS.settings.getAddressBook, undefined, async () =>
  readAddressBook()
);
registerOperation(CHANNELS.theme.update, validateThemeUpdate, async (updates) => {
  const theme = { ...loadTheme(), ...updates };
  return saveTheme(theme);
});
registerOperation(
  CHANNELS.theme.selectWallpaper,
  undefined,
  async () => selectWallpaper(mainWindow)
);
registerOperation(
  CHANNELS.theme.importFromDialog,
  undefined,
  async () => importTheme(mainWindow)
);
registerOperation(
  CHANNELS.theme.exportToDialog,
  undefined,
  async () => exportTheme(mainWindow)
);

// Core lifecycle and console operations.
registerOperation(CHANNELS.core.getStatus, undefined, async () => ({
  exists: await coreBinaryExists(),
  status: await coreBinaryStatus(),
  running: await isCoreRunning(),
}));
registerOperation(
  CHANNELS.core.getConfiguration,
  undefined,
  async () => getPublicCoreConfiguration()
);
registerOperation(
  CHANNELS.core.start,
  (request) => {
    if (request !== undefined) {
      throw new TypeError('Core start does not accept renderer arguments');
    }
    return undefined;
  },
  async () =>
    coreLifecycle.run('start', async () => {
      const result = await startConfiguredCore();
      if (result?.started) coreRpcSessionPolicy.reset();
      return result;
    })
);
registerOperation(CHANNELS.core.restart, undefined, async () =>
  coreLifecycle.run('restart', async () => {
    const result = await stopEmbeddedCore();
    if (!result?.stopped && result?.reason !== 'manual-daemon') {
      throw new Error('Nexus Core shutdown could not be confirmed');
    }
    if (result?.stopped) coreRpcSessionPolicy.reset();
    return startConfiguredCore();
  })
);
registerOperation(CHANNELS.core.stop, undefined, async () =>
  coreLifecycle.run('stop', async () => {
    const result = await stopEmbeddedCore();
    if (result?.stopped) coreRpcSessionPolicy.reset();
    return result;
  })
);
registerOperation(CHANNELS.core.kill, undefined, async () =>
  coreLifecycle.run('kill', async () => {
    const killed = await killCoreProcess();
    if (killed) coreRpcSessionPolicy.reset();
    return killed;
  })
);
registerOperation(
  CHANNELS.core.resyncLiteDatabase,
  (request) => {
    if (request !== undefined) {
      throw new TypeError('Lite database resync does not accept arguments');
    }
    return undefined;
  },
  async () =>
    coreLifecycle.run('resync-lite', async () => {
      return resyncLiteDatabase({
        onCoreStopped: () => coreRpcSessionPolicy.reset(),
      });
    })
);
registerOperation(
  CHANNELS.core.subscribeOutput,
  (request) => {
    if (request !== undefined) throw new TypeError('Core output subscription does not accept arguments');
    return undefined;
  },
  async (_request, event) => subscribeCoreOutput(event.sender)
);
registerOperation(
  CHANNELS.core.unsubscribeOutput,
  (request) => {
    if (request !== undefined) throw new TypeError('Core output unsubscription does not accept arguments');
    return undefined;
  },
  async (_request, event) => unsubscribeCoreOutput(event.sender)
);
registerOperation(
  CHANNELS.core.executeConsoleCommand,
  validateCoreConsoleCommand,
  async (command) => {
    assertCoreConsoleAllowed(loadSettingsFromFile());
    return executeCommand(command);
  }
);
registerOperation(
  CHANNELS.coreRpc.call,
  validateCoreRpcRequest,
  async (request) => {
    const authorizedRequest = coreRpcSessionPolicy.authorize(request);
    try {
      const result = await callCoreRpc(authorizedRequest);
      coreRpcSessionPolicy.observe(authorizedRequest, result);
      return result;
    } catch (error) {
      coreRpcSessionPolicy.cancel(authorizedRequest);
      throw error;
    }
  }
);
// Terminal / Nexus API console capability. Broader than structured call():
// relative paths under allowlisted namespaces, including query strings.
// See docs/security/core-rpc-endpoint-registry.md.
registerOperation(
  CHANNELS.coreRpc.callByUrl,
  validateCoreConsoleRpcUrl,
  async (url) => {
    assertCoreConsoleAllowed(loadSettingsFromFile());
    return callCoreRpcByUrl(url);
  }
);

registerOperation(
  CHANNELS.bootstrap.start,
  (request) => {
    if (request !== undefined) {
      throw new TypeError('Bootstrap start does not accept arguments');
    }
    return undefined;
  },
  async () =>
    coreLifecycle.run('bootstrap', () =>
      startBootstrap((status) =>
        mainWindow?.webContents.send(EVENTS.bootstrapStatus, status)
      )
    )
);
registerOperation(
  CHANNELS.bootstrap.abort,
  (request) => {
    if (request !== undefined) {
      throw new TypeError('Bootstrap abort does not accept arguments');
    }
    return undefined;
  },
  async () => {
    abortBootstrap();
    return { requested: true };
  }
);

// Auto updater
registerOperation(CHANNELS.updater.check, undefined, async () =>
  checkForUpdates()
);
registerOperation(
  CHANNELS.updater.quitAndInstall,
  (request = {}) => {
    const value = assertRecord(request, 'Updater install request');
    return {
      isSilent: ensureOptionalBoolean(value.isSilent, 'isSilent'),
      isForceRunAfter: ensureOptionalBoolean(
        value.isForceRunAfter,
        'isForceRunAfter'
      ),
    };
  },
  async ({ isSilent, isForceRunAfter }) => {
    await shutdownEmbeddedCoreAndAllowQuit();
    try {
      autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
    } catch (error) {
      log.error(
        `Updater quitAndInstall failed: ${error?.message || error}`
      );
    }
    // Window close is always preventDefault'd; quitAndInstall relies on
    // app.quit() which cannot destroy the window. Force-exit after giving the
    // installer a moment to spawn.
    setTimeout(() => {
      app.exit(0);
    }, 1500);
  }
);
registerOperation(
  CHANNELS.updater.setAllowPrerelease,
  (value) => assertBoolean(value, 'allowPrerelease'),
  async (value) => setAllowPrerelease(value)
);
registerOperation(CHANNELS.updater.migrateToMainnet, undefined, async () =>
  migrateToMainnet()
);
registerOperation(
  CHANNELS.updater.getMarketData,
  (request) => {
    if (request !== undefined) throw new TypeError('Market data does not accept arguments');
    return undefined;
  },
  async () => getMarketData()
);

// Module file serving only accepts normalized relative files.
registerOperation(
  CHANNELS.modules.prepareFiles,
  (request) => {
    const value = assertRecord(request, 'Module file request');
    return {
      moduleName: assertSafeModuleName(value.moduleName),
      files: validateModuleFilePaths(value.files),
    };
  },
  async ({ moduleName }) => {
    const validFiles = await validateModuleFiles(moduleName);
    return serveModuleFiles(moduleName, validFiles);
  }
);
registerOperation(
  CHANNELS.modules.getEntry,
  (name) => assertSafeModuleName(name),
  async (name) => {
    const entry = await getModuleEntry(name, getDomain());
    await authorizeModuleEntry(name, entry);
    return entry;
  }
);
registerOperation(
  CHANNELS.modules.list,
  (request) => validateNoArguments(request, 'Module list'),
  async () => listModules()
);
registerOperation(
  CHANNELS.modules.inspectInstallSource,
  (source, event) =>
    ensureSelectedPath(
      source,
      selectedModuleSources,
      event,
      'Module source path'
    ),
  async (source) => inspectInstallSource(source)
);
registerOperation(
  CHANNELS.modules.install,
  validateModuleInstallRequest,
  async (request) => finalizeInstall(request)
);
registerOperation(
  CHANNELS.modules.addDevelopment,
  (source, event) =>
    ensureSelectedPath(
      source,
      selectedDevelopmentModuleSources,
      event,
      'Development module path'
    ),
  async (source) => addDevelopmentModule(source)
);
registerOperation(
  CHANNELS.modules.remove,
  (name) => assertSafeModuleName(name),
  async (name) => removeModule(name)
);
registerOperation(
  CHANNELS.modules.downloadAndInstall,
  validateModuleDownloadRequest,
  async (request) => downloadAndInstallModule(request)
);
registerOperation(
  CHANNELS.modules.abortDownload,
  (name) => assertSafeModuleName(name),
  async (name) => abortDownload(name)
);
registerOperation(
  CHANNELS.modules.readStorage,
  (request) => {
    const value = validateModuleStorageRequest(request);
    if (value.data !== undefined) {
      throw new TypeError('Module storage read does not accept data');
    }
    return value.name;
  },
  async (name) => readModuleStorage(name)
);
registerOperation(
  CHANNELS.modules.writeStorage,
  (request) => {
    const value = validateModuleStorageRequest(request);
    if (value.data === undefined) {
      throw new TypeError('Module storage write requires data');
    }
    return value;
  },
  async ({ name, data }) => writeModuleStorage(name, data)
);
registerOperation(
  CHANNELS.modules.getFeatured,
  (request) => validateNoArguments(request, 'Featured modules'),
  async () => getFeaturedModules()
);
registerOperation(
  CHANNELS.modules.checkUpdates,
  (request) => validateNoArguments(request, 'Module update check'),
  async () => checkForModuleUpdates()
);
registerOperation(
  CHANNELS.modules.openFailureLocation,
  (name) => assertString(name, 'Module folder name', { min: 1, max: 255 }),
  async (name) => openFailureLocation(name)
);
// File assets are narrowly scoped to application-owned assets and approved hosts.
registerOperation(
  CHANNELS.fileAssets.readModuleIcon,
  (request) => {
    const value = assertRecord(request, 'Module icon request');
    return {
      moduleName: assertSafeModuleName(value.moduleName),
      icon: assertString(value.icon, 'Module icon', { min: 1, max: 1024 }),
    };
  },
  async ({ moduleName, icon }) => readModuleIcon(moduleName, icon)
);
registerOperation(
  CHANNELS.fileAssets.fetchExternalIcon,
  (url) => assertExternalUrl(url, 'External icon URL'),
  async (url) => fetchExternalIcon(url)
);
registerOperation(
  CHANNELS.fileAssets.loadRecoveryWords,
  undefined,
  async () => loadRecoveryWords()
);
registerOperation(
  CHANNELS.fileAssets.lookupGeoIp,
  (addresses) => addresses,
  async (addresses) => lookupGeoIp(addresses)
);
registerOperation(
  CHANNELS.fileAssets.lookupPublicGeoIp,
  (request) => {
    if (request !== undefined) throw new TypeError('Public Geo IP lookup does not accept arguments');
    return undefined;
  },
  async () => lookupPublicGeoIp()
);
registerOperation(
  CHANNELS.fileAssets.loadTranslation,
  (locale) => assertString(locale, 'Locale', { min: 2, max: 8 }),
  async (locale) => loadTranslation(locale)
);

// Module API broker (isolated WebView guests)
// =============================================================================
registerModuleBrokerHandlers();

registerOperation(
  CHANNELS.modules.pushModuleContext,
  (request) => {
    const value = assertRecord(request, 'Module context push');
    const webContentsId = value.webContentsId;
    if (!Number.isInteger(webContentsId) || webContentsId <= 0) {
      throw new TypeError('webContentsId must be a positive integer');
    }
    return {
      webContentsId,
      context:
        value.context && typeof value.context === 'object'
          ? value.context
          : {},
    };
  },
  async ({ webContentsId, context }, event) => {
    // Only the wallet host may push context.
    if (!global.mainWindow || event.sender.id !== global.mainWindow.webContents.id) {
      throw new Error('Unauthorized module context push');
    }
    pushContextToGuest(webContentsId, context);
    return true;
  }
);

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

  // Last-resort Core cleanup for tray Quit / OS quit paths that never reach the
  // renderer closeWallet flow. before-quit is synchronous, so we briefly delay
  // the quit, stop Core, then exit for real.
  app.on('before-quit', (event) => {
    global.forceQuit = true;
    if (allowingFinalQuit) {
      return;
    }
    event.preventDefault();
    shutdownEmbeddedCoreAndAllowQuit()
      .then(() => app.exit(0))
      .catch((error) => {
        log.error('Core Manager: app quit cancelled', {
          error: redactSensitiveText(error?.message || String(error)),
        });
      });
  });

  // Application Startup
  app.on('ready', async () => {
    const settings = loadSettingsFromFile();
    initializeUpdater(settings);
    global.mainWindow = mainWindow = createWindow(settings);
    mainWindow.on('close', () => {
      mainWindow.webContents.send('window-close');
    });
    global.tray = setupTray(mainWindow);
  });
}
