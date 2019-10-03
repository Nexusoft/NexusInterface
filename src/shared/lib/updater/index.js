// External
import { remote } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import semver from 'semver';

// Internal
import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { showBackgroundTask, showNotification } from 'lib/overlays';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';
import { assetsParentDir } from 'consts/paths';

const mainUpdater = remote.getGlobal('updater');
const autoUpdateInterval = 2 * 60 * 60 * 1000; // 2 hours
let timerId = null;

const setUpdaterState = state => {
  store.dispatch({
    type: TYPE.SET_UPDATER_STATE,
    payload: state,
  });
};

/**
 * Check for updates
 *
 * @export
 * @returns
 */
export function checkForUpdates() {
  return mainUpdater.checkForUpdates();
}

/**
 * Quit wallet and install the update
 *
 * @export
 * @returns
 */
export function quitAndInstall() {
  return mainUpdater.quitAndInstall();
}

/**
 * Start automatically checking for updates by interval
 *
 * @export
 * @returns
 */
export async function startAutoUpdate() {
  let checkGithubManual = false;
  if (process.platform === 'darwin') checkGithubManual = true;
  if (process.platform === 'linux') {
    const fileExist = fs.existsSync(
      path.join(assetsParentDir, 'app-update.yml')
    );
    if (!fileExist) {
      checkGithubManual = true;
    }
  }

  if (checkGithubManual) {
    clearTimeout(timerId);
    try {
      const response = await axios.get(
        'https://api.github.com/repos/Nexusoft/NexusInterface/releases/latest'
      );
      const latestVerion = response.data.tag_name;
      if (
        semver.lt('v' + APP_VERSION, latestVerion) &&
        response.data.prerelease === false
      ) {
        console.log(`New Version ${response.data.tag_name}, Click to download`);
        showBackgroundTask(AutoUpdateBackgroundTask, {
          version: response.data.tag_name,
          quitAndInstall: null,
          gitHub: true,
        });
      }
    } catch (e) {
      console.error(e);
    }
    timerId = setTimeout(startAutoUpdate, autoUpdateInterval);
  } else {
    try {
      clearTimeout(timerId);
      const result = await mainUpdater.checkForUpdates();
      if (result.downloadPromise) {
        await result.downloadPromise;
      }
    } finally {
      // Check for updates every 2 hours
      timerId = setTimeout(startAutoUpdate, autoUpdateInterval);
    }
  }
}

/**
 * Stop automatically checking for updates
 *
 * @export
 */
export function stopAutoUpdate() {
  clearTimeout(timerId);
  timerId = null;
}

/**
 * Initialize the Updater
 *
 */
export function initializeUpdater(autoUpdate) {
  mainUpdater.logger = log;
  mainUpdater.currentVersion = APP_VERSION;
  mainUpdater.autoDownload = true;
  mainUpdater.autoInstallOnAppQuit = false;
  if (process.env.NODE_ENV === 'development') {
    mainUpdater.updateConfigPath = path.join(
      process.cwd(),
      'dev-app-update.yml'
    );
  }
  mainUpdater.on('error', err => {
    console.error(err);
  });

  mainUpdater.on('update-available', updateInfo => {
    showNotification(
      __('New wallet version %{version} available. Downloading...', {
        version: updateInfo.version,
      }),
      'work'
    );
  });

  mainUpdater.on('update-downloaded', updateInfo => {
    stopAutoUpdate();
    showBackgroundTask(AutoUpdateBackgroundTask, {
      version: updateInfo.version,
      quitAndInstall: mainUpdater.quitAndInstall,
    });
  });

  mainUpdater.on('error', err => {
    setUpdaterState('idle');
  });
  mainUpdater.on('checking-for-update', () => {
    setUpdaterState('checking');
  });
  mainUpdater.on('update-available', () => {
    setUpdaterState('downloading');
  });
  mainUpdater.on('update-not-available', () => {
    setUpdaterState('idle');
  });
  mainUpdater.on('download-progress', () => {
    setUpdaterState('downloading');
  });
  mainUpdater.on('update-downloaded', () => {
    setUpdaterState('downloaded');
  });

  if (autoUpdate) {
    startAutoUpdate();
  }
}
