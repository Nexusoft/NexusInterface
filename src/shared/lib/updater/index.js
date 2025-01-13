// External
import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import semver from 'semver';

// Internal
import * as TYPE from 'consts/actionTypes';
import store, { jotaiStore } from 'store';
import { showBackgroundTask, showNotification } from 'lib/ui';
import { updateSettings, settingsAtom } from 'lib/settings';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';
import { assetsParentDir } from 'consts/paths';
import { closeWallet } from 'lib/wallet';
import { checkForModuleUpdates } from 'lib/modules';

__ = __context('AutoUpdate');

const autoUpdateInterval = 4 * 60 * 60 * 1000; // 4 hours
let timerId = null;

const setUpdaterState = (state) => {
  store.dispatch({
    type: TYPE.SET_UPDATER_STATE,
    payload: state,
  });
};

/**
 * Quit wallet and install the update
 *
 * @export
 * @returns
 */
export function quitAndInstall() {
  closeWallet(() => ipcRenderer.invoke('quit-and-install-update'));
}

export function setAllowPrerelease(value) {
  updateSettings('allowPrerelease', value);
  ipcRenderer.invoke('set-allow-prerelease', value);
}

export function migrateToMainnet() {
  updateSettings('allowPrerelease', true);
  ipcRenderer.invoke('migrate-to-mainnet', null);
}

/**
 * Start automatically checking for updates by interval
 *
 * @export
 * @returns
 */
export async function checkForUpdates() {
  const checkGithubManually = !fs.existsSync(
    path.join(assetsParentDir, 'app-update.yml')
  );
  clearTimeout(timerId);

  try {
    await Promise.all([
      (async () => {
        if (process.env.NODE_ENV !== 'development' && checkGithubManually) {
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
        } else {
          const result = await ipcRenderer.invoke('check-for-updates');
          if (result && result.downloadPromise) {
            await result.downloadPromise;
          }
        }
      })(),
      checkForModuleUpdates(),
    ]);
  } catch (e) {
    console.error(e);
  } finally {
    updateSettings('lastCheckForUpdates', Date.now());

    const { autoUpdate } = jotaiStore.get(settingsAtom);
    if (autoUpdate) {
      clearTimeout(timerId);
      timerId = setTimeout(checkForUpdates, autoUpdateInterval);
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
export function prepareUpdater() {
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
    console.error(
      'Error Downloading Wallet Update:\n',
      'Event: ',
      event,
      '\nError: ',
      err
    );
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

  const { autoUpdate, lastCheckForUpdates } = jotaiStore.get(settingsAtom);
  if (autoUpdate) {
    const timeFromLastCheck = Date.now() - lastCheckForUpdates;
    if (!lastCheckForUpdates || timeFromLastCheck > autoUpdateInterval) {
      checkForUpdates();
    } else {
      setTimeout(checkForUpdates, autoUpdateInterval - timeFromLastCheck);
    }
  }
}
