// External
import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs';
import semver from 'semver';
import { atom } from 'jotai';

// Internal
import { store } from 'lib/store';
import { showBackgroundTask, showNotification } from 'lib/ui';
import { updateSettings, settingsAtom } from 'lib/settings';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';
import { assetsParentDir } from 'consts/paths';
import { closeWallet } from 'lib/wallet';
import { checkForModuleUpdates } from 'lib/modules';
import { fetchGithubLatestRelease } from 'lib/github';

__ = __context('AutoUpdate');

const autoUpdateInterval = 4 * 60 * 60 * 1000; // 4 hours
let timerId: NodeJS.Timeout | undefined = undefined;

export type UpdaterState = 'idle' | 'checking' | 'downloading' | 'downloaded';

export const updaterStateAtom = atom<UpdaterState>('idle');

/**
 * Quit wallet and install the update
 */
export function quitAndInstall() {
  closeWallet(() => ipcRenderer.invoke('quit-and-install-update'));
}

export function setAllowPrerelease(value: boolean) {
  updateSettings({ allowPrerelease: value });
  ipcRenderer.invoke('set-allow-prerelease', value);
}

export function migrateToMainnet() {
  updateSettings({ allowPrerelease: true });
  ipcRenderer.invoke('migrate-to-mainnet', null);
}

/**
 * Start automatically checking for updates by interval
 */
export async function checkForUpdates() {
  const checkGithubManually = !fs.existsSync(
    path.join(assetsParentDir, 'app-update.yml')
  );
  clearTimeout(timerId);

  try {
    await Promise.all([
      (async () => {
        if (process.env.NODE_ENV === 'development') return;
        let updateAvailable = false;
        if (process.env.NODE_ENV !== 'development' && checkGithubManually) {
          const response = await fetchGithubLatestRelease(
            'Nexusoft/NexusInterface'
          );
          const latestVerion = response.data.tag_name;
          if (
            semver.lt('v' + APP_VERSION, latestVerion) &&
            response.data.prerelease === false
          ) {
            updateAvailable = true;
            showBackgroundTask(AutoUpdateBackgroundTask, {
              version: response.data.tag_name,
              gitHub: true,
            });
          }
        } else {
          const result = await ipcRenderer.invoke('check-for-updates');
          const version = result?.updateInfo?.version;

          // Not sure if this is the best way to check if there's an update
          // available because autoUpdater.checkForUpdates() doesn't return
          // any reliable results like a boolean `updateAvailable` property
          if (version && semver.lt(APP_VERSION, version)) {
            updateAvailable = true;
            if (result?.downloadPromise) {
              await result.downloadPromise;
            }
          }
        }

        if (!updateAvailable) {
          showNotification(__('There are currently no updates available'));
        }
      })(),
      checkForModuleUpdates(),
    ]);
  } catch (e) {
    console.error(e);
  } finally {
    updateSettings({ lastCheckForUpdates: Date.now() });

    const { autoUpdate } = store.get(settingsAtom);
    if (autoUpdate) {
      clearTimeout(timerId);
      timerId = setTimeout(checkForUpdates, autoUpdateInterval);
    }
  }
}

/**
 * Stop automatically checking for updates
 */
export function stopAutoUpdate() {
  clearTimeout(timerId);
  timerId = undefined;
}

/**
 * Initialize the Updater
 *
 */
export function prepareUpdater() {
  ipcRenderer.on('updater:update-available', (_event, updateInfo) => {
    showNotification(
      __('New wallet version %{version} available. Downloading...', {
        version: updateInfo.version,
      }),
      'work'
    );
  });

  ipcRenderer.on('updater:update-downloaded', (_event, updateInfo) => {
    stopAutoUpdate();
    showBackgroundTask(AutoUpdateBackgroundTask, {
      version: updateInfo.version,
      quitAndInstall,
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
    store.set(updaterStateAtom, 'idle');
  });
  ipcRenderer.on('updater:checking-for-update', () => {
    store.set(updaterStateAtom, 'checking');
  });
  ipcRenderer.on('updater:update-available', () => {
    store.set(updaterStateAtom, 'downloading');
  });
  ipcRenderer.on('updater:update-not-available', () => {
    store.set(updaterStateAtom, 'idle');
  });
  ipcRenderer.on('updater:download-progress', () => {
    store.set(updaterStateAtom, 'downloading');
  });
  ipcRenderer.on('updater:update-downloaded', () => {
    store.set(updaterStateAtom, 'downloaded');
  });

  const { autoUpdate, lastCheckForUpdates } = store.get(settingsAtom);
  if (autoUpdate) {
    const timeFromLastCheck = lastCheckForUpdates
      ? Date.now() - lastCheckForUpdates
      : 0;
    if (!lastCheckForUpdates || timeFromLastCheck > autoUpdateInterval) {
      checkForUpdates();
    } else {
      setTimeout(checkForUpdates, autoUpdateInterval - timeFromLastCheck);
    }
  }
}
