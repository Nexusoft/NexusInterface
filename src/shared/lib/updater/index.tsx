// External
import semver from 'semver';
import { atom } from 'jotai';

// Internal
import { store } from 'lib/store';
import { showBackgroundTask, showNotification } from 'lib/ui';
import { updateSettings, settingsAtom } from 'lib/settings';
import AutoUpdateBackgroundTask from './AutoUpdateBackgroundTask';
import { walletClosingAtom } from 'lib/wallet';
import { coreInfoPausedAtom } from 'lib/coreInfo';
import { checkForModuleUpdates } from 'lib/modules';

__ = __context('AutoUpdate');

const autoUpdateInterval = 4 * 60 * 60 * 1000; // 4 hours
let timerId: ReturnType<typeof setTimeout> | undefined = undefined;

export type UpdaterState = 'idle' | 'checking' | 'downloading' | 'downloaded';

export const updaterStateAtom = atom<UpdaterState>('idle');

/**
 * Quit wallet and install the update.
 * Main-process quitAndInstall stops Core and exits; do not also call
 * app.exit via closeWallet or the two paths race and the installer may never run.
 */
export function quitAndInstall() {
  store.set(walletClosingAtom, true);
  store.set(coreInfoPausedAtom, true);
  void window.nexusElectron.updater.quitAndInstall();
}

export function setAllowPrerelease(value: boolean) {
  updateSettings({ allowPrerelease: value });
  void window.nexusElectron.updater.setAllowPrerelease(value);
}

export function migrateToMainnet() {
  updateSettings({ allowPrerelease: true });
  void window.nexusElectron.updater.migrateToMainnet();
}

/**
 * Start automatically checking for updates by interval
 */
export async function checkForUpdates() {
  clearTimeout(timerId);

  try {
    await Promise.all([
      (async () => {
        let updateAvailable = false;
        const result = (await window.nexusElectron.updater.check()) as {
          mode?: 'disabled' | 'github' | 'auto';
          release?: { tagName: string; prerelease: boolean };
          updateInfo?: { version?: string };
        };
        if (result.mode === 'github' && result.release) {
          const latestVersion = result.release.tagName;
          if (
            semver.lt('v' + APP_VERSION, latestVersion) &&
            result.release.prerelease === false
          ) {
            updateAvailable = true;
            showBackgroundTask(AutoUpdateBackgroundTask, {
              version: latestVersion,
              gitHub: true,
            });
          }
        } else if (result.mode === 'auto') {
          const version = result.updateInfo?.version;
          // Not sure if this is the best way to check if there's an update
          // available because autoUpdater.checkForUpdates() doesn't return
          // any reliable results like a boolean `updateAvailable` property
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
  window.nexusElectron.updaterEvents.onAvailable((updateInfo: any) => {
    showNotification(
      __('New wallet version %{version} available. Downloading...', {
        version: updateInfo.version,
      }),
      'work'
    );
  });

  window.nexusElectron.updaterEvents.onDownloaded((updateInfo: any) => {
    stopAutoUpdate();
    showBackgroundTask(AutoUpdateBackgroundTask, {
      version: updateInfo.version,
      quitAndInstall,
    });
  });

  window.nexusElectron.updaterEvents.onError((err) => {
    console.error(
      'Error Downloading Wallet Update:\n',
      '\nError: ',
      err
    );
    store.set(updaterStateAtom, 'idle');
  });
  window.nexusElectron.updaterEvents.onChecking(() => {
    store.set(updaterStateAtom, 'checking');
  });
  window.nexusElectron.updaterEvents.onAvailable(() => {
    store.set(updaterStateAtom, 'downloading');
  });
  window.nexusElectron.updaterEvents.onNotAvailable(() => {
    store.set(updaterStateAtom, 'idle');
  });
  window.nexusElectron.updaterEvents.onDownloadProgress(() => {
    store.set(updaterStateAtom, 'downloading');
  });
  window.nexusElectron.updaterEvents.onDownloaded(() => {
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
