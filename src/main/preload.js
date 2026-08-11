import { contextBridge, ipcRenderer } from 'electron';

import {
  CHANNELS,
  EVENTS,
  validateClipboardText,
  validateTrackEventRequest,
} from './ipc/contracts';

function unwrap(result, channel) {
  if (!result || typeof result !== 'object' || typeof result.ok !== 'boolean') {
    console.error('preload.unwrap.invalid', { channel });
    throw new Error('Invalid response from the Nexus main-process bridge');
  }
  if (!result.ok) {
    console.error('preload.unwrap.failed', {
      channel,
      code: result.error?.code,
      message: result.error?.message,
    });
    const error = new Error(result.error?.message || 'Nexus operation failed');
    error.code = result.error?.code;
    throw error;
  }
  return result.value;
}

function invoke(channel, request) {
  return ipcRenderer.invoke(channel, request).then((result) =>
    unwrap(result, channel)
  );
}

function invokeSync(channel, request) {
  return unwrap(ipcRenderer.sendSync(channel, request), channel);
}

function assertString(value, name, { min = 0, max = 4096 } = {}) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    throw new TypeError(`${name} must be a string between ${min} and ${max} characters`);
  }
  return value;
}

function assertListener(listener, name) {
  if (typeof listener !== 'function') {
    throw new TypeError(`${name} listener must be a function`);
  }
  return listener;
}

function subscribe(channel, listener, name) {
  assertListener(listener, name);
  const callback = (_event, ...args) => listener(...args);
  ipcRenderer.on(channel, callback);
  return () => ipcRenderer.off(channel, callback);
}

function subscribeOnce(channel, listener, name) {
  assertListener(listener, name);
  ipcRenderer.once(channel, (_event, ...args) => listener(...args));
}

function validateMenuId(id) {
  const menuId = assertString(id, 'Menu id', { min: 1, max: 128 });
  if (!/^[A-Za-z0-9_.-]+$/.test(menuId)) {
    throw new TypeError('Menu id contains unsupported characters');
  }
  return menuId;
}

function exposeInMainWorld(name, api) {
  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld(name, api);
  } else {
    window[name] = api;
  }
}

const environment = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || '',
  platform: process.platform,
  arch: process.arch,
});

const nexusElectron = {
  environment,
  paths: {
    getBootstrap: () => invokeSync(CHANNELS.paths.getBootstrap),
  },
  settings: {
    getInitial: () => invokeSync(CHANNELS.settings.getInitial),
    update: (updates) => invoke(CHANNELS.settings.update, updates),
    getAddressBook: () => invoke(CHANNELS.settings.getAddressBook),
    saveAddressBook: (addressBook) =>
      invoke(CHANNELS.settings.saveAddressBook, addressBook),
  },
  theme: {
    getInitial: () => invokeSync(CHANNELS.theme.getInitial),
    update: (updates) => invoke(CHANNELS.theme.update, updates),
    selectWallpaper: () => invoke(CHANNELS.theme.selectWallpaper),
    importFromDialog: () => invoke(CHANNELS.theme.importFromDialog),
    exportToDialog: () => invoke(CHANNELS.theme.exportToDialog),
  },
  dialogs: {
    selectBackupDirectory: () => invoke(CHANNELS.dialogs.selectBackupDirectory),
    selectCoreBinary: () => invoke(CHANNELS.dialogs.selectCoreBinary),
    selectModuleArchive: () => invoke(CHANNELS.dialogs.selectModuleArchive),
    selectModuleDirectory: () =>
      invoke(CHANNELS.dialogs.selectModuleDirectory),
    selectDevModuleDirectory: () =>
      invoke(CHANNELS.dialogs.selectDevModuleDirectory),
  },
  core: {
    getStatus: () => invoke(CHANNELS.core.getStatus),
    getConfiguration: () => invoke(CHANNELS.core.getConfiguration),
    start: () => invoke(CHANNELS.core.start),
    kill: () => invoke(CHANNELS.core.kill),
    resyncLiteDatabase: () => invoke(CHANNELS.core.resyncLiteDatabase),
    subscribeOutput: () => invoke(CHANNELS.core.subscribeOutput),
    unsubscribeOutput: () => invoke(CHANNELS.core.unsubscribeOutput),
    onOutput: (listener) => subscribe(EVENTS.coreOutput, listener, 'Core output'),
    executeConsoleCommand: (command) =>
      invoke(CHANNELS.core.executeConsoleCommand, command),
  },
  coreRpc: {
    call: (request) => invoke(CHANNELS.coreRpc.call, request),
    callByUrl: (url) => invoke(CHANNELS.coreRpc.callByUrl, url),
  },
  bootstrap: {
    start: () => invoke(CHANNELS.bootstrap.start),
    abort: () => invoke(CHANNELS.bootstrap.abort),
    onStatus: (listener) =>
      subscribe(EVENTS.bootstrapStatus, listener, 'Bootstrap status'),
  },
  modules: {
    prepareFiles: (moduleName, files) =>
      invoke(CHANNELS.modules.prepareFiles, { moduleName, files }),
    list: () => invoke(CHANNELS.modules.list),
    inspectInstallSource: (source) =>
      invoke(CHANNELS.modules.inspectInstallSource, source),
    install: (request) => invoke(CHANNELS.modules.install, request),
    addDevelopment: (path) => invoke(CHANNELS.modules.addDevelopment, path),
    remove: (name) => invoke(CHANNELS.modules.remove, name),
    downloadAndInstall: (request) =>
      invoke(CHANNELS.modules.downloadAndInstall, request),
    abortDownload: (name) => invoke(CHANNELS.modules.abortDownload, name),
    getEntry: (name) => invoke(CHANNELS.modules.getEntry, name),
    readStorage: (name) =>
      invoke(CHANNELS.modules.readStorage, { name }),
    writeStorage: (name, data) =>
      invoke(CHANNELS.modules.writeStorage, { name, data }),
    getFeatured: () => invoke(CHANNELS.modules.getFeatured),
    checkUpdates: () => invoke(CHANNELS.modules.checkUpdates),
    openFailureLocation: (name) =>
      invoke(CHANNELS.modules.openFailureLocation, name),
    onDownloadProgress: (listener) =>
      subscribe(
        EVENTS.modules.downloadProgress,
        listener,
        'Module download progress'
      ),
    pushModuleContext: (request) =>
      invoke(CHANNELS.modules.pushModuleContext, request),
    respondModuleApiHost: (response) =>
      invoke('module-api:host-response', response),
    onModuleApiHostRequest: (listener) =>
      subscribe('module-api:host-request', listener, 'Module API host request'),
  },
  updater: {
    check: () => invoke(CHANNELS.updater.check),
    quitAndInstall: (options) =>
      invoke(CHANNELS.updater.quitAndInstall, options || {}),
    setAllowPrerelease: (value) =>
      invoke(CHANNELS.updater.setAllowPrerelease, value),
    migrateToMainnet: () => invoke(CHANNELS.updater.migrateToMainnet),
    getMarketData: () => invoke(CHANNELS.updater.getMarketData),
  },
  fileAssets: {
    readModuleIcon: (moduleName, icon) =>
      invoke(CHANNELS.fileAssets.readModuleIcon, { moduleName, icon }),
    fetchExternalIcon: (url) =>
      invoke(CHANNELS.fileAssets.fetchExternalIcon, url),
    loadRecoveryWords: () => invoke(CHANNELS.fileAssets.loadRecoveryWords),
    lookupGeoIp: (addresses) =>
      invoke(CHANNELS.fileAssets.lookupGeoIp, addresses),
    lookupPublicGeoIp: () =>
      invoke(CHANNELS.fileAssets.lookupPublicGeoIp),
    loadTranslation: (locale) =>
      invokeSync(CHANNELS.fileAssets.loadTranslation, locale),
  },
  app: {
    isForceQuit: () => invoke(CHANNELS.app.isForceQuit),
    quit: () => invoke(CHANNELS.app.quit),
    exit: () => invoke(CHANNELS.app.exit),
    hideWindow: () => invoke(CHANNELS.app.hideWindow),
    hideDock: () => invoke(CHANNELS.app.hideDock),
    setOpenOnStart: (enabled) =>
      invoke(CHANNELS.app.setOpenOnStart, enabled),
    popupContextMenu: (template, webContentsId) =>
      invoke(CHANNELS.app.popupContextMenu, { template, webContentsId }),
    setMenu: (template) => invoke(CHANNELS.app.setMenu, template),
    openVirtualKeyboard: (options) =>
      invoke(CHANNELS.app.openVirtualKeyboard, options),
    openExternal: (url) => invoke(CHANNELS.app.openExternal, url),
    openManagedPath: (name) => invoke(CHANNELS.app.openManagedPath, name),
    onWindowClose: (listener) =>
      subscribe('window-close', listener, 'Window close'),
    onUsageTrackingError: (listener) =>
      subscribe('usage-tracking-error-relay', listener, 'Usage tracking error'),
    onKeyboardInputChange: (listener) =>
      subscribe('keyboard-input-change', listener, 'Keyboard input change'),
    onceKeyboardClosed: (listener) =>
      subscribeOnce('keyboard-closed', listener, 'Keyboard close'),
    onMenuClick: (id, listener) =>
      subscribe(`menu-click:${validateMenuId(id)}`, listener, 'Menu click'),
  },
  clipboard: {
    writeText(text) {
      return invoke(CHANNELS.app.writeClipboard, validateClipboardText(text));
    },
  },
  updaterEvents: {
    onAvailable: (listener) =>
      subscribe('updater:update-available', listener, 'Updater available'),
    onDownloaded: (listener) =>
      subscribe('updater:update-downloaded', listener, 'Updater downloaded'),
    onError: (listener) => subscribe('updater:error', listener, 'Updater error'),
    onChecking: (listener) =>
      subscribe('updater:checking-for-update', listener, 'Updater checking'),
    onNotAvailable: (listener) =>
      subscribe(
        'updater:update-not-available',
        listener,
        'Updater not available'
      ),
    onDownloadProgress: (listener) =>
      subscribe(
        'updater:download-progress',
        listener,
        'Updater download progress'
      ),
  },
  aptabase: {
    trackEvent(eventName, props) {
      return invoke(
        CHANNELS.app.trackEvent,
        validateTrackEventRequest({ eventName, props })
      );
    },
  },
};

exposeInMainWorld('nexusEnv', environment);
exposeInMainWorld('nexusElectron', nexusElectron);

// Preload-time init marker. The full core:get-status bridge self-test runs from
// the renderer bootstrap after mainWindow is assigned (avoids sender races).
console.info('preload.init', {
  contextIsolated: !!process.contextIsolated,
  platform: environment.platform,
  nodeEnv: environment.NODE_ENV,
});
