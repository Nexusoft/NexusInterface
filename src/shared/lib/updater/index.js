// External
import { remote } from 'electron';
import log from 'electron-log';
import path from 'path';

// Internal
import store from 'store';
import { showBackgroundTask, showNotification } from 'actions/globalUI';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';

const autoUpdater = remote.getGlobal('autoUpdater');
let listeners = [];
let state = 'idle';
let autoUpdateStopped = false;
let autoUpdateTimeout = null;

/**
 * Get Updater's state
 *
 * @export
 * @returns
 */
export function getUpdaterState() {
  return state;
}

/**
 * Get autoUpdater
 *
 * @export
 * @returns
 */
export function getAutoUpdater() {
  return autoUpdater;
}

/**
 * Update the Updater's state
 *
 * @param {*} newState
 */
function updateState(newState) {
  if (state !== newState) {
    state = newState;
    for (let listener of listeners) {
      listener(newState);
    }
  }
}

/**
 * Subscribe to Updater's state change
 *
 * @export
 * @param {*} listener
 * @returns unsubscribe function
 */
export function updaterSubscribe(listener) {
  if (typeof listener !== 'function') {
    throw 'Updater subscribe: Listener must be a function';
  }

  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }

  return function unsubscribe() {
    listeners = listeners.filter(l => l !== listener);
  };
}

/**
 * Start automatically checking for updates by interval
 *
 * @export
 * @returns
 */
export async function startAutoUpdate() {
  if (process.platform === 'darwin') return;
  if (autoUpdateStopped) return;

  try {
    const result = await autoUpdater.checkForUpdates();
    if (result.downloadPromise) {
      await result.downloadPromise;
    }
  } finally {
    // Check for updates every 2 hours
    autoUpdateTimeout = setTimeout(startAutoUpdate, 120 * 60 * 1000);
  }
}

/**
 * Stop automatically checking for updates
 *
 * @export
 */
export function stopAutoUpdate() {
  autoUpdateStopped = true;
  clearTimeout(autoUpdateTimeout);
}

/**
 * Initialize the Updater
 *
 */
function initialize() {
  autoUpdater.logger = log;
  autoUpdater.currentVersion = APP_VERSION;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(
      process.cwd(),
      'dev-app-update.yml'
    );
  }
  autoUpdater.on('error', err => {
    console.error(err);
  });

  autoUpdater.on('update-available', updateInfo => {
    store.dispatch(
      showNotification(
        `New wallet version ${updateInfo.version} available. Downloading...`,
        'work'
      )
    );
  });

  autoUpdater.on('update-downloaded', updateInfo => {
    stopAutoUpdate();
    store.dispatch(
      showBackgroundTask(AutoUpdateBackgroundTask, {
        version: updateInfo.version,
        quitAndInstall: autoUpdater.quitAndInstall,
      })
    );
  });

  autoUpdater.on('error', err => {
    updateState('idle');
  });
  autoUpdater.on('checking-for-update', () => {
    updateState('checking');
  });
  autoUpdater.on('update-available', () => {
    updateState('downloading');
  });
  autoUpdater.on('update-not-available', () => {
    updateState('idle');
  });
  autoUpdater.on('download-progress', () => {
    updateState('downloading');
  });
  autoUpdater.on('update-downloaded', () => {
    updateState('downloaded');
  });
}

initialize();
