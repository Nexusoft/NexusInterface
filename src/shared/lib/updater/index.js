// External
import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import semver from 'semver';

// Internal
import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { showBackgroundTask, showNotification } from 'lib/ui';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';
import { assetsParentDir } from 'consts/paths';
import { walletEvents, closeWallet } from 'lib/wallet';

__ = __context('AutoUpdate');

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
  return ipcRenderer.invoke('check-for-updates');
}

/**
 * Quit wallet and install the update
 *
 * @export
 * @returns
 */
export function quitAndInstall() {
  closeWallet(() => ipcRenderer.invoke('quit-and-install-update'));
}

/**
 * Start automatically checking for updates by interval
 *
 * @export
 * @returns
 */
export async function startAutoUpdate() {
  const checkGithubManually = !fs.existsSync(
    path.join(assetsParentDir, 'app-update.yml')
  );

  if (process.env.NODE_ENV !== 'development' && checkGithubManually) {
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
      const result = await checkForUpdates();
      if (result && result.downloadPromise) {
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
walletEvents.once('post-render', function() {
  ipcRenderer.on('updater:update-available', (event, updateInfo) => {
    showNotification(
      __('New wallet version %{version} available. Downloading...', {
        version: updateInfo.version,
      }),
      'work'
    );
  });

  ipcRenderer.on('updater:update-downloaded', (event, updateInfo) => {
    stopAutoUpdate();
    showBackgroundTask(AutoUpdateBackgroundTask, {
      version: updateInfo.version,
      quitAndInstall: quitAndInstall,
    });
  });

  ipcRenderer.on('updater:error', (event, err) => {
    setUpdaterState('idle');
  });
  ipcRenderer.on('updater:checking-for-update', () => {
    setUpdaterState('checking');
  });
  ipcRenderer.on('updater:update-available', () => {
    setUpdaterState('downloading');
  });
  ipcRenderer.on('updater:update-not-available', () => {
    setUpdaterState('idle');
  });
  ipcRenderer.on('updater:download-progress', () => {
    setUpdaterState('downloading');
  });
  ipcRenderer.on('updater:update-downloaded', () => {
    setUpdaterState('downloaded');
  });

  const {
    settings: { autoUpdate },
  } = store.getState();
  if (autoUpdate) {
    startAutoUpdate();
  }
});
