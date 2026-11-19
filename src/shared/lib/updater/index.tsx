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
import { fetchGithubReleases } from 'lib/github';

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
 * Newest GitHub release above the running version, for installs without
 * app-update.yml. Pre-releases count when running one or when allowed
 */
async function findNewerGithubRelease() {
  const { allowPrerelease } = store.get(settingsAtom);
  const includePrerelease =
    allowPrerelease || !!semver.prerelease(APP_VERSION);
  const { data: releases } = await fetchGithubReleases(
    'Nexusoft/NexusInterface'
  );
  return releases
    .filter(
      (release) =>
        !release.draft &&
        (includePrerelease || !release.prerelease) &&
        semver.valid(release.tag_name) &&
        semver.lt(APP_VERSION, release.tag_name)
    )
    .sort((a, b) => semver.rcompare(a.tag_name, b.tag_name))[0];
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
          const latestRelease = await findNewerGithubRelease();
          if (latestRelease) {
            updateAvailable = true;
            showBackgroundTask(AutoUpdateBackgroundTask, {
              version: latestRelease.tag_name,
              gitHub: true,
            });
          }
        } else {
          //download runs in the main process, progress comes back as updater:* events
          const result = await ipcRenderer.invoke('check-for-updates');
          const version = result?.updateInfo?.version;
          if (version && semver.lt(APP_VERSION, version)) {
            updateAvailable = true;
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

  ipcRenderer.on('updater:error', (_event, err) => {
    console.error('Error Downloading Wallet Update:', err);
    store.set(updaterStateAtom, 'idle');
    showNotification(
      `${__('Wallet update failed')}: ${
        typeof err === 'string' ? err : err?.message || __('Unknown error')
      }`,
      'error'
    );
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
